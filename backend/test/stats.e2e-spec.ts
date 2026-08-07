import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DogStatus, PrismaClient } from '@prisma/client';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { API_PREFIX } from '../src/swagger/swagger-document';

describe('Stats (e2e)', () => {
  let app: INestApplication<App>;
  const prisma = new PrismaClient();

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.setGlobalPrefix(API_PREFIX);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /stats/home is public and returns dogsTotal', async () => {
    const res = await request(app.getHttpServer())
      .get(`/${API_PREFIX}/stats/home`)
      .expect(200);

    expect(res.body).toEqual({
      dogsTotal: expect.any(Number),
    });
    expect(res.body).not.toHaveProperty('donationsConfirmedTotal');
  });

  it('GET /stats/home dogsTotal counts all non-archived dogs', async () => {
    const expected = await prisma.dog.count({
      where: {
        status: {
          in: [DogStatus.AVAILABLE, DogStatus.IN_CARE, DogStatus.ADOPTED],
        },
      },
    });

    const res = await request(app.getHttpServer())
      .get(`/${API_PREFIX}/stats/home`)
      .expect(200);

    expect(res.body.dogsTotal).toBe(expected);
  });
});
