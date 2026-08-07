import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  DonationStatus,
  PaymentMethod,
  PrismaClient,
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

describe('Donation records (e2e)', () => {
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

  it('POST /donate/donations creates PENDING record', async () => {
    const suffix = String(Date.now());

    const res = await request(app.getHttpServer())
      .post(`/${API_PREFIX}/donate/donations`)
      .send({
        amount: 750,
        donorName: 'Public Donor',
        donorEmail: `donor-${suffix}@example.com`,
        paymentMethod: PaymentMethod.BANK,
        captchaToken: 'test-captcha-token',
      })
      .expect(201);

    expect(res.body.status).toBe(DonationStatus.PENDING);
    expect(res.body.paymentMethod).toBe(PaymentMethod.BANK);
    expect(res.body.amount).toBe('750');
  });

  it('STAFF can confirm pending donation', async () => {
    const suffix = String(Date.now());
    const token = await login(app, STAFF_EMAIL, STAFF_PASSWORD);

    const created = await request(app.getHttpServer())
      .post(`/${API_PREFIX}/donate/donations`)
      .send({
        amount: 300,
        donorName: 'To Confirm',
        donorEmail: `confirm-${suffix}@example.com`,
        paymentMethod: PaymentMethod.CRYPTO,
        captchaToken: 'test-captcha-token',
      })
      .expect(201);

    const res = await request(app.getHttpServer())
      .patch(`/${API_PREFIX}/admin/donations/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: DonationStatus.CONFIRMED })
      .expect(200);

    expect(res.body.status).toBe(DonationStatus.CONFIRMED);
  });

  it('PATCH returns 400 when moderating non-PENDING donation', async () => {
    const suffix = String(Date.now());
    const token = await login(app, ADMIN_EMAIL, ADMIN_PASSWORD);

    const created = await request(app.getHttpServer())
      .post(`/${API_PREFIX}/admin/donations`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        amount: 100,
        donorName: 'Admin Donor',
        donorEmail: `admin-${suffix}@example.com`,
        paymentMethod: PaymentMethod.BANK,
        status: DonationStatus.CONFIRMED,
      })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/${API_PREFIX}/admin/donations/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: DonationStatus.FAILED })
      .expect(400);
  });

  it('GET /admin/donations filters by status', async () => {
    const token = await login(app, STAFF_EMAIL, STAFF_PASSWORD);

    const pending = await request(app.getHttpServer())
      .get(`/${API_PREFIX}/admin/donations?status=PENDING`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(
      pending.body.items.every(
        (item: { status: DonationStatus }) =>
          item.status === DonationStatus.PENDING,
      ),
    ).toBe(true);
  });
});
