import { PluginNodeDeclaration } from './node'
import { PluginPermission } from './permissions'

/**
 * 插件作者信息
 */
export interface PluginAuthor {
    /** 作者姓名 */
    name: string
    /** 作者邮箱 */
    email?: string
    /** 作者个人网站 */
    url?: string
}

/**
 * 插件仓库信息
 */
export interface PluginRepository {
    /** 仓库类型 */
    type: 'git' | 'svn' | 'hg'
    /** 仓库 URL */
    url: string
}

/**
 * 插件入口文件配置
 */
export interface PluginEntrypoints {
    /** 后端执行器入口 （umd/esm） */
    executor: string
    /** 前端组件入口 （umd格式，可选） */
    components: string
}

/**
 * 插件依赖配置
 */
export interface PluginDependencies {
    /** 插件依赖 */
    plugins?: Record<string, string>
    /** 插件平台依赖 */
    platform?: string
}

/**
 * 插件配置 Schema
 * 用于插件级别的全局配置
 */
export interface PluginConfigSchema {
    /** Schema 类型 */
    type: 'object'
    /** Schema 属性定义 */
    properties?: Record<string, unknown>
    /** 必填属性 */
    required?: string[]
}

/**
 * 插件清单 (plugin.json)
 * 用于描述插件的完整信息
 */
export interface PluginManifest {
    /** 插件 ID（@scope/name 或 name 格式） */
    id: string
    /** 插件版本号 */
    version: string
    /** 插件名称 */
    name: string
    /** 插件描述 */
    description: string
    /** 插件图标 (url / emoji) */
    icon?: string
    /** 插件作者信息 */
    author: PluginAuthor
    /** 插件许可证 */
    license: string
    /** 插件主页 */
    homepage?: string
    /** 插件仓库信息 */
    repository?: PluginRepository
    /** 插件关键词 */
    keywords?: string[]
    /** 插件权限 */
    permissions: PluginPermission[]
    /** 插件节点声明 */
    nodes: PluginNodeDeclaration[]
    /** 入口文件配置 */
    main: PluginEntrypoints
    /** 插件依赖 */
    dependencies?: PluginDependencies
    /** 插件全局配置 Schema */
    config?: PluginConfigSchema
    /** 引擎版本要求 */
    engines?: {
        miaoma?: string
        node?: string
    }
}

/** 插件清单验证结果 */
export interface ManifestValidationResult {
    /** 是否验证通过 */
    valid: boolean
    /** 验证错误列表 */
    errors?: ManifestValidationError[]
    /** 验证警告列表 */
    warnings?: ManifestValidationWarning[]
}
/**
 * 清单验证错误
 */
export interface ManifestValidationError {
    /** 错误字段路径 */
    path: string
    /** 错误信息 */
    message: string
    /** 错误代码 */
    code: string
}
/**
 * 清单验证警告
 */
export interface ManifestValidationWarning {
    /** 警告字段路径 */
    path: string
    /** 警告信息 */
    message: string
    /** 警告代码 */
    code: string
}
/**
 * 插件状态
 */
export type PluginStatus = 'pending' | 'published' | 'suspended' | 'deprecated'

/**
 * 插件版本状态
 */
export type PluginVersionStatus = 'pending' | 'approved' | 'rejected'

/**
 * 插件分类
 * 应用于插件市场的分类展示
 */
export type PluginCategory = 'ai' | 'integration' | 'data' | 'media' | 'utility' | 'communication'

/**
 * 插件元信息（市场信息）
 */
// 关键字段
export interface PluginMetadata {
    id: string // 数据库主键
    pluginId: string // 插件唯一标识（@scope/name）
    name: string // 显示名称
    description: string // 描述
    icon?: string // 图标 (url / emoji)
    category: PluginCategory // 分类：ai | integration | data...
    tags: string[] // 标签（用于搜索）
    downloadCount: number // 下载量
    rating?: number // 评分
    status: PluginStatus // 状态：pending | published | suspended | deprecated
    isOfficial: boolean // 是否官方插件
    authorId?: string // 插件作者 ID
    latestVersion?: string // 最新版本号
    createdAt: Date // 创建时间
    updatedAt: Date // 更新时间
}

/**
 * 插件版本信息
 */
export interface PluginVersionInfo {
    /** 版本 ID */
    id: string
    /** 版本号 */
    version: string
    /** 插件权限 */
    permissions: PluginPermission[]
    /** 插件节点声明 */
    nodes: PluginNodeDeclaration[]
    /** 插件清单文件 URL 也就是 plugin.json 的地址 */
    manifestUrl: string
    /** 插件执行器 URL */
    executorUrl: string
    /** 插件组件 URL */
    componentsUrl?: string
    /** 插件变更日志 */
    changelog?: string
    /** 插件版本状态 */
    status: PluginVersionStatus
    /** 创建时间 */
    createdAt: Date
    /** 发布时间 */
    publishedAt: Date
}

/**
 * 插件安装信息
 */
export interface PluginInstallation {
    /** 插件安装 ID */
    id: string
    /** 插件 ID */
    pluginId: string
    /** 已安装插件 */
    version: string
    /** 插件安装状态 */
    status: PluginStatus
    /** 创建时间 */
    createdAt: Date
    /** 更新时间 */
    updatedAt: Date
}
