import { Module } from '@nestjs/common'

import { PluginMarketModule } from './modules/plugin-market/plugin-market.module'

@Module({
    imports: [PluginMarketModule],
    controllers: [],
    providers: [],
})
export class AppModule {}
