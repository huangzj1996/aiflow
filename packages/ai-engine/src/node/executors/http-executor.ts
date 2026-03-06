/**
 * START 节点执行器
 * 处理工作流输入参数
 */

import {
    ExecutionContext,
    ExecutionLogger,
    HttpNodeConfig,
    NodeExecutionResult,
    NodeKind,
    OutputVariableSchema,
    ValidationResult,
} from '../../types'
import { BaseNodeExecutor } from '../base-executor'

export class HttpExecutor extends BaseNodeExecutor<HttpNodeConfig> {
    readonly type = 'http' as NodeKind

    protected async doExecute(
        nodeId: string,
        config: HttpNodeConfig,
        context: ExecutionContext,
        logger: ExecutionLogger
    ): Promise<NodeExecutionResult> {
        // 解析配置中的变量
        const resolvedConfig = this.resolveConfigVariables(config, context, logger)

        // 构建 URL（带 query 参数）
        let url = resolvedConfig.url
        if (resolvedConfig.params && resolvedConfig.params.length > 0) {
            const searchParams = new URLSearchParams()
            for (const param of resolvedConfig.params) {
                if (param.key) {
                    searchParams.append(param.key, param.value)
                }
            }
            const queryString = searchParams.toString()

            if (queryString) {
                url += (url.includes('?') ? '&' : '?') + queryString
            }
        }

        // 构建请求头
        const headers: Record<string, string> = {}
        for (const header of resolvedConfig.headers || []) {
            if (header.key) {
                headers[header.key] = header.value
            }
        }

        // 构建请求体
        let body: string | undefined
        if (resolvedConfig.method !== 'GET' && resolvedConfig.method !== 'DELETE') {
            switch (resolvedConfig.bodyType) {
                case 'json':
                    headers['Content-Type'] = 'application/json'
                    body = resolvedConfig.body
                    break
                case 'form-data': {
                    headers['Content-Type'] = 'multipart/form-data'
                    const formData = new FormData()
                    for (const item of resolvedConfig.formData || []) {
                        if (item.key) {
                            formData.append(item.key, item.value)
                        }
                    }
                    body = JSON.stringify(formData)
                    break
                }
                case 'x-www-form-urlencoded': {
                    headers['Content-Type'] = 'application/x-www-form-urlencoded'
                    const urlencoded = new URLSearchParams()
                    for (const item of resolvedConfig.formData) {
                        if (item.key) {
                            urlencoded.append(item.key, item.value)
                        }
                    }
                    body = urlencoded.toString()
                    break
                }
                case 'raw':
                    body = resolvedConfig.body
                    break
                case 'none':
                    break
                default:
                    break
            }
        }

        // 记录请求
        logger.httpRequest(nodeId, {
            method: resolvedConfig.method,
            url,
            headers,
        })

        const startTime = Date.now()

        try {
            const response = await fetch(url, {
                headers,
                body,
                method: resolvedConfig.method,
                signal: AbortSignal.timeout(resolvedConfig.timeout || 30000),
            })

            const duration = Date.now() - startTime

            // 解析响应
            let data: unknown
            const contentType = response.headers.get('content-type') || ''
            if (contentType.includes('application/json')) {
                data = await response.json()
            } else {
                data = await response.text()
            }

            // 收集响应头
            const responseHeaders: Record<string, string> = {}
            response.headers.forEach((value, key) => {
                responseHeaders[key] = value
            })

            // 记录响应
            logger.httpResponse(nodeId, {
                status: response.status,
                headers: responseHeaders,
                duration,
                data,
            })
            return {
                success: true,
                outputs: {
                    data,
                    status: response.status,
                    headers,
                    success: response.ok,
                    error: response.ok ? null : `HTTP ${response.status}`,
                },
                duration,
            }
        } catch (error) {
            const duration = Date.now() - startTime
            const errorMessage = error instanceof Error ? error.message : String(error)

            logger.httpResponse(nodeId, {
                status: 0,
                headers: {},
                data: null,
                duration,
            })

            // HTTP 错误不算执行失败，错误信息在 outputs 中
            return {
                success: true,
                outputs: {
                    data: null,
                    status: 0,
                    headers: {},
                    success: false,
                    error: errorMessage,
                },
                duration,
            }
        }
    }

    override validate(config: HttpNodeConfig): ValidationResult {
        const errors: string[] = []
        if (!config.url) {
            errors.push('URL is required')
        }

        if (!config.method) {
            errors.push('HTTP method is required')
        }

        return {
            valid: errors.length === 0,
            errors: errors.length > 0 ? errors : undefined,
        }
    }

    override getOutputSchema(): OutputVariableSchema[] {
        return [
            { name: 'data', type: 'any', description: 'HTTP 响应的 body 数据' },
            { name: 'status', type: 'number', description: 'HTTP 响应状态码' },
            { name: 'headers', type: 'object', description: 'HTTP 响应头' },
            { name: 'success', type: 'boolean', description: '请求是否成功（2xx 状态码）' },
            { name: 'error', type: 'string', description: '请求失败时的错误信息' },
        ]
    }
}
