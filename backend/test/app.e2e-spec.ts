import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { API_PREFIX } from '../src/swagger/swagger-document';

describe('Health (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix(API_PREFIX);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /api/v1/health returns ok with database', () => {
    return request(app.getHttpServer())
      .get(`/${API_PREFIX}/health`)
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('ok');
        expect(res.body.database).toBe('ok');
        expect(res.body.timestamp).toBeDefined();
        expect(res.body.version).toBeDefined();
      });
  });
});
