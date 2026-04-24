/**
 * 从CDN加载插件代码
 *
 * 获取流程：
 * 1. 检查缓存，若存在则直接返回
 * 2. 获取 plugin.json 文件
 * 3. 获取 executor.umd.js 文件
 * 4. 获取前端组件（可选），若404 则不加载
 * 5. 缓存并返回
 *
 * 技术亮点：
 * 1. 缓存 - 避免重复请求， key = pluginId@version
 * 2. 重试 - 默认3次，使用指数退避策略
 * 3. 超时 - 默认30s
 * 4. 两种加载模式 - fetchPlugin() 基于 baseUrl , fetchPluginByUrl() 显示URL
 * 5. 资源类型 - manifest.json + executor.umd.js + components (可选)
 *
 * 示例：
 *  参数	    值
    baseUrl  	https://cdn.example.com
    pluginId	@official/current-time
    version	    1.0.0
    path	    plugin.json

    构建结果：https://cdn.example.com/official/current-time/1.0.0/plugin.json
 */
import { PluginManifest } from '@aiflow/plugin-core'
/**
 * CDN 获取器配置
 */
export interface CNDFetcherConfig {
    /** CDN 基础URL */
    baseUrl?: string
    /** 请求超时时间 */
    timeout?: number
    /** 重试次数 */
    retryCount?: number
    /** 自定义请求头 */
    headers?: Record<string, string>
    /** 自定义 fetch 函数 */
    fetch?: typeof fetch
}

/**
 * 插件资源信息
 */
export interface PluginResource {
    /** 插件ID */
    pluginId: string
    /** 插件版本 */
    version: string
    /** 插件清单 */
    manifest: PluginManifest
    /** 插件执行器代码 */
    executorCode: string
    /** 插件前端组件代码 */
    componentsCode?: string
}

/**
 * 远程插件资源地址
 */
export interface PluginRemoteAssetUrls {
    /** 插件ID */
    pluginId: string
    /** 插件版本 */
    version: string
    /** 插件清单URL 绝对URL */
    manifestUrl: string
    /** 插件执行器URL 绝对URL （可选，不传则基于 manifest.main.executor 推导） */
    executorUrl?: string
    /** 插件前端组件URL 绝对URL （可选，不传则基于 manifest.main.components 推导） */
    componentsUrl?: string
}

/**
 * 获取结果
 */
export interface FetchResult<T> {
    success: boolean
    data?: T
    error?: string
}
/**
 * CDN 资源获取器
 * 负责从 CDN 获取插件资源
 */
export class CNDFetcher {
    private config: Required<CNDFetcherConfig>
    private fetcher: typeof fetch
    private cache: Map<string, PluginResource> = new Map()

    constructor(config: CNDFetcherConfig) {
        this.config = {
            baseUrl: (config.baseUrl ?? '').replace(/\/$/, ''),
            timeout: config.timeout ?? 30000,
            retryCount: config.retryCount ?? 3,
            headers: config.headers ?? {},
            fetch: config.fetch ?? fetch,
        }
        this.fetcher = this.config.fetch
    }

    /**
     * 获取插件资源
     */
    async fetchPlugin(pluginId: string, version: string): Promise<FetchResult<PluginResource>> {
        if (!this.config.baseUrl) {
            return { success: false, error: 'CDN baseUrl is not configured' }
        }

        // 1. 检查缓存，若存在则直接返回
        const cacheKey = `${pluginId}@${version}`
        if (this.cache.has(cacheKey)) {
            return { success: true, data: this.cache.get(cacheKey) }
        }

        try {
            // 2. 获取 plugin.json 文件
            const manifestResult = await this.fetchManifest(pluginId, version)
            if (!manifestResult.success || !manifestResult.data) {
                return { success: false, error: manifestResult.error }
            }

            const manifest = manifestResult.data

            // 3. 获取 executor.umd.js 文件
            const executorResult = await this.fetchExecutor(pluginId, version, manifest.main.executor)
            if (!executorResult.success || !executorResult.data) {
                return { success: false, error: executorResult.error }
            }

            // 4. 获取前端组件（可选）
            let componentsCode: string | undefined
            if (manifest.main.components) {
                const componentsResult = await this.fetchComponents(pluginId, version, manifest.main.components)
                if (componentsResult.success && componentsResult.data) {
                    componentsCode = componentsResult.data
                }
            }

            //5. 缓存并返回
            const resource: PluginResource = {
                pluginId,
                version,
                manifest,
                executorCode: executorResult.data,
                componentsCode,
            }

            this.cache.set(cacheKey, resource)

            return { success: true, data: resource }
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
        }
    }

    /**
     * 根据显式 URL 获取插件资源
     */
    async fetchPluginByUrls(source: PluginRemoteAssetUrls): Promise<FetchResult<PluginResource>> {
        const cacheKey = `${source.pluginId}@${source.version}`
        if (this.cache.has(cacheKey)) {
            return { success: true, data: this.cache.get(cacheKey) }
        }

        try {
            const manifestResult = await this.fetchWithRetry<PluginManifest>(source.manifestUrl, 'json')
            if (!manifestResult.success || !manifestResult.data) {
                return { success: false, error: manifestResult.error }
            }

            const manifest = manifestResult.data

            const executorUrl = source.executorUrl ?? this.resolveAssetUrl(source.manifestUrl, manifest.main.executor)
            const executorResult = await this.fetchWithRetry<string>(executorUrl, 'text')
            if (!executorResult.success || !executorResult.data) {
                return { success: false, error: executorResult.error }
            }

            // 4. 获取前端组件（可选）
            let componentsCode: string | undefined
            const componentsUrl =
                source.componentsUrl ??
                (manifest.main.components ? this.resolveAssetUrl(source.manifestUrl, manifest.main.components) : undefined)

            if (componentsUrl) {
                const componentsResult = await this.fetchWithRetry<string>(componentsUrl, 'text')
                if (componentsResult.success && componentsResult.data) {
                    componentsCode = componentsResult.data
                }
            }

            const resource: PluginResource = {
                pluginId: source.pluginId,
                version: source.version,
                manifest,
                executorCode: executorResult.data,
                componentsCode,
            }

            this.cache.set(cacheKey, resource)

            return { success: true, data: resource }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            }
        }
    }

    /**
     * 获取插件清单
     */
    async fetchManifest(pluginId: string, version: string): Promise<FetchResult<PluginManifest>> {
        const url = this.buildUrl(pluginId, version, 'plugin.json')
        return this.fetchWithRetry<PluginManifest>(url, 'json')
    }

    /**
     * 获取插件执行器代码
     */
    async fetchExecutor(pluginId: string, version: string, executorPath: string): Promise<FetchResult<string>> {
        const url = this.buildUrl(pluginId, version, executorPath)
        return this.fetchWithRetry<string>(url, 'text')
    }

    /**
     * 获取插件前端组件代码
     */
    async fetchComponents(pluginId: string, version: string, componentsPath: string): Promise<FetchResult<string>> {
        const url = this.buildUrl(pluginId, version, componentsPath)
        return this.fetchWithRetry<string>(url, 'text')
    }

    /**
     * 构建资源 URL
     */
    private buildUrl(pluginId: string, version: string, path: string): string {
        const normalizedPath = pluginId.replace(/^@/, '')
        return `${this.config.baseUrl}/${normalizedPath}/${version}/${path}`
    }

    /**
     * 基于参考 URL 解析资源地址
     */
    private resolveAssetUrl(referenceUrl: string, assetPath: string): string {
        return new URL(assetPath, referenceUrl).toString()
    }

    /**
     * 带重试的获取请求
     */
    private async fetchWithRetry<T>(url: string, responseType: 'json' | 'text'): Promise<FetchResult<T>> {
        let lastError: string = 'unknown error'

        // 重试次数
        for (let attempt = 0; attempt < this.config.retryCount; attempt++) {
            try {
                //响应成功逻辑
                const abort = new AbortController() // 中断请求
                const timeoutId = setTimeout(() => abort.abort(), this.config.timeout) // 超时

                const response = await this.fetcher(url, {
                    signal: abort.signal,
                    headers: this.config.headers,
                })

                clearTimeout(timeoutId) // 清除超时定时器

                // 重试
                if (!response.ok) {
                    lastError = `HTTP ${response.status}: ${response.statusText}`
                    continue
                }

                const data = responseType === 'json' ? await response.json() : await response.text()

                return { success: true, data: data as T }
            } catch (error) {
                //响应失败逻辑
                if (error instanceof Error) {
                    if (error.name === 'AbortError') {
                        lastError = 'request aborted'
                        continue
                    } else {
                        lastError = error.message
                    }
                }

                if (attempt < this.config.retryCount - 1) {
                    await this.delay(Math.pow(2, attempt) * 1000) // 指数退避
                }
            }
        }

        return { success: false, error: lastError }
    }

    /**
     * 延迟
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    /**
     * 清除缓存
     */
    clearCache(pluginId: string, version: string): void {
        if (pluginId && version) {
            this.cache.delete(`${pluginId}@${version}`)
        } else if (pluginId) {
            for (const key of this.cache.keys()) {
                if (key.startsWith(`${pluginId}@`)) {
                    this.cache.delete(key)
                }
            }
        } else {
            this.cache.clear()
        }
    }

    /**
     * 获取缓存大小
     */
    getCacheSize(): number {
        return this.cache.size
    }
}
