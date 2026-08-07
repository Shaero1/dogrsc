import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DogStatus, PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { API_PREFIX } from '../src/swagger/swagger-document';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@dogerescue.org';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'changeme-dev-only';
const STAFF_EMAIL = 'staff@dogerescue.org';
const STAFF_PASSWORD = 'changeme-staff-dev';

const PNG_BUFFER = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

const baseDogPayload = (suffix: string) => ({
  descriptions: {
    en: {
      name: `Test Dog ${suffix}`,
      description: 'A test dog for e2e.',
      rescueStory: 'Rescued in test suite.',
    },
  },
  isPublished: true,
  status: DogStatus.AVAILABLE,
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

describe('Dogs (e2e)', () => {
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

  it('POST /admin/dogs autogenerates slug', async () => {
    const token = await login(app, ADMIN_EMAIL, ADMIN_PASSWORD);
    const suffix = String(Date.now());

    const res = await request(app.getHttpServer())
      .post(`/${API_PREFIX}/admin/dogs`)
      .set('Authorization', `Bearer ${token}`)
      .send(baseDogPayload(suffix))
      .expect(201);

    expect(res.body.slug).toBe(`test-dog-${suffix}`);
  });

  it('POST /admin/dogs returns 409 for duplicate slug', async () => {
    const token = await login(app, ADMIN_EMAIL, ADMIN_PASSWORD);
    const slug = `duplicate-dog-${Date.now()}`;

    await request(app.getHttpServer())
      .post(`/${API_PREFIX}/admin/dogs`)
      .set('Authorization', `Bearer ${token}`)
      .send({ ...baseDogPayload('a'), slug })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/${API_PREFIX}/admin/dogs`)
      .set('Authorization', `Bearer ${token}`)
      .send({ ...baseDogPayload('b'), slug })
      .expect(409);
  });

  it('POST /admin/dogs returns 400 without en.description', async () => {
    const token = await login(app, ADMIN_EMAIL, ADMIN_PASSWORD);

    await request(app.getHttpServer())
      .post(`/${API_PREFIX}/admin/dogs`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        descriptions: { en: { name: 'NoDesc' } },
      })
      .expect(400);
  });

  it('POST /admin/dogs accepts en only when th/ru are empty objects', async () => {
    const token = await login(app, ADMIN_EMAIL, ADMIN_PASSWORD);

    const res = await request(app.getHttpServer())
      .post(`/${API_PREFIX}/admin/dogs`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        ...baseDogPayload('empty-locales'),
        descriptions: {
          en: {
            name: `English Only ${Date.now()}`,
            description: 'English description only.',
          },
          th: { name: '', description: '', rescueStory: '' },
          ru: { name: '', description: '', rescueStory: '' },
        },
      })
      .expect(201);

    expect(res.body.slug).toBeTruthy();
  });

  it('STAFF can create; STAFF archive returns 403; ADMIN archive OK', async () => {
    const staffToken = await login(app, STAFF_EMAIL, STAFF_PASSWORD);
    const adminToken = await login(app, ADMIN_EMAIL, ADMIN_PASSWORD);

    const created = await request(app.getHttpServer())
      .post(`/${API_PREFIX}/admin/dogs`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        ...baseDogPayload('staff'),
        descriptions: {
          en: {
            name: `Staff Dog ${Date.now()}`,
            description: 'Created by staff.',
          },
        },
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/${API_PREFIX}/admin/dogs/${created.body.id}/archive`)
      .set('Authorization', `Bearer ${staffToken}`)
      .expect(403);

    await request(app.getHttpServer())
      .post(`/${API_PREFIX}/admin/dogs/${created.body.id}/archive`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(201);
  });

  it('public GET excludes unpublished and archived dogs', async () => {
    const token = await login(app, ADMIN_EMAIL, ADMIN_PASSWORD);

    const published = await request(app.getHttpServer())
      .post(`/${API_PREFIX}/admin/dogs`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        ...baseDogPayload('pub'),
        descriptions: {
          en: { name: `Public Pup ${Date.now()}`, description: 'Visible dog.' },
        },
        isPublished: true,
      });

    await request(app.getHttpServer())
      .post(`/${API_PREFIX}/admin/dogs`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        ...baseDogPayload('hid'),
        descriptions: {
          en: { name: `Hidden Pup ${Date.now()}`, description: 'Hidden dog.' },
        },
        isPublished: false,
      });

    const list = await request(app.getHttpServer())
      .get(`/${API_PREFIX}/dogs`)
      .expect(200);

    const slugs = list.body.items.map((item: { slug: string }) => item.slug);
    expect(slugs).toContain(published.body.slug);
    expect(slugs.every((s: string) => !s.startsWith('hidden-pup'))).toBe(true);
  });

  it('public GET by slug respects Accept-Language', async () => {
    const token = await login(app, ADMIN_EMAIL, ADMIN_PASSWORD);

    const created = await request(app.getHttpServer())
      .post(`/${API_PREFIX}/admin/dogs`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        ...baseDogPayload('lang'),
        descriptions: {
          en: { name: 'Bilingual', description: 'English text.' },
          th: { name: 'Thai Name', description: 'Thai text.' },
        },
      });

    const res = await request(app.getHttpServer())
      .get(`/${API_PREFIX}/dogs/${created.body.slug}`)
      .set('Accept-Language', 'th')
      .expect(200);

    expect(res.body.name).toBe('Thai Name');
    expect(res.body.locale).toBe('th');
  });

  it('upload media linked to dog appears in admin GET', async () => {
    const token = await login(app, ADMIN_EMAIL, ADMIN_PASSWORD);

    const dog = await request(app.getHttpServer())
      .post(`/${API_PREFIX}/admin/dogs`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        ...baseDogPayload('photo'),
        descriptions: {
          en: { name: `Photo Dog ${Date.now()}`, description: 'Has a photo.' },
        },
      });

    await request(app.getHttpServer())
      .post(`/${API_PREFIX}/admin/media`)
      .set('Authorization', `Bearer ${token}`)
      .field('entityType', 'dog')
      .field('entityId', dog.body.id)
      .attach('file', PNG_BUFFER, {
        filename: 'dog.png',
        contentType: 'image/png',
      })
      .expect(201);

    const detail = await request(app.getHttpServer())
      .get(`/${API_PREFIX}/admin/dogs/${dog.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(detail.body.media).toHaveLength(1);
  });

  it('admin list excludeArchived hides archived dogs', async () => {
    const token = await login(app, ADMIN_EMAIL, ADMIN_PASSWORD);

    const created = await request(app.getHttpServer())
      .post(`/${API_PREFIX}/admin/dogs`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        ...baseDogPayload('to-archive'),
        descriptions: {
          en: {
            name: `Archive Me ${Date.now()}`,
            description: 'Will be archived.',
          },
        },
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/${API_PREFIX}/admin/dogs/${created.body.id}/archive`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    const filtered = await request(app.getHttpServer())
      .get(`/${API_PREFIX}/admin/dogs`)
      .query({ excludeArchived: true, search: created.body.slug })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(filtered.body.items).toHaveLength(0);

    const all = await request(app.getHttpServer())
      .get(`/${API_PREFIX}/admin/dogs`)
      .query({ status: 'ARCHIVED', search: created.body.slug })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(all.body.items.some((d: { id: string }) => d.id === created.body.id)).toBe(
      true,
    );
  });

  it('PATCH can clear optional th locale when sent empty', async () => {
    const token = await login(app, ADMIN_EMAIL, ADMIN_PASSWORD);
    const name = `Clear TH ${Date.now()}`;

    const created = await request(app.getHttpServer())
      .post(`/${API_PREFIX}/admin/dogs`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        ...baseDogPayload('clear-th'),
        descriptions: {
          en: { name, description: 'English.' },
          th: { name: 'Thai name', description: 'Thai text.' },
        },
      })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/${API_PREFIX}/admin/dogs/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        descriptions: {
          en: { name, description: 'English.' },
          th: {},
        },
      })
      .expect(200);

    const detail = await request(app.getHttpServer())
      .get(`/${API_PREFIX}/admin/dogs/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(detail.body.descriptions.th).toBeUndefined();
  });
});
