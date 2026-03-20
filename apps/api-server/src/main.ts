import { Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'

import { AppModule } from './app.module.js'

async function bootstrap() {
    const app = await NestFactory.create(AppModule)

    const logger = new Logger('Bootstrap')

    app.setGlobalPrefix('api')

    app.enableCors({
        origin: true,
        credentials: true,
    })

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        })
    )

    const port = process.env.PORT ?? 3100
    await app.listen(port)

    logger.log(`🚀 API Server is running on: http://localhost:${port}/api`)
    logger.log(`📚 Workflow API: POST http://localhost:${port}/api/v1/apps/run`)
}
bootstrap()
