/**
 * 作为 ai-engine 与 插件 的桥接系统
 * 执行流程： 解析workflow.node中所有 plugin:* 类型的节点 -> 加载插件 -> 为每个插件节点创建 NodeExecutor
 * -> 注册插件执行器/校验器
 */

import { PluginNodeExecutor, PluginPermission } from '@aiflow/plugin-core'
import { ExecutionContext, ExecutionLogger, NodeExecutionResult, NodeExecutor, NodeKind, WorkflowDefinition } from '@aiflow-demo/ai-engine'

import { PluginLoader, PluginModule } from '../loader'
import { parsePluginNodeType } from '../utils'

/**  */
export type PluginRuntimeAiEngineErrorCode =
    | 'PLUGIN_NOT_INSTALLED'
    | 'PLUGIN_PERMISSION_DENIED'
    | 'PLUGIN_LOAD_FAILED'
    | 'PLUGIN_EXECUTOR_NOT_FOUND'

export class PluginRuntimeAiEngineError extends Error {
    readonly code: PluginRuntimeAiEngineErrorCode
    readonly details?: Record<string, unknown>
    constructor(code: PluginRuntimeAiEngineErrorCode, message: string, details?: Record<string, unknown>) {
        super(message)
        this.name = 'PluginRuntimeAiEngineError'
        this.code = code
        this.details = details
    }
}

export interface PluginInstallationRecord {
    pluginId: string
    version: string
    permissions: PluginPermission[]
    manifestUrl: string
    executorUrl: string
}

export interface AiEngineLike {
    getRegistry(): {
        register(type: NodeKind, executor: NodeExecutor): void
    }
    workflowValidator?: {
        registerValidator(validator: {
            type: string
            validate(config: Record<string, unknown>): { valid: boolean; errors?: string[] }
        }): void
    }
}

export interface RegisterPluginNodesForAiEngineOptions {
    engine: AiEngineLike
    workflow: WorkflowDefinition
    installations: PluginInstallationRecord[]
    loader: PluginLoader
}

export async function registerPluginNodesForAiEngine(options: RegisterPluginNodesForAiEngineOptions): Promise<void> {
    // 1. 筛选出所有的plugin节点
    const pluginNodeEntries = options.workflow.nodes
        .map(node => ({ node, parsed: parsePluginNodeType(node.type) }))
        .filter((entry): entry is { node: WorkflowDefinition['nodes'][number]; parsed: { pluginId: string; nodeType: string } } => {
            return Boolean(entry.parsed)
        })

    // 2. 构建已安装的插件
    const installationMap = new Map(options.installations.map(item => [item.pluginId, item]))
    const loadedModules = new Map<string, PluginModule>()

    for (const entry of pluginNodeEntries) {
        // 判断插件节点有没有安装
        const installation = installationMap.get(entry.parsed.pluginId)
        if (!installation) {
            throw new PluginRuntimeAiEngineError('PLUGIN_NOT_INSTALLED', `插件未安装或未启用: ${entry.parsed.pluginId}`, {
                pluginId: entry.parsed.pluginId,
            })
        }

        //3.  加载插件
        let loadedModule = loadedModules.get(entry.parsed.pluginId)
        if (!loadedModule) {
            loadedModule = await loadInstalledPluginModule(options.loader, installation)
            loadedModules.set(entry.parsed.pluginId, loadedModule)
        }

        // 4. 获取插件执行器
        const pluginExecutor = loadedModule.executors.get(entry.parsed.nodeType)
        if (!pluginExecutor) {
            throw new PluginRuntimeAiEngineError(
                'PLUGIN_EXECUTOR_NOT_FOUND',
                `插件 ${installation.pluginId} 中未找到节点执行器: ${entry.parsed.nodeType}`,
                {
                    pluginId: installation.pluginId,
                    version: installation.version,
                    nodeType: entry.parsed.nodeType,
                }
            )
        }

        // 5. 注册插件执行器到ai-engine
        const fullNodeType = entry.node.type as NodeKind
        options.engine.getRegistry().register(
            fullNodeType,
            createAiEnginePluginExecutor({
                fullNodeType,
                pluginId: installation.pluginId,
                runtimeNodeType: entry.parsed.pluginId,
                pluginExecutor,
                pluginModule: loadedModule,
            })
        )

        // 6. 注册插件校验到ai-engine
        options.engine.workflowValidator?.registerValidator({
            type: fullNodeType,
            validate(config: Record<string, unknown>) {
                return pluginExecutor.validate?.(config) || { valid: true }
            },
        })
    }
}

async function loadInstalledPluginModule(loader: PluginLoader, installation: PluginInstallationRecord): Promise<PluginModule> {
    const loadResult = await loader.loadFromUrls({
        pluginId: installation.pluginId,
        version: installation.version,
        manifestUrl: installation.manifestUrl,
        executorUrl: installation.executorUrl,
        grantedPermissions: installation.permissions,
    })

    if (loadResult.success && loadResult.module) {
        return loadResult.module
    }

    if (loadResult.error?.startsWith('Permission denied:')) {
        throw new PluginRuntimeAiEngineError('PLUGIN_PERMISSION_DENIED', loadResult.error, {
            pluginId: installation.pluginId,
            version: installation.version,
        })
    }

    throw new PluginRuntimeAiEngineError(
        'PLUGIN_LOAD_FAILED',
        `加载插件执行器失败: ${installation.pluginId}@${installation.version}${loadResult.error ? ` - ${loadResult.error}` : ''}`,
        {
            pluginId: installation.pluginId,
            version: installation.version,
            error: loadResult.error,
        }
    )
}

function createAiEnginePluginExecutor(options: {
    fullNodeType: NodeKind
    pluginId: string
    runtimeNodeType: string
    pluginExecutor: PluginNodeExecutor
    pluginModule: PluginModule
}): NodeExecutor<Record<string, unknown>> {
    return {
        type: options.fullNodeType,
        async execute(nodeId, config, context, logger): Promise<NodeExecutionResult> {
            const startTime = Date.now()
            logger.nodeStart(nodeId, options.fullNodeType, config)
            try {
                // 1. 解析变量
                const resolvedConfig = resolveConfigVariables(config, context, logger)

                // 2. 收集上游输出
                const nodeInputs = collectNodeInputs(nodeId, context)

                // 3. 创建 logger 日志
                const pluginLogger = createPluginLogger(options.pluginId, logger)

                // 4. 执行节点
                const result = await options.pluginExecutor.execute({
                    nodeId,
                    nodeType: options.fullNodeType,
                    workflowId: context.workflow.id,
                    executionId: context.executionId,
                    inputs: nodeInputs,
                    config: resolvedConfig,
                    logger: pluginLogger,
                    services: options.pluginModule.sandbox.getServices(),
                })

                // 5. 返回结果
                const outputs = isRecord(result.outputs) ? result.outputs : {}
                const finalResult: NodeExecutionResult = {
                    success: result.success,
                    outputs,
                    duration: Date.now() - startTime,
                    error: result.success ? undefined : new Error(result.error || '插件执行失败'),
                }

                if (finalResult.success) {
                    context.variables.setNodeOutputs(nodeId, outputs)
                }
                logger.nodeEnd(nodeId, finalResult)

                return finalResult
            } catch (error) {
                const finalResult: NodeExecutionResult = {
                    success: false,
                    outputs: {},
                    error: error instanceof Error ? error : new Error(String(error)),
                    duration: Date.now() - startTime,
                }

                logger.nodeEnd(nodeId, finalResult)
                return finalResult
            }
        },
        validate(config) {
            return options.pluginExecutor.validate?.(config) || { valid: true }
        },
    }
}

function createPluginLogger(pluginId: string, logger: ExecutionLogger) {
    return {
        debug(message: string, ...args: unknown[]) {
            logger.debug(`[Plugin:${pluginId}] ${message}`, toLogData(args))
        },
        info(message: string, ...args: unknown[]) {
            logger.info(`[Plugin:${pluginId}] ${message}`, toLogData(args))
        },
        warn(message: string, ...args: unknown[]) {
            logger.warn(`[Plugin:${pluginId}] ${message}`, toLogData(args))
        },
        error(message: string, ...args: unknown[]) {
            logger.error(`[Plugin:${pluginId}] ${message}`, toLogData(args))
        },
    }
}

function collectNodeInputs(nodeId: string, context: ExecutionContext): Record<string, unknown> {
    const nodeInputs: Record<string, unknown> = {}
    for (const upstreamNodeId of context.getUpstreamNodes(nodeId)) {
        const nodeOutput = context.variables.getNodeOutputs(upstreamNodeId)
        if (nodeInputs) {
            Object.assign(nodeInputs, nodeOutput)
        }
    }

    return nodeInputs
}

function resolveConfigVariables(
    config: Record<string, unknown>,
    context: ExecutionContext,
    logger: ExecutionLogger
): Record<string, unknown> {
    return deepResolve(config, context, logger) as Record<string, unknown>
}

function deepResolve(value: unknown, context: ExecutionContext, logger: ExecutionLogger): unknown {
    if (typeof value === 'string') {
        const resolved = context.resolveText(value)
        if (resolved !== value) {
            logger.variableResolve(value, value, resolved)
        }
        return resolved
    }

    if (Array.isArray(value)) {
        return value.map(item => deepResolve(item, context, logger))
    }

    if (isRecord(value)) {
        return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, deepResolve(item, context, logger)]))
    }

    return value
}

function toLogData(args: unknown[]): Record<string, unknown> | undefined {
    if (args.length === 0) {
        return undefined
    }

    return {
        args,
    }
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}
