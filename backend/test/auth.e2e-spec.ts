import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { API_PREFIX } from '../src/swagger/swagger-document';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@dogerescue.org';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'changeme-dev-only';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  const prisma = new PrismaClient();

  beforeAll(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-jwt-secret';
    process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '8h';

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await prisma.user.upsert({
      where: { email: ADMIN_EMAIL },
      update: { passwordHash, role: UserRole.ADMIN },
      create: { email: ADMIN_EMAIL, passwordHash, role: UserRole.ADMIN },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.setGlobalPrefix(API_PREFIX);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /auth/login returns token for valid credentials', async () => {
    const res = await request(app.getHttpServer())
      .post(`/${API_PREFIX}/auth/login`)
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
      .expect(201);

    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.email).toBe(ADMIN_EMAIL);
    expect(res.body.user.role).toBe(UserRole.ADMIN);
  });

  it('POST /auth/login returns 401 for wrong password', () => {
    return request(app.getHttpServer())
      .post(`/${API_PREFIX}/auth/login`)
      .send({ email: ADMIN_EMAIL, password: 'wrong-password' })
      .expect(401);
  });

  it('GET /auth/me returns user with valid Bearer token', async () => {
    const login = await request(app.getHttpServer())
      .post(`/${API_PREFIX}/auth/login`)
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });

    return request(app.getHttpServer())
      .get(`/${API_PREFIX}/auth/me`)
      .set('Authorization', `Bearer ${login.body.accessToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.email).toBe(ADMIN_EMAIL);
        expect(res.body.role).toBe(UserRole.ADMIN);
      });
  });

  it('GET /auth/me returns 401 without token', () => {
    return request(app.getHttpServer())
      .get(`/${API_PREFIX}/auth/me`)
      .expect(401);
  });
});
