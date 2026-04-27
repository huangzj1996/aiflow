import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, Res } from '@nestjs/common'
import type { Request, Response } from 'express'

import { PluginMarketService } from './plugin-market.service'

@Controller('plugin-market')
export class PluginMarketController {
    constructor(private readonly pluginMarketService: PluginMarketService) {}

    @Get('v1/plugins')
    async listPlugins(@Req() request: Request, @Query('page') page?: string, @Query('pageSize') pageSize?: string) {
        console.info('🚀 ~ PluginMarketController ~ listPlugins ~ pageSize:', pageSize, typeof pageSize)
        console.info('🚀 ~ PluginMarketController ~ listPlugins ~ page:', page, typeof page)
    }

    @Get('v1/plugins/:id')
    async getPluginDetail(@Req() request: Request, @Param('id') id: string) {
        console.info('🚀 ~ PluginMarketController ~ getPluginDetail ~ id:', id, typeof id)
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
