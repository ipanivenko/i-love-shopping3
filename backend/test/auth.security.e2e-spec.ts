import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { PrismaService } from 'prisma/prisma.service';
import { CaptchaService } from '../src/auth/captcha.service';

jest.setTimeout(30000);

describe('Auth Security (e2e)', () => {
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

  beforeEach(() => {
    jest.clearAllMocks();
    captchaMock.verify.mockResolvedValue(undefined);
  });

  it('should reject register with invalid email format', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'not-an-email',
        name: 'John',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        captchaToken: 'test-captcha',
      });

    expect(response.status).toBe(400);
    expect(captchaMock.verify).not.toHaveBeenCalled();
  });

  it('should reject register with missing required fields', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'john@example.com',
        captchaToken: 'test-captcha',
      });

    expect(response.status).toBe(400);
    expect(captchaMock.verify).not.toHaveBeenCalled();
  });

  it('should reject register with malformed payload types', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 12345,
        name: ['John'],
        password: true,
        confirmPassword: false,
        captchaToken: { token: 'test-captcha' },
      });

    expect(response.status).toBe(400);
    expect(captchaMock.verify).not.toHaveBeenCalled();
  });

  it('should reject register with unexpected fields', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `extra_${Date.now()}@example.com`,
        name: 'John',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        captchaToken: 'test-captcha',
        role: 'admin',
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      expect.arrayContaining(['property role should not exist']),
    );
  });

  it('should reject register with SQL-like input as invalid email', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `' OR 1=1 --`,
        name: 'John',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        captchaToken: 'test-captcha',
      });

    expect(response.status).toBe(400);
    expect(captchaMock.verify).not.toHaveBeenCalled();
  });

  it('should reject register with script-like input as invalid email', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: '<script>alert(1)</script>',
        name: 'John',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        captchaToken: 'test-captcha',
      });

    expect(response.status).toBe(400);
    expect(captchaMock.verify).not.toHaveBeenCalled();
  });

  it('should reject login with invalid email format', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'not-an-email',
        password: 'Password123!',
      });

    expect(response.status).toBe(400);
  });

  it('should reject login with missing required fields', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'john@example.com',
      });

    expect(response.status).toBe(400);
  });

  it('should reject login with malformed payload types', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 12345,
        password: ['Password123!'],
      });

    expect(response.status).toBe(400);
  });

  it('should reject login with unexpected fields', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'john@example.com',
        password: 'Password123!',
        isAdmin: true,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      expect.arrayContaining(['property isAdmin should not exist']),
    );
  });

  it('should reject refresh without cookie', async () => {
  const response = await request(app.getHttpServer()).post('/auth/refresh');

  expect([400, 401, 429]).toContain(response.status);
});

it('should reject refresh with invalid refresh token cookie', async () => {
  const response = await request(app.getHttpServer())
    .post('/auth/refresh')
    .set('Cookie', ['refresh_token=not-a-valid-token']);

  expect([400, 401, 429, 500]).toContain(response.status);
});

it('should reject wrong password without leaking sensitive details', async () => {
  const email = `security_${Date.now()}@example.com`;

  const registerResponse = await request(app.getHttpServer())
    .post('/auth/register')
    .send({
      email,
      name: 'John',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      captchaToken: 'test-captcha',
    });

  expect([200, 201, 429]).toContain(registerResponse.status);

  if (registerResponse.status === 429) return;

  const loginResponse = await request(app.getHttpServer())
    .post('/auth/login')
    .send({
      email,
      password: 'WrongPassword123!',
    });

  expect([401, 429]).toContain(loginResponse.status);

  expect(JSON.stringify(loginResponse.body)).not.toContain('passwordHash');
});

it('should rate limit repeated login attempts', async () => {
  const email = `ratelimit_${Date.now()}@example.com`;

  await request(app.getHttpServer()).post('/auth/register').send({
    email,
    name: 'John',
    password: 'Password123!',
    confirmPassword: 'Password123!',
    captchaToken: 'test-captcha',
  });

  let gotRateLimited = false;

  for (let i = 0; i < 20; i++) {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email,
        password: 'WrongPassword123!',
      });

    if (response.status === 429) {
      gotRateLimited = true;
      break;
    }
  }

  expect(gotRateLimited).toBe(true);
});

it('should reject register when captcha verification fails', async () => {
  captchaMock.verify.mockRejectedValueOnce(
    new Error('CAPTCHA verification failed'),
  );

  const response = await request(app.getHttpServer())
    .post('/auth/register')
    .send({
      email: `captcha_${Date.now()}@example.com`,
      name: 'John',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      captchaToken: 'bad-captcha',
    });

  expect([400, 401, 429, 500]).toContain(response.status);
});
});