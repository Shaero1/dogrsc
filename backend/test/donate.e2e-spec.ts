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

describe('Donate (e2e)', () => {
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

  it('GET /donate/crypto-addresses returns only active displayed addresses', async () => {
    const suffix = String(Date.now());
    const code = `T${String(suffix).slice(-8)}`;

    const displayed = await prisma.cryptoAddress.create({
      data: {
        currencyCode: code,
        label: 'Test Coin',
        address: `bc1qdisplayed${suffix}address0000000000`,
        isActive: true,
        isDisplayed: true,
      },
    });

    await prisma.cryptoAddress.create({
      data: {
        currencyCode: code,
        address: `bc1qbackup${suffix}address00000000000`,
        isActive: true,
        isDisplayed: false,
      },
    });

    await prisma.cryptoAddress.create({
      data: {
        currencyCode: code,
        address: `bc1qinactv${suffix}address000000000000`,
        isActive: false,
        isDisplayed: false,
      },
    });

    const res = await request(app.getHttpServer())
      .get(`/${API_PREFIX}/donate/crypto-addresses`)
      .expect(200);

    const forCurrency = res.body.items.filter(
      (item: { currencyCode: string }) => item.currencyCode === code,
    );
    expect(forCurrency).toHaveLength(1);
    expect(forCurrency[0].id).toBe(displayed.id);
    expect(forCurrency[0].label).toBe('Test Coin');
  });

  it('POST /admin/crypto-addresses creates first address as active and displayed', async () => {
    const token = await login(app, STAFF_EMAIL, STAFF_PASSWORD);
    const suffix = String(Date.now());
    const code = `N${String(suffix).slice(-8)}`;

    const res = await request(app.getHttpServer())
      .post(`/${API_PREFIX}/admin/crypto-addresses`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        currencyCode: code,
        label: 'New Coin',
        address: `DDOGEcreate${suffix}address000000000000`,
      })
      .expect(201);

    expect(res.body.currencyCode).toBe(code);
    expect(res.body.isActive).toBe(true);
    expect(res.body.isDisplayed).toBe(true);
  });

  it('POST second address for same currency creates inactive backup (option A)', async () => {
    const token = await login(app, STAFF_EMAIL, STAFF_PASSWORD);
    const suffix = String(Date.now());
    const code = `B${String(suffix).slice(-8)}`;

    await request(app.getHttpServer())
      .post(`/${API_PREFIX}/admin/crypto-addresses`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        currencyCode: code,
        address: `0xfirst${suffix}address0000000000000000`,
      })
      .expect(201);

    const second = await request(app.getHttpServer())
      .post(`/${API_PREFIX}/admin/crypto-addresses`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        currencyCode: code,
        address: `0xsecond${suffix}address000000000000000`,
      })
      .expect(201);

    expect(second.body.isActive).toBe(false);
    expect(second.body.isDisplayed).toBe(false);
  });

  it('PATCH isDisplayed=true shows backup on public list', async () => {
    const token = await login(app, ADMIN_EMAIL, ADMIN_PASSWORD);
    const suffix = String(Date.now());
    const code = `S${String(suffix).slice(-8)}`;

    const first = await request(app.getHttpServer())
      .post(`/${API_PREFIX}/admin/crypto-addresses`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        currencyCode: code,
        address: `0xfirst${suffix}swapaddress000000000000`,
      })
      .expect(201);

    const second = await request(app.getHttpServer())
      .post(`/${API_PREFIX}/admin/crypto-addresses`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        currencyCode: code,
        address: `0xsecond${suffix}swapaddress00000000000`,
      })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/${API_PREFIX}/admin/crypto-addresses/${second.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ isDisplayed: true })
      .expect(200);

    const publicRes = await request(app.getHttpServer())
      .get(`/${API_PREFIX}/donate/crypto-addresses`)
      .expect(200);

    const shown = publicRes.body.items.find(
      (item: { currencyCode: string }) => item.currencyCode === code,
    );
    expect(shown?.id).toBe(second.body.id);
    expect(shown?.id).not.toBe(first.body.id);

    const firstUpdated = await prisma.cryptoAddress.findUnique({
      where: { id: first.body.id },
    });
    expect(firstUpdated?.isDisplayed).toBe(false);
  });

  it('PATCH deactivates address and clears displayed flag', async () => {
    const token = await login(app, ADMIN_EMAIL, ADMIN_PASSWORD);
    const suffix = String(Date.now());
    const code = `D${String(suffix).slice(-8)}`;

    const created = await request(app.getHttpServer())
      .post(`/${API_PREFIX}/admin/crypto-addresses`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        currencyCode: code,
        address: `TUSDTpatch${suffix}address0000000000000`,
      })
      .expect(201);

    const res = await request(app.getHttpServer())
      .patch(`/${API_PREFIX}/admin/crypto-addresses/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ isActive: false })
      .expect(200);

    expect(res.body.isActive).toBe(false);
    expect(res.body.isDisplayed).toBe(false);
  });
});
