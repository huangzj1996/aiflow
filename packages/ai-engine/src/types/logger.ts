import { NodeKind } from './workflow'

/** 日志级别 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

/** 日志阶段 */
export type LogPhase =
    | 'workflow:start'
    | 'workflow:end'
    | 'node:start'
    | 'node:end'
    | 'variable:resolve'
    | 'llm:request'
    | 'llm:response'
    | 'http:request'
    | 'http:response'
    | 'condition:evaluate'

/** 执行日志条目 */
export interface ExecutionLogEntry {
    /** 日志时间戳 */
    timestamp: Date
    /** 日志级别 */
    level: LogLevel
    /** 日志阶段 */
    phase: LogPhase
    /** 日志消息 */
    message: string
    /** 日志元数据 */
    data?: Record<string, unknown>
    /** 日志持续时间 */
    duration?: number
    nodeId?: string
}

/** LLM请求日志 */
export interface LLMRequestLog {
    /** LLM模型 */
    model: string
    /** LLM请求消息 */
    messages: Array<{ role: string; content: string }>
    /** LLM温度 */
    temperature?: number
    /** LLM最大令牌数 */
    maxTokens?: number
}

/** LLM响应日志 */
export interface LLMResponseLog {
    content: string
    tokens: number
    duration: number
}

/** HTTP请求日志 */
export interface HTTPRequestLog {
    method: string
    url: string
    headers: Record<string, string>
    body?: Record<string, unknown>
}

/** HTTP响应日志 */
export interface HTTPResponseLog {
    status: number
    headers: Record<string, string>
    data?: Record<string, unknown> | unknown
    duration: number
}

/** 节点执行结果 */
export interface NodeExecutionResult {
    /** 节点输入（从上游节点输出解析后的值） */
    inputs?: Record<string, unknown>
    success: boolean
    error?: Error
    outputs: Record<string, unknown>
    duration: number
    /** 匹配的分支 */
    matchedBranch?: string
}

/** 执行日志记录器 */
export interface ExecutionLogger {
    /** 记录调试日志 */
    debug(message: string, data?: Record<string, unknown>): void

    /** 记录信息日志 */
    info(message: string, data?: Record<string, unknown>): void

    /** 记录警告日志 */
    warn(message: string, data?: Record<string, unknown>): void

    /** 记录错误日志 */
    error(message: string, data?: Record<string, unknown>): void

    /** 记录节点开始执行日志 */
    nodeStart(nodeId: string, nodeType: NodeKind, config: unknown): void

    /** 记录节点执行结束日志 */
    nodeEnd(nodeId: string, result: NodeExecutionResult): void

    /** 记录变量解析日志 */
    variableResolve(expression: string, originalValue: string, resolvedValue: unknown): void

    /** 记录 LLM 请求 */
    llmRequest(nodeId: string, request: LLMRequestLog): void

    /** 记录 LLM 响应 */
    llmResponse(nodeId: string, response: LLMResponseLog): void

    /** 记录 HTTP 请求 */
    httpRequest(nodeId: string, request: HTTPRequestLog): void

    /** 记录 HTTP 响应 */
    httpResponse(nodeId: string, response: HTTPResponseLog): void

    /** 获取所有日志条目 */
    getEntries(): ExecutionLogEntry[]

    /** 设置当前节点上下文 */
    setCurrentNode(nodeId: string | null): void
}
