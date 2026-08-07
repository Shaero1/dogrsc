import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { DEFAULT_MEDIA_MAX_BYTES } from '../src/media/media.constants';
import { API_PREFIX } from '../src/swagger/swagger-document';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@dogerescue.org';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'changeme-dev-only';
const STAFF_EMAIL = 'staff@dogerescue.org';
const STAFF_PASSWORD = 'changeme-staff-dev';

const PNG_BUFFER = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

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

describe('Media (e2e)', () => {
  let app: INestApplication<App>;
  const prisma = new PrismaClient();

  beforeAll(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-jwt-secret';
    process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '8h';

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

  it('POST /admin/media uploads image and returns presigned url', async () => {
    const token = await login(app, ADMIN_EMAIL, ADMIN_PASSWORD);

    const res = await request(app.getHttpServer())
      .post(`/${API_PREFIX}/admin/media`)
      .set('Authorization', `Bearer ${token}`)
      .attach('file', PNG_BUFFER, {
        filename: 'pixel.png',
        contentType: 'image/png',
      })
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.mimeType).toBe('image/png');
    expect(res.body.url).toContain('http');
  });

  it('GET /admin/media/:id returns metadata and url', async () => {
    const token = await login(app, ADMIN_EMAIL, ADMIN_PASSWORD);

    const upload = await request(app.getHttpServer())
      .post(`/${API_PREFIX}/admin/media`)
      .set('Authorization', `Bearer ${token}`)
      .attach('file', PNG_BUFFER, {
        filename: 'pixel.png',
        contentType: 'image/png',
      });

    const res = await request(app.getHttpServer())
      .get(`/${API_PREFIX}/admin/media/${upload.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.url).toBeDefined();
    expect(res.body.mimeType).toBe('image/png');
  });

  it('DELETE /admin/media/:id soft-deletes (ADMIN)', async () => {
    const token = await login(app, ADMIN_EMAIL, ADMIN_PASSWORD);

    const upload = await request(app.getHttpServer())
      .post(`/${API_PREFIX}/admin/media`)
      .set('Authorization', `Bearer ${token}`)
      .attach('file', PNG_BUFFER, {
        filename: 'pixel.png',
        contentType: 'image/png',
      });

    await request(app.getHttpServer())
      .delete(`/${API_PREFIX}/admin/media/${upload.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    await request(app.getHttpServer())
      .get(`/${API_PREFIX}/admin/media/${upload.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  it('STAFF can delete own upload', async () => {
    const token = await login(app, STAFF_EMAIL, STAFF_PASSWORD);

    const upload = await request(app.getHttpServer())
      .post(`/${API_PREFIX}/admin/media`)
      .set('Authorization', `Bearer ${token}`)
      .attach('file', PNG_BUFFER, {
        filename: 'staff.png',
        contentType: 'image/png',
      })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/${API_PREFIX}/admin/media/${upload.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);
  });

  it('STAFF cannot delete another user upload without entity', async () => {
    const adminToken = await login(app, ADMIN_EMAIL, ADMIN_PASSWORD);
    const staffToken = await login(app, STAFF_EMAIL, STAFF_PASSWORD);

    const upload = await request(app.getHttpServer())
      .post(`/${API_PREFIX}/admin/media`)
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', PNG_BUFFER, {
        filename: 'admin-only.png',
        contentType: 'image/png',
      });

    await request(app.getHttpServer())
      .delete(`/${API_PREFIX}/admin/media/${upload.body.id}`)
      .set('Authorization', `Bearer ${staffToken}`)
      .expect(403);
  });

  it('POST /admin/media rejects invalid mime type', async () => {
    const token = await login(app, ADMIN_EMAIL, ADMIN_PASSWORD);

    await request(app.getHttpServer())
      .post(`/${API_PREFIX}/admin/media`)
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from('not an image'), {
        filename: 'notes.txt',
        contentType: 'text/plain',
      })
      .expect(400);
  });

  it('POST /admin/media rejects oversize file', async () => {
    const token = await login(app, ADMIN_EMAIL, ADMIN_PASSWORD);
    const oversized = Buffer.alloc(DEFAULT_MEDIA_MAX_BYTES + 1, 0);

    const res = await request(app.getHttpServer())
      .post(`/${API_PREFIX}/admin/media`)
      .set('Authorization', `Bearer ${token}`)
      .attach('file', oversized, {
        filename: 'huge.png',
        contentType: 'image/png',
      });

    expect([400, 413]).toContain(res.status);
  });
});
