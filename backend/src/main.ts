import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import cookieParser from 'cookie-parser'
import * as bodyParser from 'body-parser'
import * as fs from 'fs'

async function bootstrap() {
  const frontUrl = process.env.FRONTEND_URL
  const useHttps = process.env.HTTPS_ENABLED === 'true'

  const app = await NestFactory.create(
    AppModule,
    useHttps
      ? {
          httpsOptions: {
            key: fs.readFileSync('certs/localhost-key.pem'),
            cert: fs.readFileSync('certs/localhost.pem'),
          },
        }
      : undefined,
  )

  app.use(cookieParser())

  app.use(
    '/payments/webhook',
    bodyParser.raw({ type: 'application/json' }),
  )

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      stopAtFirstError: true,
    }),
  )

  app.enableCors({
    origin: frontUrl,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })

  app.getHttpAdapter().getInstance().set('trust proxy', 1)

  await app.listen(process.env.BACKEND_PORT ?? 3000)
}

bootstrap()