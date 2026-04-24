/**
 * 插件权限类型
 * 用于声明插件所需的系统能力
 */
export type PluginPermission =
    | 'network' // 网络请求权限
    | 'storage' // 本地存储权限
    | 'env:read' // 读取环境变量权限
    | 'email:send' // 发送邮件权限
    | 'llm:invoke' // 调用 LLM 服务权限
    | 'knowledge:read' // 读取知识库权限
    | 'knowledge:write' // 写入知识库权限
    | 'file:read' // 读取文件权限
    | 'file:write' // 写入文件权限

/**
 * 权限描述信息
 */
export interface PluginPermissionInfo {
    /** 权限标识 */
    permission: PluginPermission
    /** 权限名称 */
    name: string
    /** 权限描述 */
    description: string
    /** 权限风险等级 */
    riskLevel: 'low' | 'medium' | 'high'
}

/**
 * 预定义的权限信息
 */
export const PLUGIN_PERMISSIONS: Record<PluginPermission, PluginPermissionInfo> = {
    network: {
        permission: 'network',
        name: '网络访问',
        description: '允许插件发起 http/https 请求',
        riskLevel: 'medium',
    },
    storage: {
        permission: 'storage',
        name: '本地存储',
        description: '允许插件读写本地存储',
        riskLevel: 'low',
    },
    'env:read': {
        permission: 'env:read',
        name: '环境变量读取',
        description: '允许插件读取环境变量配置',
        riskLevel: 'medium',
    },
    'email:send': {
        permission: 'email:send',
        name: '发送邮件',
        description: '允许插件调用平台内置 SMTP 邮件服务',
        riskLevel: 'medium',
    },
    'llm:invoke': {
        permission: 'llm:invoke',
        name: '调用 LM 服务',
        description: '允许插件调用大语言模型服务',
        riskLevel: 'medium',
    },
    'knowledge:read': {
        permission: 'knowledge:read',
        name: '读取知识库',
        description: '允许插件读取知识库内容',
        riskLevel: 'low',
    },
    'knowledge:write': {
        permission: 'knowledge:write',
        name: '写入知识库',
        description: '允许插件写入知识库内容',
        riskLevel: 'medium',
    },
    'file:read': {
        permission: 'file:read',
        name: '读取文件',
        description: '允许插件读取文件内容',
        riskLevel: 'high',
    },
    'file:write': {
        permission: 'file:write',
        name: '写入文件',
        description: '允许插件写入文件内容',
        riskLevel: 'high',
    },
}

/**
 * ### 权限验证结果
 *
 * 权限校验机制:
 * 1. 安装时校验（加载阶段）：如果插件声明的权限 > 用户授权的权限 → 拒绝加载 ❌
 * 2. 运行时校验（插件运行时动态校验）:如果用户没有授权 如：`email:send` → 抛出 PermissionDeniedError ❌
 *
 * `permissions: []` 的含义：
 *
 * 安装时：✅ 永远通过（插件没要求任何权限）
 *
 * 运行时：❌ 调用任何服务都会被拒绝
 */
export interface PermissionValidationResult {
    /** 是否验证通过 */
    valid: boolean
    /** 缺少的权限列表 */
    missingPermissions?: PluginPermission[]
    /** 验证错误信息列表 */
    errors?: string[]
}

/**
 * 权限上下文配置
 */
export interface PermissionContextConfig {
    /** 插件 ID */
    pluginId: string
    /** 已授权的权限列表 */
    grantedPermissions: PluginPermission[]
    /** 权限被拒绝时的回调函数 */
    onPermissionDenied: (permission: PluginPermission, action: string) => void
}
