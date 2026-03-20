import { Module } from '@nestjs/common'

import { PrismaModule } from './prisma/prisma.module.js'

@Module({
    imports: [
        // 数据库
        PrismaModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
