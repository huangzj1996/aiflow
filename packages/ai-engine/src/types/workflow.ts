/** 工作流节点类型 */
export type NodeKind = 'start' | 'llm' | 'condition' | 'http' | 'end'

/** 工作流节点 */
export interface WorkflowNode {
    /** 节点ID */
    id: string
    /** 节点类型 */
    type: NodeKind
    /** 节点数据 */
    data: {
        /** 节点标签 用于显示节点名称*/
        label?: string
        /** 节点配置 */
        config?: Record<string, unknown>
    }
}

/** 工作流边 */
export interface WorkflowEdge {
    /** 边ID */
    id: string
    /** 源节点ID */
    source: string
    /** 目标节点ID */
    target: string
    /** 源节点输出端口 */
    sourceHandle?: string
}

/** 工作流定义 */
export interface WorkflowDefinition {
    /** 工作流ID */
    id: string
    /** 工作流名称 */
    name: string
    /** 工作流节点 */
    nodes: WorkflowNode[]
    /** 工作流边 */
    edges: WorkflowEdge[]
}

/** 工作流输入 */
export type WorkflowInput = Record<string, unknown>

/** 工作流验证结果 */
export interface ValidationResult {
    valid: boolean
    errors?: string[]
}

/**
 * 工作流执行结果
 */
export interface WorkflowResult {
    success: boolean
    error?: Error
    outputs: Record<string, unknown>
    executionId: string
    duration: number
    logs: import('./logger').ExecutionLogEntry[]
}

/**
 * 工作流执行选项（用于实时回调）
 */
export interface ExecuteOptions {
    /** 节点开始执行回调 */
    onNodeStart?: (nodeId: string, nodeType: NodeKind, nodeName: string) => void
    /** 节点结束执行回调 */
    onNodeEnd?: (nodeId: string, result: import('./logger').NodeExecutionResult) => void
    /** 日志记录回调 */
    onLog?: (entry: import('./logger').ExecutionLogEntry) => void
}
