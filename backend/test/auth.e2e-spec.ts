import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from 'prisma/prisma.service';
import { CaptchaService } from '../src/auth/captcha.service';
import cookieParser from 'cookie-parser';

jest.setTimeout(30000);

describe('Auth API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const captchaMock = {
    verify: jest.fn().mockResolvedValue(undefined),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(CaptchaService)
      .useValue(captchaMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
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
    await app.close();
    await prisma.$disconnect();
  });

  it('/auth/register (POST) should create user', async () => {
    const email = `john_${Date.now()}@example.com`;

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        name: 'John',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        captchaToken: 'test-captcha',
      });

    expect([200, 201]).toContain(response.status);
    expect(response.body.email).toBe(email);
  });

  it('/auth/register (POST) should reject mismatched passwords', async () => {
    const email = `john2_${Date.now()}@example.com`;

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        name: 'John',
        password: 'Password123!',
        confirmPassword: 'Different123!',
        captchaToken: 'test-captcha',
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Passwords do not match');
  });

  it('/auth/login (POST) should login user', async () => {
    const email = `login_${Date.now()}@example.com`;

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        name: 'John',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        captchaToken: 'test-captcha',
      });

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email,
        password: 'Password123!',
      });

    expect(response.status).toBe(201);
    expect(response.body.accessToken).toBeDefined();

    const cookies = response.headers['set-cookie'];
    expect(cookies).toBeDefined();
  });

  it('/auth/login (POST) should reject invalid password', async () => {
    const email = `wrongpass_${Date.now()}@example.com`;

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        name: 'John',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        captchaToken: 'test-captcha',
      });

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email,
        password: 'wrong-password',
      });

    expect(response.status).toBe(401);
  });

  it('/auth/refresh (POST) should refresh token if cookie exists', async () => {
    const email = `refresh_${Date.now()}@example.com`;

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        name: 'John',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        captchaToken: 'test-captcha',
      });

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email,
        password: 'Password123!',
      });

    expect(loginResponse.status).toBe(201);

    const cookies = loginResponse.headers['set-cookie'];
    expect(cookies).toBeDefined();

    const refreshResponse = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', cookies);

    expect(refreshResponse.status).toBe(201);
    expect(refreshResponse.body.accessToken).toBeDefined();
  });

  it('/auth/logout (POST) should revoke session', async () => {
    const email = `logout_${Date.now()}@example.com`;

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        name: 'John',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        captchaToken: 'test-captcha',
      });

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email,
        password: 'Password123!',
      });

    expect(loginResponse.status).toBe(201);

    const cookies = loginResponse.headers['set-cookie'];
    expect(cookies).toBeDefined();

    const logoutResponse = await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Cookie', cookies);

    expect([200, 201, 204]).toContain(logoutResponse.status);
  });
});