import { Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'

import { AppModule } from './app.module'

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

    const port = process.env.PORT ?? 3101
    await app.listen(port)

    logger.log(`🚀 Plugin Market Server is running on: http://localhost:${port}/api/plugin-market`)
    logger.log(`📦 Plugin List API: GET http://localhost:${port}/api/plugin-market/v1/plugins`)
}
bootstrap()
