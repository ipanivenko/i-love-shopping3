import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../src/app.module'
import { PrismaService } from '../prisma/prisma.service'
import { CaptchaService } from '../src/auth/captcha.service'

describe('Registration Flow (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService

  const validRegisterDto = {
    email: 'registration-test@test.com',
    password: 'StrongPassword123!',
    confirmPassword: 'StrongPassword123!',
    name: 'Registration Test User',
    captchaToken: 'test-captcha-token',
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule =
      await Test.createTestingModule({
        imports: [AppModule],
      })
        .overrideProvider(CaptchaService)
        .useValue({
          verify: jest.fn().mockResolvedValue(true),
        })
        .compile()

    app = moduleFixture.createNestApplication()

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    )

    await app.init()

    prisma = app.get(PrismaService)
  })

  beforeEach(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'registration-test',
        },
      },
    })
  })

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'registration-test',
        },
      },
    })

    await app.close()
  })

  it('should register a new user successfully', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(validRegisterDto)
      .expect(201)

    expect(response.body.email).toBe(validRegisterDto.email)
    expect(response.body.name).toBe(validRegisterDto.name)

    expect(response.body).not.toHaveProperty('password')
    expect(response.body).not.toHaveProperty('passwordHash')
  })

  it('should store user in database with hashed password', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        ...validRegisterDto,
        email: 'registration-test-db@test.com',
      })
      .expect(201)

    const user = await prisma.user.findUnique({
      where: {
        email: 'registration-test-db@test.com',
      },
    })

    expect(user).toBeDefined()
    expect(user?.email).toBe('registration-test-db@test.com')
    expect(user?.name).toBe(validRegisterDto.name)

    expect(user?.passwordHash).toBeDefined()
    expect(user?.passwordHash).not.toBe(validRegisterDto.password)
  })

  it('should reject duplicated email', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        ...validRegisterDto,
        email: 'registration-test-duplicate@test.com',
      })
      .expect(201)

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        ...validRegisterDto,
        email: 'registration-test-duplicate@test.com',
      })
      .expect(409)
  })

  it('should reject invalid email', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        ...validRegisterDto,
        email: 'wrong-email',
      })
      .expect(400)
  })

  it('should reject weak password', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        ...validRegisterDto,
        email: 'registration-test-weak@test.com',
        password: '123',
        confirmPassword: '123',
      })
      .expect(400)
  })

  it('should reject missing captcha token', async () => {
    const { captchaToken, ...bodyWithoutCaptcha } = validRegisterDto

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        ...bodyWithoutCaptcha,
        email: 'registration-test-no-captcha@test.com',
      })
      .expect(400)
  })

  it('should reject when passwords do not match', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        ...validRegisterDto,
        email: 'registration-test-password-mismatch@test.com',
        confirmPassword: 'DifferentPassword123!',
      })
      .expect(400)
  })
})