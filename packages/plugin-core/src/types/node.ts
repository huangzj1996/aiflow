import { JSONSchema7 } from 'json-schema'

/**
 * **节点级别分类，用于工作流编辑器中的节点面板**
 *
 * 1.UI 分类展示：在工作流编辑器的节点面板中，将插件节点按 category 分组显示
 *
 * 2.节点目录组织：帮助用户快速找到需要的节点类型
 *
 * 3.搜索/过滤：可以根据 category 筛选节点，方便用户查找和使用
 */
export type PluginNodeCategory =
    | 'input' // 输入节点（如用户输入、文件读取）
    | 'process' // 处理节点（如数据转换）
    | 'output' // 输出节点（如发送邮件、写入文件）
    | 'control' // 控制节点（如条件分支、循环）
    | 'integration' // 集成节点（如 API 调用）
    | 'ai' // AI 节点（如 LLM 调用）
    | 'utility' // 工具节点（如 current-time）
    | 'communication' // 通信节点（如 webhook）
    | 'data' // 数据节点（如数据库操作）
    | 'media' // 媒体节点（如图片处理）

/**
 * 节点输出定义
 */
export interface PluginNodeOutput {
    /** 输出名称 */
    name: string
    /** 输出类型 */
    type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'any'
    /** 输出描述 */
    description?: string
}
/**
 * 节点输入定义
 */
export interface PluginNodeInput {
    /** 输入名称 */
    name: string
    /** 输入类型 */
    type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'any'
    /** 输入描述 */
    description: string
    /** 输入是否必填 */
    required?: boolean
}
/**
 * 扩展的 JSON Schema 属性
 * 用于支持变量引用等自定义功能
 *
 * 标准 JSON Schema 7 只能定义"这个字段是什么类型"，但插件配置表单需要更多能力：
 *
 * 字段是否支持引用上游节点输出（变量引用）
 *
 * 用什么 UI 组件渲染（Input、Select、Switch）
 *
 * 字段的分组和排序
 */
export interface ExtendedJSONSchema7 extends JSONSchema7 {
    /** 是否支持变量引用，例如 {{nodeId.outputName}} */
    'x-variable'?: boolean

    /** 组件类型提示，例如 "Input", "Select", "Switch" */
    'x-component'?: string

    /** 组件属性，例如 { placeholder: "请输入" } */
    'x-component-props'?: Record<string, unknown>

    /** 字段分组，用于 UI 布局 */
    'x-group'?: string

    /** 字段顺序，用于控制表单中的排列 */
    'x-order'?: number

    /** 嵌套属性也支持扩展 */
    properties?: Record<string, ExtendedJSONSchema7>
    items?: ExtendedJSONSchema7 | ExtendedJSONSchema7[]
}

/**
 * 插件节点声明
 * 用于在 plugin.json 中声明节点类型
 */
export interface PluginNodeDeclaration {
    /** 节点类型 唯一标识符 */
    type: string
    /** 节点名称 */
    name: string
    /** 节点描述 */
    description?: string
    /** 节点图标 */
    icon: string
    /** 节点颜色 十六进制格式 */
    color: string
    /** 节点分类 */
    category: PluginNodeCategory
    /** 节点配置 JSON Schema  配置表单（驱动 UI）*/
    configSchema: ExtendedJSONSchema7
    /** 节点输入定义 */
    inputs?: PluginNodeInput[]
    /** 节点输出定义 */
    outputs: PluginNodeOutput[]
    /** 自定义组件名称（可选，用于自定义渲染） */
    customComponent?: string
    /** 是否支持多个输入 */
    multipleInputs?: boolean
    /** 是否支持多个输出 */
    multipleOutputs?: boolean
}

/**
 * 节点执行结果
 */
export interface PluginNodeExecutionResult {
    /** 是否成功 */
    success: boolean
    /** 节点输出值 */
    outputs?: Record<string, unknown>
    /** 错误信息 */
    error?: string
    /** 元数据 */
    metadata?: Record<string, unknown>
}

/**
 * 插件节点执行器接口
 */
export interface PluginNodeExecutor {
    /** 节点类型 */
    readonly type: string
    /** 执行节点 */
    execute(context: PluginNodeExecutionContext): Promise<PluginNodeExecutionResult>
    /** 校验节点配置 */
    validate?(config: Record<string, unknown>): { valid: boolean; errors?: string[] }
}

/**
 * 节点执行上下文
 */
export interface PluginNodeExecutionContext {
    /** 节点 ID */
    nodeId: string
    /** 节点类型 */
    nodeType: string
    /** 工作流 ID */
    workflowId: string
    /** 执行 ID */
    executionId: string
    /** 节点输入值 上游节点输出值 */
    inputs: Record<string, unknown>
    /** 节点配置值 */
    config: Record<string, unknown>
    /** 日志记录器 */
    logger: PluginLogger
    /** 服务代理 */
    services: PluginServices
}

/**
 * 插件日志记录器接口
 */
export interface PluginLogger {
    /** 记录调试日志 */
    debug(msg: string, ...args: unknown[]): void
    /** 记录信息日志 */
    info(msg: string, ...args: unknown[]): void
    /** 记录警告日志 */
    warn(msg: string, ...args: unknown[]): void
    /** 记录错误日志 */
    error(msg: string, ...args: unknown[]): void
}
/**
 * 插件服务代理接口
 * 提供受权限控制的系统服务访问
 */
export interface PluginServices {
    /** 发起 HTTP 请求 */
    fetch: typeof fetch
    /** 获取环境变量 */
    getEnv: (key: string) => string | undefined
    /** 发送邮件 (需要 email:send 权限)*/
    sendEmail: (options: PluginEmailSendOptions) => Promise<boolean>
    /** 调用 LLM 服务 (需要 llm:invoke 权限)*/
    invokeLLM: (options: LLMInvokeOptions) => Promise<LLMInvokeResult>
    /** 搜索知识库 (需要 knowledge:read 权限)*/
    searchKnowledge: (options: KnowledgeSearchOptions) => Promise<KnowledgeSearchResult>
}

/**
 * 平台邮件发送选项
 */
export interface PluginEmailSendOptions {
    /** 收件人邮箱,支持单个邮箱或逗号分隔的多个邮箱 */
    to: string
    /** 邮件主题 */
    subject: string
    /** HTML 内容 */
    html: string
}
/**
 * LLM 调用选项
 */
export interface LLMInvokeOptions {
    /** 调用模型 */
    model?: string
    /** 系统提示 */
    systemPrompt?: string
    /** 用户提示 */
    userMessage: string
    /** 温度 */
    temperature?: number
    /** 最大令牌数 */
    maxTokens?: number
}

/**
 * LLM 调用结果
 */
export interface LLMInvokeResult {
    /** 模型回复 */
    text: string
    /** 调用统计信息 */
    usage?: {
        promptTokens: number
        completionTokens: number
        totalTokens: number
    }
}

/**
 * 知识库检索选项
 */
export interface KnowledgeSearchOptions {
    /** 知识库 ID */
    knowledgeBaseIds: string[]
    /** 搜索关键词 */
    query: string
    /** 搜索结果数量 */
    topK?: number
    /** 搜索结果相似度阈值 */
    threshold?: number
}

/**
 * 知识库检索结果
 */
export interface KnowledgeSearchResult {
    /** 检索到的文档片段 */
    documents: Array<{
        id: string
        content: string
        score: number
        metadata?: Record<string, unknown>
    }>
}
