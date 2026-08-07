import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { API_PREFIX, setupSwagger } from './swagger/swagger-document';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const corsOrigins = config.get<string>('CORS_ORIGINS');
  const extraOrigins = corsOrigins
    ? corsOrigins.split(',').map((origin) => origin.trim()).filter(Boolean)
    : [];

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3001',
      'http://localhost:3002',
      'http://127.0.0.1:3002',
      'http://localhost:3003',
      'http://127.0.0.1:3003',
      ...extraOrigins,
    ],
  });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );
  app.setGlobalPrefix(API_PREFIX);
  setupSwagger(app);

  const port = config.get<number>('PORT', 4000);
  await app.listen(port);
}

bootstrap();
