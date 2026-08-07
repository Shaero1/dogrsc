import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  DogStatus,
  DonationStatus,
  PrismaClient,
  ReportStatus,
  UserRole,
} from '@prisma/client';
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

describe('Dashboard (e2e)', () => {
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

  it('GET /admin/dashboard/stats requires auth', async () => {
    await request(app.getHttpServer())
      .get(`/${API_PREFIX}/admin/dashboard/stats`)
      .expect(401);
  });

  it('GET /admin/dashboard/stats returns aggregate counts', async () => {
    const token = await login(app, STAFF_EMAIL, STAFF_PASSWORD);
    const suffix = String(Date.now());

    await prisma.dog.create({
      data: {
        slug: `dash-available-${suffix}`,
        status: DogStatus.AVAILABLE,
        isPublished: false,
        descriptions: { en: { name: 'Dash Available', description: 'Test.' } },
      },
    });

    await prisma.dog.create({
      data: {
        slug: `dash-care-${suffix}`,
        status: DogStatus.IN_CARE,
        isPublished: true,
        descriptions: { en: { name: 'Dash Care', description: 'Test.' } },
      },
    });

    await prisma.foundReport.create({
      data: {
        reporterName: 'Dash',
        reporterPhone: '+66812345678',
        reporterEmail: `dash-found-${suffix}@example.com`,
        description: 'Active found for dashboard test.',
        status: ReportStatus.ACTIVE,
      },
    });

    await prisma.lostReport.create({
      data: {
        reporterName: 'Dash',
        reporterPhone: '+66812345679',
        reporterEmail: `dash-lost-${suffix}@example.com`,
        description: 'Active lost for dashboard test.',
        status: ReportStatus.ACTIVE,
      },
    });

    const monthStart = new Date(
      Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1),
    );

    await prisma.donation.create({
      data: {
        amount: 500,
        currency: 'THB',
        status: DonationStatus.CONFIRMED,
        createdAt: monthStart,
      },
    });

    const res = await request(app.getHttpServer())
      .get(`/${API_PREFIX}/admin/dashboard/stats`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.dogsUnderCare).toBeGreaterThanOrEqual(1);
    expect(res.body.reportsActive).toBeGreaterThanOrEqual(2);
    expect(res.body.dogsAvailable).toBeGreaterThanOrEqual(1);
    expect(res.body.donationsThisMonth).toBeGreaterThanOrEqual(500);
  });
});
