import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { Request } from 'express'

import { PrismaService } from '../prisma/prisma.service'
// 扩展 Request 类型，添加自定义属性
export interface AppContext {
    id: string
    name: string
    activePublishedId: string | null // 当前激活的发布版本 ID
}

export interface ApiKeyContext {
    id: string
    name: string
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            appContext?: AppContext
            apiKeyContext?: ApiKeyContext
        }
    }
}

@Injectable()
export class ApiKeyGuard implements CanActivate {
    constructor(private readonly prisma: PrismaService) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        /**
         * 在请求进去路由之前进行判断
         * 获取请求头中的 Authorization，格式为 Bearer <API_KEY>
         * 解析出 API Key，通过 API Key 查询数据库获取对应的 apikey 数据和对应的app信息
         * 做出如下判断
         * 1. 判断请求头中是否存在 API KEY
         * 2. 获取数据库中的 apikey 信息后，判断 apikey数据 是否存在
         * 3. 判断 apikey 是否启用
         * 4. 判断 apikey 是否过期
         * 5. 判断 对应的app 是否存在或者删除
         * 6. 判断 对应的app 是否发布
         * 7. 更新 apikey 使用次数
         * 8. 将 appContext 和 apiKeyContext 添加到 Request 对象中
         */
        const request = context.switchToHttp().getRequest<Request>()
        const authHeader = request.headers.authorization

        if (!authHeader) {
            throw new UnauthorizedException({
                code: 'API_KEY_MISSING',
                message: '缺少 API Key，请在 Authorization header 中提供 Bearer token',
            })
        }

        const [type, token] = authHeader.split(' ')
        if (type !== 'Bearer' || !token) {
            throw new UnauthorizedException({
                code: 'API_KEY_INVALID',
                message: '无效的 Authorization header 格式，应为 Bearer <API_KEY>',
            })
        }

        const apiKey = await this.prisma.apiKey.findUnique({
            where: {
                key: token,
            },
            include: {
                app: {
                    select: {
                        id: true,
                        name: true,
                        isPublished: true,
                        isDeleted: true,
                        activePublishedId: true,
                    },
                },
            },
        })

        if (!apiKey) {
            throw new UnauthorizedException({
                code: 'API_KEY_INVALID',
                message: '无效的 API Key',
            })
        }

        if (!apiKey.isActive) {
            throw new UnauthorizedException({
                code: 'API_KEY_DISABLED',
                message: 'API Key 已禁用',
            })
        }

        // if (!apiKey.expiresAt) {
        //     throw new UnauthorizedException({
        //         code: 'API_KEY_EXPIRED',
        //         message: 'API Key 已过期',
        //     })
        // }

        if (!apiKey.app || apiKey.app.isDeleted) {
            throw new UnauthorizedException({
                code: 'APP_NOT_FOUND',
                message: '应用不存在',
            })
        }

        if (!apiKey.app.isPublished) {
            throw new UnauthorizedException({
                code: 'APP_NOT_PUBLISHED',
                message: '应用尚未发布，请先发布应用',
            })
        }

        this.prisma.apiKey
            .update({
                where: { id: apiKey.id },
                data: { lastUsedAt: new Date(), usageCount: { increment: 1 } },
            })
            .catch(() => {})

        request.appContext = {
            id: apiKey.app.id,
            name: apiKey.app.name,
            activePublishedId: apiKey.app.activePublishedId ? apiKey.app.activePublishedId : null,
        }
        request.apiKeyContext = {
            id: apiKey.id,
            name: apiKey.name,
        }

        return true
    }
}
