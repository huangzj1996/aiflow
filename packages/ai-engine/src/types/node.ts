import { ExecutionLogger, NodeExecutionResult } from './logger'
import { NodeKind, ValidationResult, WorkflowDefinition, WorkflowInput } from './workflow'

/** 输出变量模式 */
export interface OutputVariableSchema {
    name: string
    type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'any'
    description?: string
}

/** 变量存储接口 */
export interface VariableStore {
    /** 获取变量值 */
    get(nodeId: string, variableName: string): unknown
    /** 设置变量值 */
    set(nodeId: string, variableName: string, value: unknown): void

    /** 获取节点所有输出 */
    getNodeOutputs(nodeId: string): Record<string, unknown> | undefined

    /** 设置节点所有输出 */
    setNodeOutputs(nodeId: string, outputs: Record<string, unknown>): void
    /** 获取所有变量（用于调试） */
    getAll(): Map<string, Record<string, unknown>>
}

/** 执行上下文接口 */
export interface ExecutionContext {
    /** 执行上下文ID */
    readonly executionId: string
    /** 工作流定义 */
    readonly workflow: WorkflowDefinition
    /** 变量存储 */
    readonly variables: VariableStore
    /** 工作流输入 */
    readonly inputs: WorkflowInput
    /** 执行开始时间 */
    readonly startTime: Date
    /** 解析变量表达式 */
    resolveVariable(expression: string): unknown
    /** 解析文本中的变量引用 */
    resolveText(text: string): string
    /** 获取节点的所有上游节点 */
    getUpstreamNodes(nodeId: string): string[]
    /** 检查节点是否已完成 */
    isNodeCompleted(nodeId: string): boolean
    /** 标记节点为已完成 */
    markNodeCompleted(nodeId: string): void
}
/**
 * 节点执行器接口
 */

export interface NodeExecutor<TConfig = Record<string, unknown>> {
    /** 节点类型 */
    readonly type: NodeKind
    /**
     * 执行节点
     * @param nodeId 节点ID
     * @param config 节点配置
     * @param context 执行上下文
     * @param logger 执行日志器
     */
    execute(nodeId: string, config: TConfig, context: ExecutionContext, logger: ExecutionLogger): Promise<NodeExecutionResult>

    /**
     * 验证节点配置
     */
    validate?(config: TConfig): ValidationResult
    /**
     * 获取节点输出变量模式
     */
    getOutputSchema?(config: TConfig): OutputVariableSchema[]
}

export type ParamType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'any'

export interface InputParam {
    name: string
    type: ParamType
    default?: string
    description?: string
    required?: boolean
}

export interface StartNodeConfig {
    inputs: InputParam[]
}

export interface LLMNodeConfig {
    model: string
    systemPrompt?: string
    userPrompt: string
    assistantPrompt?: string
    temperature?: number
    maxTokens?: number
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export type BodyType = 'none' | 'form-data' | 'x-www-form-urlencoded' | 'json' | 'raw' | 'binary'
/**
 * 键值对
 */
export interface KeyValuePair {
    key: string
    value: string
}
/**
 * HTTP 节点配置
 */
export interface HttpNodeConfig {
    url: string
    method: HttpMethod
    headers: KeyValuePair[]
    params: KeyValuePair[]
    bodyType: BodyType
    body: string
    formData: KeyValuePair[]
    timeout?: number
}
/**
 * 意图定义
 */
export interface Intent {
    name: string
    description?: string
    condition?: string
}

/**
 * CONDITION 节点配置
 */
export interface ConditionNodeConfig {
    model: string
    intents: Intent[]
}

/**
 * 输出参数
 */
export interface OutputParam {
    name: string
    type: ParamType
    value: string
    description?: string
}

/**
 * END 节点配置
 */
export interface EndNodeConfig {
    outputs: OutputParam[]
}
