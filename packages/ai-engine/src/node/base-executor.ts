import {
    ExecutionContext,
    ExecutionLogger,
    NodeExecutionResult,
    NodeExecutor,
    NodeKind,
    OutputVariableSchema,
    ValidationResult,
} from '../types'

/**
 * 节点执行器基类
 * 提供通用的执行逻辑和工具方法
 */
export abstract class BaseNodeExecutor<TConfig = Record<string, unknown>> implements NodeExecutor<TConfig> {
    abstract readonly type: NodeKind

    /**
     * 子类实现具体执行逻辑
     */
    protected abstract doExecute(
        nodeId: string,
        config: TConfig,
        context: ExecutionContext,
        logger: ExecutionLogger
    ): Promise<NodeExecutionResult>

    /**
     * 执行节点（带错误处理和计时）
     */
    async execute(nodeId: string, config: TConfig, context: ExecutionContext, logger: ExecutionLogger): Promise<NodeExecutionResult> {
        const startTime = Date.now()
        try {
            logger.nodeStart(nodeId, this.type, config)
            const result = await this.doExecute(nodeId, config, context, logger)

            // 存储节点输出到上下文
            if (result.success) {
                context.variables.setNodeOutputs(nodeId, result.outputs)
            }

            const finalResult = {
                ...result,
                duration: Date.now() - startTime,
            }

            logger.nodeEnd(nodeId, finalResult)

            return finalResult
        } catch (error) {
            const result: NodeExecutionResult = {
                success: false,
                error: error instanceof Error ? error : new Error(String(error)),
                outputs: {},
                duration: Date.now() - startTime,
            }
            logger.nodeEnd(nodeId, result)
            return result
        }
    }
    /**
     * 默认验证实现（子类可重写）
     */
    validate(_config: TConfig): ValidationResult {
        return { valid: true }
    }

    /**
     * 获取输出 schema（子类可重写）
     */
    getOutputSchema?(_config: TConfig): OutputVariableSchema[] {
        return []
    }

    /**
     * 解析配置中的变量
     */
    protected resolveConfigVariables(config: TConfig, context: ExecutionContext, logger: ExecutionLogger): TConfig {
        return this.deepResolve(config, context, logger)
    }

    /**
     * 深度解析对象中的变量
     */
    protected deepResolve(config: unknown, context: ExecutionContext, logger: ExecutionLogger): any {
        if (typeof config === 'string') {
            const resolved = context.resolveText(config)
            if (resolved !== config) {
                logger.variableResolve(config, config, resolved)
            }
            return resolved
        }

        if (Array.isArray(config)) {
            return config.map(c => this.deepResolve(c, context, logger))
        }

        if (config !== null && typeof config === 'object') {
            const result: Record<string, unknown> = {}
            for (const [key, value] of Object.entries(config)) {
                result[key] = this.deepResolve(value, context, logger)
            }
            return result
        }

        return config
    }
}
