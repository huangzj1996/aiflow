import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { WorkflowModule } from './modules/workflow/workflow.module.js'
import { PrismaModule } from './prisma/prisma.module.js'
@Module({
    imports: [
        // 数据库
        PrismaModule,

        // 环境变量配置
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),

        // 工作流模块
        WorkflowModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
