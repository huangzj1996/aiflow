import { Module } from '@nestjs/common'

import { PluginMarketController } from './plugin-market.controller'
import { PluginMarketService } from './plugin-market.service'

@Module({
    controllers: [PluginMarketController],
    providers: [PluginMarketService],
})
export class PluginMarketModule {}
