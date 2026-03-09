import { HttpNodeConfig, ValidationResult } from '../../types'
import { NodeValidator } from '../type'

/**
 * HTTP 节点验证器
 */
export class HTTPValidator implements NodeValidator<HttpNodeConfig> {
    readonly type = 'http' as const

    validate(config: HttpNodeConfig): ValidationResult {
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
}
