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

describe('Admin users (e2e)', () => {
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

  it('STAFF cannot list admin users', async () => {
    const token = await login(app, STAFF_EMAIL, STAFF_PASSWORD);

    await request(app.getHttpServer())
      .get(`/${API_PREFIX}/admin/users`)
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });

  it('ADMIN can list admin panel users', async () => {
    const token = await login(app, ADMIN_EMAIL, ADMIN_PASSWORD);

    const res = await request(app.getHttpServer())
      .get(`/${API_PREFIX}/admin/users`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.items.length).toBeGreaterThanOrEqual(2);
    expect(
      res.body.items.every(
        (item: { role: UserRole }) =>
          item.role === UserRole.ADMIN || item.role === UserRole.STAFF,
      ),
    ).toBe(true);
    expect(
      res.body.items.every(
        (item: { email: string }) => item.email !== 'system@dogerescue.org',
      ),
    ).toBe(true);
  });

  it('ADMIN can create STAFF user', async () => {
    const token = await login(app, ADMIN_EMAIL, ADMIN_PASSWORD);
    const suffix = String(Date.now());
    const email = `new-staff-${suffix}@example.com`;

    const res = await request(app.getHttpServer())
      .post(`/${API_PREFIX}/admin/users`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        email,
        password: 'password123',
        role: UserRole.STAFF,
      })
      .expect(201);

    expect(res.body.email).toBe(email);
    expect(res.body.role).toBe(UserRole.STAFF);

    await request(app.getHttpServer())
      .post(`/${API_PREFIX}/auth/login`)
      .send({ email, password: 'password123' })
      .expect(201);
  });

  it('ADMIN can update user role', async () => {
    const token = await login(app, ADMIN_EMAIL, ADMIN_PASSWORD);
    const suffix = String(Date.now());
    const email = `role-change-${suffix}@example.com`;

    const created = await request(app.getHttpServer())
      .post(`/${API_PREFIX}/admin/users`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        email,
        password: 'password123',
        role: UserRole.STAFF,
      })
      .expect(201);

    const updated = await request(app.getHttpServer())
      .patch(`/${API_PREFIX}/admin/users/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ role: UserRole.ADMIN })
      .expect(200);

    expect(updated.body.role).toBe(UserRole.ADMIN);
  });

  it('cannot demote the last admin', async () => {
    const token = await login(app, ADMIN_EMAIL, ADMIN_PASSWORD);

    await prisma.user.updateMany({
      where: {
        role: UserRole.ADMIN,
        email: { not: ADMIN_EMAIL },
      },
      data: { role: UserRole.STAFF },
    });

    const admin = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
    });

    expect(admin).toBeTruthy();

    await request(app.getHttpServer())
      .patch(`/${API_PREFIX}/admin/users/${admin!.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ role: UserRole.STAFF })
      .expect(400);
  });
});
