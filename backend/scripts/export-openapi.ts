import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { NestFactory } from '@nestjs/core';
import * as yaml from 'js-yaml';
import { AppModule } from '../src/app.module';
import { API_PREFIX, buildOpenApiDocument } from '../src/swagger/swagger-document';

async function exportOpenApi() {
  const app = await NestFactory.create(AppModule, { logger: false });
  app.setGlobalPrefix(API_PREFIX);

  const document = buildOpenApiDocument(app);
  const outputPath = resolve(__dirname, '..', 'openapi.yaml');
  writeFileSync(outputPath, yaml.dump(document, { lineWidth: -1 }));

  await app.close();
  console.log(`OpenAPI spec written to ${outputPath}`);
}

exportOpenApi().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
