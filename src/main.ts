import { NestFactory } from '@nestjs/core'
import * as cookieParser from 'cookie-parser'
import { AppModule } from './app.module'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	app.use(cookieParser())
	app.setGlobalPrefix('api')
	app.enableCors({
		origin: ['http://192.168.0.107:3000', 'http://localhost:3000'],
		credentials: true,
		exposedHeaders: ['set-cookie']
	})
	await app.listen(process.env.PORT ?? 3001)
}
bootstrap()
