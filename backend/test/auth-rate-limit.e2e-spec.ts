import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../prisma/prisma.service';
import { CaptchaService } from '../src/auth/captcha.service';

jest.setTimeout(30000);

describe('Auth Rate Limiting (e2e)', () => {
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

  it('should return 429 when too many login requests are sent', async () => {
    const email = `ratelimit_${Date.now()}@example.com`;

    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        name: 'Rate Limit User',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        captchaToken: 'test-captcha',
      });

    expect([200, 201]).toContain(registerResponse.status);

    let received429 = false;
    let lastStatus = 0;

    for (let i = 0; i < 30; i++) {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email,
          password: 'WrongPassword123!',
        });

      lastStatus = response.status;

      if (response.status === 429) {
        received429 = true;
        break;
      }
    }

    expect(received429).toBe(true);
    expect(lastStatus).toBe(429);
  });
});