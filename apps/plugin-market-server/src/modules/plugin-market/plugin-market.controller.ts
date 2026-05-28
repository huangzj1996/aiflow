import { Controller, Get, Param, Query, Req, Res } from '@nestjs/common'
import type { Request, Response } from 'express'

import { PluginMarketService } from './plugin-market.service'
/**
 * 获取插件列表API
 * 获取插件详情API
 * 获取资源API
 * 主要功能：
 *  从 registry/plugins.json 中获取插件的信息和 本地插件的地址，读取packages下面的本地插件
 */
@Controller('plugin-market')
export class PluginMarketController {
    constructor(private readonly pluginMarketService: PluginMarketService) {}

    @Get('v1/plugins')
    async listPlugins(@Req() request: Request, @Query('page') page?: string, @Query('pageSize') pageSize?: string) {
        console.info('🚀 ~ PluginMarketController ~ listPlugins ~ getBaseUrl:', this.getBaseUrl(request))
        const list = await this.pluginMarketService.listPlugins(
            this.getBaseUrl(request),
            page ? Number.parseInt(page, 10) : 1,
            pageSize ? Number.parseInt(pageSize, 10) : 20
        )
        console.info('🚀 ~ PluginMarketController ~ listPlugins ~ list:', list)
        return list
    }

    @Get('v1/plugins/:id')
    async getPluginDetail(@Req() request: Request, @Param('id') id: string) {
        console.info('🚀 ~ PluginMarketController ~ getPluginDetail ~ id:', id, typeof id)
        return await this.pluginMarketService.getPluginDetail(decodeURIComponent(id), this.getBaseUrl(request))
    }

    @Get('assets')
    async getPluginAsset(
        @Res() response: Response,
        @Query('pluginId') pluginId?: string,
        @Query('version') version?: string,
        @Query('file') file?: string
    ): Promise<void> {
        console.info('🚀 ~ PluginMarketController ~ getPluginAsset ~ file:', file, typeof file)
        console.info('🚀 ~ PluginMarketController ~ getPluginAsset ~ version:', version, typeof version)
        console.info('🚀 ~ PluginMarketController ~ getPluginAsset ~ pluginId:', pluginId, typeof pluginId)
        if (!pluginId || !version || !file) {
            response.status(404).send('Not Found')
            return
        }
        const asset = await this.pluginMarketService.loadPluginAsset(pluginId, version, file)
        response.setHeader('Content-Type', asset.contentType)
        response.setHeader('Cache-Control', 'public, max-age=300')
        response.send(asset.content)
    }

    private getBaseUrl(request: Request): string {
        const configuredBaseUrl = process.env.PLUGIN_MARKET_PUBLIC_BASE_URL?.trim()
        if (configuredBaseUrl) {
            return configuredBaseUrl.replace(/\/$/, '')
        }
        const protocol = request.headers['x-forwarded-proto']?.toString().split(',')[0] || request.protocol
        const host = request.headers['x-forwarded-host']?.toString().split(',')[0] || request.get('host')
        if (!host) {
            throw new Error('无法解析插件市场服务地址')
        }

        return `${protocol}://${host}/api/plugin-market`
    }
}
