import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { API_PREFIX } from '../src/swagger/swagger-document';
import { seedContentTranslations } from '../prisma/content-seed-data';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@dogerescue.org';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'changeme-dev-only';
const STAFF_EMAIL = 'staff@dogerescue.org';
const STAFF_PASSWORD = 'changeme-staff-dev';

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

describe('CMS content (e2e)', () => {
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

    await seedContentTranslations(prisma);
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

  it('returns public home content for en locale', async () => {
    const res = await request(app.getHttpServer())
      .get(`/${API_PREFIX}/content/pages/home`)
      .query({ locale: 'en' })
      .expect(200);

    expect(res.body.entityId).toBe('home');
    expect(res.body.fields.heroTitle).toBeTruthy();
  });

  it('returns public faq content for ru locale', async () => {
    const res = await request(app.getHttpServer())
      .get(`/${API_PREFIX}/content/pages/faq`)
      .query({ locale: 'ru' })
      .expect(200);

    expect(res.body.entityId).toBe('faq');
    expect(res.body.fields.faq1Question).toBeTruthy();
  });

  it('returns public about content for th locale', async () => {
    const res = await request(app.getHttpServer())
      .get(`/${API_PREFIX}/content/pages/about`)
      .query({ locale: 'th' })
      .expect(200);

    expect(res.body.entityId).toBe('about');
    expect(res.body.locale).toBe('th');
    expect(res.body.fields.title).toContain('Dog Rescue');
    expect(res.body.fields.missionTitle).toBeTruthy();
  });

  it('falls back to en when th field is missing', async () => {
    await prisma.contentTranslation.deleteMany({
      where: {
        entityType: 'page',
        entityId: 'about',
        locale: 'th',
        field: 'missionTitle',
      },
    });

    const res = await request(app.getHttpServer())
      .get(`/${API_PREFIX}/content/pages/about`)
      .query({ locale: 'th' })
      .expect(200);

    expect(res.body.fields.missionTitle).toBe('Our mission');
  });

  it('ADMIN can list pages and upsert content', async () => {
    const token = await login(app, ADMIN_EMAIL, ADMIN_PASSWORD);

    const list = await request(app.getHttpServer())
      .get(`/${API_PREFIX}/admin/content/pages`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(list.body.some((page: { id: string }) => page.id === 'about')).toBe(
      true,
    );

    const updatedTitle = `About CMS test ${Date.now()}`;
    const put = await request(app.getHttpServer())
      .put(`/${API_PREFIX}/admin/content/pages/about`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [{ locale: 'en', field: 'title', value: updatedTitle }],
      })
      .expect(200);

    expect(
      put.body.items.some(
        (item: { locale: string; field: string; value: string }) =>
          item.locale === 'en' &&
          item.field === 'title' &&
          item.value === updatedTitle,
      ),
    ).toBe(true);

    const publicRes = await request(app.getHttpServer())
      .get(`/${API_PREFIX}/content/pages/about`)
      .query({ locale: 'en' })
      .expect(200);

    expect(publicRes.body.fields.title).toBe(updatedTitle);
  });

  it('STAFF cannot upsert content', async () => {
    const token = await login(app, STAFF_EMAIL, STAFF_PASSWORD);

    await request(app.getHttpServer())
      .put(`/${API_PREFIX}/admin/content/pages/about`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [{ locale: 'en', field: 'title', value: 'Blocked' }],
      })
      .expect(403);
  });

  it('returns 404 for unknown page', async () => {
    await request(app.getHttpServer())
      .get(`/${API_PREFIX}/content/pages/unknown-page`)
      .query({ locale: 'en' })
      .expect(404);
  });
});
