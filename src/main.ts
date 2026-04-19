import 'dotenv/config'
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'
 
async function bootstrap() {
  const app = await NestFactory.create(AppModule)
 
  // Global prefix
  app.setGlobalPrefix('api')
 
  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  })
 
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,         // strip unknown properties
    forbidNonWhitelisted: true,
    transform: true,         // auto-transform payloads to DTO classes
  }))
 
  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter())
 
  // Swagger
  const config = new DocumentBuilder()
    .setTitle('WeRent API')
    .setDescription('Fashion Rental Platform')
    .setVersion('2.0.0')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)
 
  await app.listen(process.env.PORT ?? 3001)
  console.log(`WeRent API running on port ${process.env.PORT ?? 3001}`)
}
bootstrap()