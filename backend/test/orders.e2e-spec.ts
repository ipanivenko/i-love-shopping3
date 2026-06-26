import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../prisma/prisma.service';

jest.setTimeout(30000);

describe('Orders API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    if (app) await app.close();
    if (prisma) await prisma.$disconnect();
  });

  it('should reject order creation with empty payload', async () => {
    await request(app.getHttpServer())
      .post('/orders')
      .send({})
      .expect(400);
  });

  it('should reject order creation with unexpected fields', async () => {
    await request(app.getHttpServer())
      .post('/orders')
      .send({
        isAdmin: true,
        status: 'PAYMENT_SUCCESSFUL',
      })
      .expect(400);
  });

  it('should reject unauthenticated access to my orders', async () => {
    await request(app.getHttpServer())
      .get('/orders/me')
      .expect(401);
  });

  it('should reject unauthenticated access to my order by id', async () => {
    await request(app.getHttpServer())
      .get('/orders/me/test-order-id')
      .expect(401);
  });

  it('should reject unauthenticated order cancellation', async () => {
    await request(app.getHttpServer())
      .patch('/orders/me/test-order-id/cancel')
      .expect(401);
  });

  it('should reject invalid public order lookup without guest token', async () => {
    const response = await request(app.getHttpServer())
      .get('/orders/non-existing-order-id');

    expect([400, 401, 403, 404]).toContain(response.status);
  });

  it('should reject invalid public order lookup with invalid guest token', async () => {
    const response = await request(app.getHttpServer())
      .get('/orders/non-existing-order-id')
      .set('x-guest-token', 'invalid-guest-token');

    expect([400, 401, 403, 404]).toContain(response.status);
  });
});