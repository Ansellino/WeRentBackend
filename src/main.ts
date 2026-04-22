import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

function normalizeOrigin(origin: string): string {
  return origin.trim().replace(/\/+$/, '');
}

function collectOriginsFromEnv(value?: string): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

function getAllowedOrigins(): string[] {
  const configuredOrigins = [
    ...collectOriginsFromEnv(process.env.FRONTEND_URL),
    ...collectOriginsFromEnv(process.env.FRONTEND_URLS),
    ...collectOriginsFromEnv(process.env.CORS_ORIGIN),
    ...collectOriginsFromEnv(process.env.CORS_ORIGINS),
  ].map(normalizeOrigin);

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    configuredOrigins.push(normalizeOrigin(`https://${vercelUrl}`));
  }

  if (configuredOrigins.length > 0) {
    return Array.from(new Set(configuredOrigins));
  }

  // Default local dev origins when env vars are not provided.
  return ['http://localhost:3000', 'http://127.0.0.1:3000'];
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = getAllowedOrigins();

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const normalizedOrigin = normalizeOrigin(origin);
      const isAllowed = allowedOrigins.includes(normalizedOrigin);

      callback(
        isAllowed ? null : new Error(`Origin ${origin} is not allowed by CORS`),
        isAllowed,
      );
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip unknown properties
      forbidNonWhitelisted: true,
      transform: true, // auto-transform payloads to DTO classes
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('WeRent API')
    .setDescription('Fashion Rental Platform')
    .setVersion('2.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3001);
  console.log(`WeRent API running on port ${process.env.PORT ?? 3001}`);
  console.log('CORS allowed origins:', allowedOrigins);
}
void bootstrap();
