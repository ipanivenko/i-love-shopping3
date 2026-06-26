import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from 'prisma/prisma.service';
import { HashingService } from './hashing.service';
import { TokensService } from './tokens.service';
import { CaptchaService } from './captcha.service';
import { EmailService } from 'src/email/email.service';

describe('AuthService', () => {
  let service: AuthService;

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    session: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      updateMany: jest.fn(),
    },
    passwordResetToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    account: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const hashingMock = {
    hash: jest.fn(),
    compare: jest.fn(),
  };

  const tokensMock = {
    signAccessToken: jest.fn(),
    signRefreshToken: jest.fn(),
    verifyRefreshToken: jest.fn(),
    signTemp2faToken: jest.fn(),
  };

  const captchaMock = {
    verify: jest.fn(),
  };

  const emailServiceMock = {
  sendPasswordResetEmail: jest.fn(),
  sendVerificationEmail: jest.fn(),
  sendOrderConfirmationEmail: jest.fn(),
}

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: HashingService, useValue: hashingMock },
        { provide: TokensService, useValue: tokensMock },
        { provide: CaptchaService, useValue: captchaMock },
        { provide: EmailService, useValue: emailServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should register a new user', async () => {
      captchaMock.verify.mockResolvedValue(undefined);
      prismaMock.user.findUnique.mockResolvedValue(null);
      hashingMock.hash.mockResolvedValue('hashed-password');
      prismaMock.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'John',
        createdAt: new Date(),
      });

      const result = await service.register({
        email: 'test@example.com',
        name: 'John',
        password: 'password123',
        confirmPassword: 'password123',
        captchaToken: 'captcha-token',
      });

      expect(captchaMock.verify).toHaveBeenCalledWith('captcha-token');
      expect(hashingMock.hash).toHaveBeenCalledWith('password123');
      expect(prismaMock.user.create).toHaveBeenCalled();
      expect(result.email).toBe('test@example.com');
    });

    it('should throw if passwords do not match', async () => {
      captchaMock.verify.mockResolvedValue(undefined);

      await expect(
        service.register({
          email: 'test@example.com',
          name: 'John',
          password: 'password123',
          confirmPassword: 'different',
          captchaToken: 'captcha-token',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if user already exists', async () => {
      captchaMock.verify.mockResolvedValue(undefined);
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'John',
        passwordHash: 'hash',
        accounts: [],
      });

      await expect(
        service.register({
          email: 'test@example.com',
          name: 'John',
          password: 'password123',
          confirmPassword: 'password123',
          captchaToken: 'captcha-token',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return tokens when credentials are valid and 2FA is disabled', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'John',
        passwordHash: 'hashed-password',
        twoFactorConfirmedAt: null,
        accounts: [],
      });

      hashingMock.compare.mockResolvedValue(true);
      prismaMock.session.create.mockResolvedValue({ id: 'session-1' });
      tokensMock.signAccessToken.mockResolvedValue('access-token');
      tokensMock.signRefreshToken.mockResolvedValue('refresh-token');
      hashingMock.hash.mockResolvedValue('hashed-refresh-token');
      prismaMock.session.update.mockResolvedValue({});

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
        userAgent: 'jest',
        ipAddress: '127.0.0.1',
      });

      expect(result).toEqual({
        requires2fa: false,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('should return temp token when 2FA is enabled', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'John',
        passwordHash: 'hashed-password',
        twoFactorConfirmedAt: new Date(),
        accounts: [],
      });

      hashingMock.compare.mockResolvedValue(true);
      tokensMock.signTemp2faToken.mockResolvedValue('temp-2fa-token');

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
        userAgent: 'jest',
        ipAddress: '127.0.0.1',
      });

      expect(result).toEqual({
        requires2fa: true,
        tempToken: 'temp-2fa-token',
      });
    });

    it('should throw when password is invalid', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'John',
        passwordHash: 'hashed-password',
        twoFactorConfirmedAt: null,
        accounts: [],
      });

      hashingMock.compare.mockResolvedValue(false);

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'wrong-password',
          userAgent: 'jest',
          ipAddress: '127.0.0.1',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});