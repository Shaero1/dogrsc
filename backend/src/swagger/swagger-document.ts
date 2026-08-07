import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

export const API_PREFIX = 'api/v1';
export const SWAGGER_PATH = 'api/docs';

export function buildOpenApiDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('Dog Rescue API')
    .setDescription('REST API for Dog Rescue (MVP scaffold)')
    .setVersion('1.0')
    .addServer('/')
    .addBearerAuth()
    .build();

  return SwaggerModule.createDocument(app, config);
}

export function setupSwagger(app: INestApplication): OpenAPIObject {
  const document = buildOpenApiDocument(app);
  SwaggerModule.setup(SWAGGER_PATH, app, document);
  return document;
}
