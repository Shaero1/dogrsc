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
const STAFF_EMAIL = 'staff@dogerescue.org';
const STAFF_PASSWORD = 'changeme-staff-dev';

const baseStoryPayload = (suffix: string) => ({
  content: {
    en: {
      title: `Test Story ${suffix}`,
      body: 'Full story body for e2e testing.',
    },
  },
  isPublished: true,
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

describe('Stories (e2e)', () => {
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
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.setGlobalPrefix(API_PREFIX);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /admin/stories autogenerates slug', async () => {
    const token = await login(app, ADMIN_EMAIL, ADMIN_PASSWORD);
    const suffix = String(Date.now());

    const res = await request(app.getHttpServer())
      .post(`/${API_PREFIX}/admin/stories`)
      .set('Authorization', `Bearer ${token}`)
      .send(baseStoryPayload(suffix))
      .expect(201);

    expect(res.body.slug).toBe(`test-story-${suffix}`);
    expect(res.body.isPublished).toBe(true);
  });

  it('GET /stories returns only published stories', async () => {
    const token = await login(app, STAFF_EMAIL, STAFF_PASSWORD);
    const suffix = String(Date.now());

    const created = await request(app.getHttpServer())
      .post(`/${API_PREFIX}/admin/stories`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        ...baseStoryPayload(suffix),
        slug: `public-story-${suffix}`,
      })
      .expect(201);

    const draft = await request(app.getHttpServer())
      .post(`/${API_PREFIX}/admin/stories`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        content: {
          en: { title: 'Draft story', body: 'Should not appear publicly.' },
        },
        isPublished: false,
        slug: `draft-story-${suffix}`,
      })
      .expect(201);

    const listRes = await request(app.getHttpServer())
      .get(`/${API_PREFIX}/stories`)
      .set('Accept-Language', 'en')
      .expect(200);

    const slugs = listRes.body.items.map((item: { slug: string }) => item.slug);
    expect(slugs).toContain(created.body.slug);
    expect(slugs).not.toContain(draft.body.slug);
  });

  it('GET /stories/:slug returns localized detail', async () => {
    const token = await login(app, ADMIN_EMAIL, ADMIN_PASSWORD);
    const suffix = String(Date.now());
    const slug = `detail-story-${suffix}`;

    await request(app.getHttpServer())
      .post(`/${API_PREFIX}/admin/stories`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        slug,
        content: {
          en: { title: 'English title', body: 'English body text.' },
          ru: { title: 'Русский заголовок', body: 'Русский текст.' },
        },
        isPublished: true,
      })
      .expect(201);

    const enRes = await request(app.getHttpServer())
      .get(`/${API_PREFIX}/stories/${slug}`)
      .set('Accept-Language', 'en')
      .expect(200);

    expect(enRes.body.title).toBe('English title');
    expect(enRes.body.body).toBe('English body text.');

    const ruRes = await request(app.getHttpServer())
      .get(`/${API_PREFIX}/stories/${slug}`)
      .set('Accept-Language', 'ru')
      .expect(200);

    expect(ruRes.body.title).toBe('Русский заголовок');
    expect(ruRes.body.body).toBe('Русский текст.');
  });

  it('DELETE /admin/stories/:id requires ADMIN', async () => {
    const adminToken = await login(app, ADMIN_EMAIL, ADMIN_PASSWORD);
    const staffToken = await login(app, STAFF_EMAIL, STAFF_PASSWORD);
    const suffix = String(Date.now());

    const created = await request(app.getHttpServer())
      .post(`/${API_PREFIX}/admin/stories`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        ...baseStoryPayload(suffix),
        slug: `delete-story-${suffix}`,
        isPublished: false,
      })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/${API_PREFIX}/admin/stories/${created.body.id}`)
      .set('Authorization', `Bearer ${staffToken}`)
      .expect(403);

    await request(app.getHttpServer())
      .delete(`/${API_PREFIX}/admin/stories/${created.body.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(204);
  });
});
