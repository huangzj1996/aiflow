import { createHybridRetriever, createOllamaEmbeddingService, createQdrantVectorStore } from '../../knowledge'
import {
    ExecutionContext,
    ExecutionLogger,
    KnowledgeNodeConfig,
    NodeExecutionResult,
    NodeKind,
    OutputVariableSchema,
    ValidationResult,
} from '../../types'
import { BaseNodeExecutor } from '../base-executor'

/**
 * 知识库检索结果
 */
interface RetrievalResultItem {
    chunkId: string
    content: string
    score: number
    chunkIndex: number
    documentId: string
    knowledgeBaseId: string
}

/**
 * 知识库节点执行器
 * 从知识库中检索相关内容
 */
export class KnowledgeExecutor extends BaseNodeExecutor<KnowledgeNodeConfig> {
    readonly type = 'knowledge' as const

    // 知识库配置（可通过环境变量或配置注入）
    private qdrantUrl: string
    private embeddingModel: string
    private embeddingDimensions: number

    constructor(options?: { qdrantUrl?: string; embeddingModel: string; embeddingDimensions: number }) {
        super()
        this.qdrantUrl = options?.qdrantUrl || process.env.QDRANT_URL || 'http://10.110.147.104:6333'
        this.embeddingModel = options?.embeddingModel || 'mxbai-embed-large:latest'
        this.embeddingDimensions = options?.embeddingDimensions || 1024
    }

    protected async doExecute(
        nodeId: string,
        config: KnowledgeNodeConfig,
        context: ExecutionContext,
        logger: ExecutionLogger
    ): Promise<NodeExecutionResult> {
        // 解析配置中的变量
        const resolvedConfig = this.resolveConfigVariables(config, context, logger)

        const { query, knowledgeBaseIds, retrievalMode, topK, threshold = 0.2, outputFormat } = resolvedConfig

        // 验证配置
        if (!knowledgeBaseIds || knowledgeBaseIds.length === 0) {
            throw new Error('Knowledge base IDs are required')
        }

        if (!query || query.trim().length === 0) {
            throw new Error('Query is required')
        }

        // 记录检索请求
        logger.info(`Knowledge retrieval: query="${query}", mode=${retrievalMode}, topK=${topK}`, { nodeId })

        const startTime = Date.now()

        // 初始化服务
        const embeddingService = createOllamaEmbeddingService({
            model: this.embeddingModel,
            dimensions: this.embeddingDimensions,
        })

        const vectorStore = createQdrantVectorStore({
            url: this.qdrantUrl,
            collectionName: 'knowledge_chunks',
        })

        // 创建全文检索提供者
        const fulltextProvider = {
            async search(options: { query: string; knowledgeBaseIds: string[]; topK: number }) {
                const result = await (vectorStore as any).textSearch({
                    query: options.query,
                    knowledgeBaseIds: options.knowledgeBaseIds,
                    topK: options.topK,
                })

                return result
            },
        }

        const retriever = createHybridRetriever(embeddingService, vectorStore, fulltextProvider)

        // 执行检索
        const result = await retriever.retrieve({
            query: query.trim(),
            knowledgeBaseIds,
            mode: retrievalMode,
            topK,
            threshold,
        })

        const duration = Date.now() - startTime

        // 格式化输出
        let output: string
        let resultData: RetrievalResultItem[]

        // eslint-disable-next-line prefer-const
        resultData = result.map(r => ({
            chunkId: r.chunkId,
            chunkIndex: r.chunkIndex,
            score: r.score,
            content: r.content,
            documentId: r.documentId,
            knowledgeBaseId: r.knowledgeBaseId,
        }))

        if (outputFormat === 'text') {
            output = result.map((r, i) => `[${i + 1}] ${r.content}`).join('\n\n')
        } else {
            output = JSON.stringify(resultData, null, 2)
        }

        // 记录检索结果
        logger.info(`Retrieved ${result.length} chunks in ${duration}ms`, { nodeId, count: result.length })

        return {
            success: true,
            outputs: {
                output,
                results: resultData,
                count: result.length,
                query,
                mode: retrievalMode,
            },
            duration,
        }
    }
    override validate(config: KnowledgeNodeConfig): ValidationResult {
        const errors: string[] = []

        if (!config.knowledgeBaseIds || config.knowledgeBaseIds.length === 0) {
            errors.push('At least one knowledge base must be selected')
        }

        if (!config.query || config.query.trim().length === 0) {
            errors.push('Query is required')
        }

        if (config.topK && (config.topK < 1 || config.topK > 20)) {
            errors.push('Top K must be between 1 and 20')
        }

        if (config.threshold !== undefined && (config.threshold < 0 || config.threshold > 1)) {
            errors.push('Threshold must be between 0 and 1')
        }

        return {
            valid: errors.length === 0,
            errors,
        }
    }

    override getOutputSchema(): OutputVariableSchema[] {
        return [
            { name: 'output', type: 'string', description: '检索结果（文本或 JSON 格式）' },
            { name: 'results', type: 'array', description: '检索结果数组' },
            { name: 'count', type: 'number', description: '检索到的结果数量' },
            { name: 'query', type: 'string', description: '实际执行的查询内容' },
            { name: 'mode', type: 'string', description: '使用的检索模式' },
        ]
    }
}
