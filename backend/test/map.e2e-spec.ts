import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient, ReportStatus } from '@prisma/client';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { API_PREFIX } from '../src/swagger/swagger-document';

describe('Map (e2e)', () => {
  let app: INestApplication<App>;
  const prisma = new PrismaClient();

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

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('GET /map/markers returns active public reports with coordinates only', async () => {
    const suffix = String(Date.now());

    const hidden = await prisma.foundReport.create({
      data: {
        reporterName: 'Hidden',
        reporterPhone: '+66811111111',
        reporterEmail: `hidden-${suffix}@example.com`,
        description: 'Should not appear on map.',
        status: ReportStatus.HIDDEN,
        latitude: 13.75,
        longitude: 100.5,
      },
    });

    const active = await prisma.foundReport.create({
      data: {
        reporterName: 'Active',
        reporterPhone: '+66822222222',
        reporterEmail: `active-${suffix}@example.com`,
        description: 'Visible on map.',
        status: ReportStatus.ACTIVE,
        latitude: 13.7563,
        longitude: 100.5018,
      },
    });

    const res = await request(app.getHttpServer())
      .get(`/${API_PREFIX}/map/markers`)
      .expect(200);

    expect(res.body.items.some((item: { id: string }) => item.id === active.id)).toBe(
      true,
    );
    expect(
      res.body.items.some((item: { id: string }) => item.id === hidden.id),
    ).toBe(false);

    for (const item of res.body.items) {
      expect(item.reporterPhone).toBeUndefined();
      expect(item.reporterName).toBeUndefined();
      expect(item.reporterEmail).toBeUndefined();
      expect(item.latitude).toBeDefined();
      expect(item.longitude).toBeDefined();
      expect(['found', 'lost']).toContain(item.type);
    }
  });

  it('GET /map/markers?type=found excludes lost markers', async () => {
    const suffix = String(Date.now());

    const found = await prisma.foundReport.create({
      data: {
        reporterName: 'Found',
        reporterPhone: '+66833333333',
        reporterEmail: `found-${suffix}@example.com`,
        description: 'Found marker.',
        status: ReportStatus.ACTIVE,
        latitude: 13.76,
        longitude: 100.51,
      },
    });

    const lost = await prisma.lostReport.create({
      data: {
        reporterName: 'Lost',
        reporterPhone: '+66844444444',
        reporterEmail: `lost-${suffix}@example.com`,
        description: 'Lost marker.',
        status: ReportStatus.ACTIVE,
        latitude: 13.74,
        longitude: 100.53,
      },
    });

    const res = await request(app.getHttpServer())
      .get(`/${API_PREFIX}/map/markers?type=found`)
      .expect(200);

    expect(res.body.items.some((item: { id: string }) => item.id === found.id)).toBe(
      true,
    );
    expect(res.body.items.some((item: { id: string }) => item.id === lost.id)).toBe(
      false,
    );
    expect(
      res.body.items.every((item: { type: string }) => item.type === 'found'),
    ).toBe(true);
  });

  it('GET /map/markers excludes reports without coordinates', async () => {
    const suffix = String(Date.now());

    const noCoords = await prisma.lostReport.create({
      data: {
        reporterName: 'No coords',
        reporterPhone: '+66855555555',
        reporterEmail: `nocoords-${suffix}@example.com`,
        description: 'Active but no location.',
        status: ReportStatus.ACTIVE,
      },
    });

    const res = await request(app.getHttpServer())
      .get(`/${API_PREFIX}/map/markers?type=lost`)
      .expect(200);

    expect(
      res.body.items.some((item: { id: string }) => item.id === noCoords.id),
    ).toBe(false);
  });
});
