import type { EmbeddingService, RetrievalOptions, RetrievalResult, RetrieverService, VectorStoreService } from '../types'

/**
 * 全文检索查询接口
 * 由外部（如 Prisma）提供实现
 */
export interface FulltextSearchProvider {
    /**
     * 执行全文检索
     */
    search(options: { query: string; knowledgeBaseIds: string[]; topK: number }): Promise<RetrievalResult[]>
}

/**
 * 混合检索器
 * 支持向量检索、全文检索、混合检索三种模式
 */
export class HybridRetriever implements RetrieverService {
    private vectorStore: VectorStoreService
    private fulltextSearchProvider?: FulltextSearchProvider
    private embeddingService: EmbeddingService

    constructor(embeddingService: EmbeddingService, vectorStore: VectorStoreService, fulltextSearchProvider?: FulltextSearchProvider) {
        this.vectorStore = vectorStore
        this.embeddingService = embeddingService
        this.fulltextSearchProvider = fulltextSearchProvider
    }

    /**
     * 执行检索
     */
    async retrieve(options: RetrievalOptions): Promise<RetrievalResult[]> {
        const { query, knowledgeBaseIds, mode, topK, threshold = 0.5, vectorWeight = 0.7 } = options

        if (!query || query.trim().length === 0) {
            throw new Error('Query cannot be empty')
        }

        if (!knowledgeBaseIds || knowledgeBaseIds.length === 0) {
            throw new Error('Knowledge base IDs cannot be empty')
        }

        switch (mode) {
            case 'vector':
                return this.vectorSearch(query, knowledgeBaseIds, topK, threshold)
            case 'hybrid':
                return this.hybridSearch(query, knowledgeBaseIds, topK, threshold, vectorWeight)
            case 'fulltext':
                return this.fulltextSearch(query, knowledgeBaseIds, topK)
            default:
                throw new Error(`Unsupported retrieval mode: ${mode}`)
        }
    }

    /**
     * 向量检索
     */
    private async vectorSearch(query: string, knowledgeBaseIds: string[], topK: number, threshold: number): Promise<RetrievalResult[]> {
        try {
            // 生成查询向量
            const queryVector = await this.embeddingService.embedText(query.trim())

            // 向量搜索
            const result = await this.vectorStore.search({ vector: queryVector, knowledgeBaseIds, topK, threshold })

            return result.map(t => ({
                chunkId: t.chunkId,
                content: t.content,
                chunkIndex: t.chunkIndex,
                documentId: t.documentId,
                knowledgeBaseId: t.knowledgeBaseId,
                score: t.score,
                metadata: t.metadata,
            }))
        } catch (error) {
            throw new Error(`Vector search failed: ${error instanceof Error ? error.message : String(error)}`)
        }
    }

    /**
     * 全文检索
     */
    private async fulltextSearch(query: string, knowledgeBaseIds: string[], topK: number): Promise<RetrievalResult[]> {
        if (!this.fulltextSearchProvider) {
            throw new Error('Fulltext search provider is not configured')
        }

        try {
            return await this.fulltextSearchProvider.search({ query: query.trim(), knowledgeBaseIds, topK })
        } catch (error) {
            throw new Error(`Fulltext search failed: ${error instanceof Error ? error.message : String(error)}`)
        }
    }

    /**
     * 混合检索
     * 结合向量检索和全文检索的结果
     */
    private async hybridSearch(
        query: string,
        knowledgeBaseIds: string[],
        topK: number,
        threshold: number,
        vectorWeight: number
    ): Promise<RetrievalResult[]> {
        // 获取两种检索的结果（获取更多结果用于融合）
        const expandedTopK = Math.ceil(topK * 1.5)

        const [vectorResults, fulltextResults] = await Promise.all([
            this.vectorSearch(query, knowledgeBaseIds, expandedTopK, threshold),
            this.fulltextSearchProvider ? this.fulltextSearchProvider.search({ query: query.trim(), knowledgeBaseIds, topK }) : [],
        ])

        // 如果没有全文检索结果，直接返回向量检索结果
        if (fulltextResults.length === 0) {
            return vectorResults.slice(0, topK)
        }

        // 对向量检索结果和全文检索结果进行融合
        const fusedResults = this.reciprocalRankFusion(vectorResults, fulltextResults, vectorWeight)
        return fusedResults.slice(0, topK)
    }

    /**
     * Reciprocal Rank Fusion (RRF)
     * 融合多个排序列表
     */
    private reciprocalRankFusion(
        vectorResults: RetrievalResult[],
        fulltextResults: RetrievalResult[],
        vectorWeight: number
    ): RetrievalResult[] {
        const k = 60 // RRF 常数
        const fulltextWeight = 1 - vectorWeight
        const scoreMap = new Map<string, { result: RetrievalResult; score: number }>()

        // 处理向量检索结果
        vectorResults.forEach((result, index) => {
            const rrfScore = vectorWeight / (k + index + 1)
            const existing = scoreMap.get(result.chunkId)

            if (existing) {
                existing.score += rrfScore
            } else {
                scoreMap.set(result.chunkId, { result, score: rrfScore })
            }
        })

        // 处理全文检索结果
        fulltextResults.forEach((result, index) => {
            const rrfScore = fulltextWeight / (k + index + 1)
            const existing = scoreMap.get(result.chunkId)

            if (existing) {
                existing.score += rrfScore
            } else {
                scoreMap.set(result.chunkId, { result, score: rrfScore })
            }
        })

        return Array.from(scoreMap.values())
            .sort((a, b) => b.score - a.score)
            .map(t => ({ ...t.result, score: t.score }))
    }
}

/**
 * 创建混合检索器实例
 */
export function createHybridRetriever(
    embeddingService: EmbeddingService,
    vectorStore: VectorStoreService,
    fulltextProvider?: FulltextSearchProvider
): RetrieverService {
    return new HybridRetriever(embeddingService, vectorStore, fulltextProvider)
}
