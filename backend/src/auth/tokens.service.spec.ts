import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokensService } from './tokens.service';

describe('TokensService', () => {
  let service: TokensService;

  beforeEach(() => {
    const jwt = new JwtService();

    const config = {
      get: jest.fn((key: string) => {
        switch (key) {
          case 'JWT_ACCESS_TTL':
            return 900;
          case 'JWT_REFRESH_TTL':
            return 604800;
          case 'JWT_REFRESH_SECRET':
            return 'test-refresh-secret';
          default:
            return undefined;
        }
      }),
      getOrThrow: jest.fn((key: string) => {
        switch (key) {
          case 'JWT_ACCESS_SECRET':
            return 'test-access-secret';
          case 'JWT_REFRESH_SECRET':
            return 'test-refresh-secret';
          case 'JWT_2FA_TEMP_SECRET':
            return 'test-2fa-secret';
          default:
            throw new Error(`Missing config for key: ${key}`);
        }
      }),
    } as unknown as ConfigService;

    service = new TokensService(jwt, config);
  });

  it('should sign a valid access token', async () => {
    const token = await service.signAccessToken({ uid: 'user-123', role: 'USER' });

    const payload = await new JwtService().verifyAsync(token, {
      secret: 'test-access-secret',
    });

    expect(payload.uid).toBe('user-123');
  });

  it('should sign a valid refresh token', async () => {
    const token = await service.signRefreshToken({
      uid: 'user-123',
      sid: 'session-123',
    });

    const payload = await service.verifyRefreshToken(token);

    expect(payload.uid).toBe('user-123');
    expect(payload.sid).toBe('session-123');
  });

  it('should reject refresh token with wrong secret', async () => {
    const token = await service.signRefreshToken({
      uid: 'user-123',
      sid: 'session-123',
    });

    await expect(
      new JwtService().verifyAsync(token, {
        secret: 'wrong-secret',
      }),
    ).rejects.toThrow();
  });

  it('should sign a valid temporary 2FA token', async () => {
    const token = await service.signTemp2faToken({ uid: 'user-123' });

    const payload = await service.verifyTemp2faToken(token);

    expect(payload.uid).toBe('user-123');
    expect(payload.purpose).toBe('2fa');
  });

  it('should reject temp 2FA token with wrong secret', async () => {
    const token = await service.signTemp2faToken({ uid: 'user-123' });

    await expect(
      new JwtService().verifyAsync(token, {
        secret: 'wrong-secret',
      }),
    ).rejects.toThrow();
  });

  it('should reject an expired token', async () => {
    const jwt = new JwtService();

    const token = await jwt.signAsync(
      { uid: 'user-123' },
      {
        secret: 'exp-test-secret',
        expiresIn: 1,
      },
    );

    await new Promise((resolve) => setTimeout(resolve, 1200));

    await expect(
      jwt.verifyAsync(token, { secret: 'exp-test-secret' }),
    ).rejects.toThrow();
  });
});