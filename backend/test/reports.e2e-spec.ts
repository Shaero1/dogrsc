import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient, ReportStatus, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { API_PREFIX } from '../src/swagger/swagger-document';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@dogerescue.org';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'changeme-dev-only';
const STAFF_EMAIL = 'staff@dogerescue.org';
const STAFF_PASSWORD = 'changeme-staff-dev';
const SYSTEM_USER_EMAIL = 'system@dogerescue.org';

const PNG_BUFFER = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

const baseReportPayload = (suffix: string) => ({
  reporterName: `Reporter ${suffix}`,
  reporterPhone: '+66812345678',
  reporterEmail: `reporter-${suffix}@example.com`,
  description: 'Small dog seen near the market entrance.',
  captchaToken: 'test-captcha-token',
});

async function login(
  app: INestApplication<App>,
  email: string,
  password: string,
): Promise<string> {
  const res = await request(app.getHttpServer())
    .post(`/${API_PREFIX}/auth/login`)
    .send({ email, password })
    .expect(201);

  return res.body.accessToken as string;
}

describe('Reports (e2e)', () => {
  let app: INestApplication<App>;
  const prisma = new PrismaClient();

  beforeAll(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-jwt-secret';
    process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '8h';
    process.env.CAPTCHA_SKIP = 'true';

    const adminHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await prisma.user.upsert({
      where: { email: ADMIN_EMAIL },
      update: { passwordHash: adminHash, role: UserRole.ADMIN },
      create: {
        email: ADMIN_EMAIL,
        passwordHash: adminHash,
        role: UserRole.ADMIN,
      },
    });

    const staffHash = await bcrypt.hash(STAFF_PASSWORD, 10);
    await prisma.user.upsert({
      where: { email: STAFF_EMAIL },
      update: { passwordHash: staffHash, role: UserRole.STAFF },
      create: {
        email: STAFF_EMAIL,
        passwordHash: staffHash,
        role: UserRole.STAFF,
      },
    });

    const systemHash = await bcrypt.hash('system-no-login', 10);
    await prisma.user.upsert({
      where: { email: SYSTEM_USER_EMAIL },
      update: { passwordHash: systemHash, role: UserRole.USER },
      create: {
        email: SYSTEM_USER_EMAIL,
        passwordHash: systemHash,
        role: UserRole.USER,
      },
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
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.setGlobalPrefix(API_PREFIX);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /found-reports creates ACTIVE report visible publicly', async () => {
    const suffix = String(Date.now());

    const created = await request(app.getHttpServer())
      .post(`/${API_PREFIX}/found-reports`)
      .send(baseReportPayload(suffix))
      .expect(201);

    expect(created.body.id).toBeDefined();
    expect(created.body.status).toBe(ReportStatus.ACTIVE);

    const listed = await request(app.getHttpServer())
      .get(`/${API_PREFIX}/found-reports`)
      .expect(200);

    expect(
      listed.body.items.some(
        (item: { id: string }) => item.id === created.body.id,
      ),
    ).toBe(true);

    const detail = await request(app.getHttpServer())
      .get(`/${API_PREFIX}/found-reports/${created.body.id}`)
      .expect(200);

    expect(detail.body.reporterPhone).toBe('+66812345678');
    expect(detail.body.description).toContain('market');
  });

  it('POST /found-reports rejects missing captcha when CAPTCHA_SKIP is off', async () => {
    process.env.CAPTCHA_SKIP = 'false';
    process.env.CAPTCHA_SECRET_KEY = 'invalid';

    const suffix = String(Date.now());
    const payload = { ...baseReportPayload(suffix) };
    delete (payload as { captchaToken?: string }).captchaToken;

    await request(app.getHttpServer())
      .post(`/${API_PREFIX}/found-reports`)
      .send(payload)
      .expect(400);

    process.env.CAPTCHA_SKIP = 'true';
  });

  it('STAFF can hide found report', async () => {
    const suffix = String(Date.now());
    const staffToken = await login(app, STAFF_EMAIL, STAFF_PASSWORD);

    const created = await request(app.getHttpServer())
      .post(`/${API_PREFIX}/found-reports`)
      .send(baseReportPayload(suffix))
      .expect(201);

    const res = await request(app.getHttpServer())
      .patch(`/${API_PREFIX}/admin/found-reports/${created.body.id}`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ status: ReportStatus.HIDDEN })
      .expect(200);

    expect(res.body.status).toBe(ReportStatus.HIDDEN);

    await request(app.getHttpServer())
      .get(`/${API_PREFIX}/found-reports/${created.body.id}`)
      .expect(404);
  });

  it('STAFF can verify lost report', async () => {
    const suffix = String(Date.now());
    const staffToken = await login(app, STAFF_EMAIL, STAFF_PASSWORD);

    const created = await request(app.getHttpServer())
      .post(`/${API_PREFIX}/lost-reports`)
      .send(baseReportPayload(suffix))
      .expect(201);

    const res = await request(app.getHttpServer())
      .patch(`/${API_PREFIX}/admin/lost-reports/${created.body.id}`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ status: ReportStatus.VERIFIED })
      .expect(200);

    expect(res.body.status).toBe(ReportStatus.VERIFIED);
  });

  it('POST /found-reports/:id/media uploads photo', async () => {
    const suffix = String(Date.now());

    const created = await request(app.getHttpServer())
      .post(`/${API_PREFIX}/found-reports`)
      .send(baseReportPayload(suffix))
      .expect(201);

    const res = await request(app.getHttpServer())
      .post(`/${API_PREFIX}/found-reports/${created.body.id}/media`)
      .attach('file', PNG_BUFFER, {
        filename: 'found.png',
        contentType: 'image/png',
      })
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.mimeType).toBe('image/png');
  });

  it('GET /admin/found-reports filters by status', async () => {
    const suffix = String(Date.now());
    const staffToken = await login(app, STAFF_EMAIL, STAFF_PASSWORD);

    const created = await request(app.getHttpServer())
      .post(`/${API_PREFIX}/found-reports`)
      .send(baseReportPayload(suffix))
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/${API_PREFIX}/admin/found-reports/${created.body.id}`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ status: ReportStatus.HIDDEN })
      .expect(200);

    const hidden = await request(app.getHttpServer())
      .get(`/${API_PREFIX}/admin/found-reports?status=HIDDEN`)
      .set('Authorization', `Bearer ${staffToken}`)
      .expect(200);

    expect(
      hidden.body.items.some(
        (item: { id: string }) => item.id === created.body.id,
      ),
    ).toBe(true);
  });
});
