/**
 * 作为 ai-engine 与 插件 的桥接系统
 * 执行流程： 解析workflow.node中所有 plugin:* 类型的节点 -> 加载插件 -> 为每个插件节点创建 NodeExecutor
 * -> 注册插件执行器/校验器
 */

import { PluginNodeExecutor, PluginPermission } from '@aiflow/plugin-core'
import { ExecutionLogger, NodeExecutor, NodeKind, WorkflowDefinition } from '@aiflow-demo/ai-engine'

import { PluginLoader, PluginModule } from '../loader'

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

export async function registerPluginNodesForAiEngine(options: RegisterPluginNodesForAiEngineOptions): Promise<void> {}

async function loadInstalledPluginModule(loader: PluginLoader, installations: PluginInstallationRecord): Promise<PluginModule> {}

function createAiEnginePluginExecutor(options: {
    fullNodeType: NodeKind
    pluginId: string
    runtimeNodeType: string
    pluginExecutor: PluginNodeExecutor
    pluginModule: PluginModule
}): NodeExecutor<Record<string, unknown>> {}

function createPluginLogger(pluginId: string, logger: ExecutionLogger) {}

function collectNodeInputs(nodeId: string, context: ExecutionContext): Record<string, unknown> {}

function resolveConfigVariables(
    config: Record<string, unknown>,
    context: ExecutionContext,
    logger: ExecutionLogger
): Record<string, unknown> {}

function deepResolve(value: unknown, context: ExecutionContext, logger: ExecutionLogger): unknown {}

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
