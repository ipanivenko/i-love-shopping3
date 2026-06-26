import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../prisma/prisma.service';

jest.setTimeout(30000);

describe('Products API (e2e)', () => {
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

  it('should return paginated products list', async () => {
    const response = await request(app.getHttpServer())
      .get('/products')
      .expect(200);

    expect(response.body).toHaveProperty('items');
    expect(response.body).toHaveProperty('page');
    expect(response.body).toHaveProperty('pageSize');
    expect(response.body).toHaveProperty('total');
    expect(Array.isArray(response.body.items)).toBe(true);
  });

  it('should support pagination query parameters', async () => {
    const response = await request(app.getHttpServer())
      .get('/products?page=1&pageSize=10')
      .expect(200);

    expect(response.body.page).toBe(1);
    expect(response.body.pageSize).toBe(10);
    expect(Array.isArray(response.body.items)).toBe(true);
  });

  it('should reject invalid pagination parameters', async () => {
    await request(app.getHttpServer())
      .get('/products?page=abc&pageSize=xyz')
      .expect(400);
  });

  it('should support product search query', async () => {
    const response = await request(app.getHttpServer())
      .get('/products?query=test')
      .expect(200);

    expect(response.body).toHaveProperty('items');
    expect(Array.isArray(response.body.items)).toBe(true);
  });

  it('should reject unsupported query parameters', async () => {
    await request(app.getHttpServer())
      .get('/products?isAdmin=true')
      .expect(400);
  });
});