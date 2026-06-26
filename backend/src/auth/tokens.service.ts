import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Role } from '@prisma/client';

@Injectable()
export class TokensService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) { }

  signAccessToken(payload: { uid: string, role: Role }) {
    const accessTtl = Number(this.config.get('JWT_ACCESS_TTL') ?? 900);

    return this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
      expiresIn: Number.isFinite(accessTtl) ? accessTtl : 900,
    });
  }

  signRefreshToken(payload: { uid: string; sid: string }) {
    const refreshTtl = Number(this.config.get('JWT_REFRESH_TTL') ?? 604800);

    return this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: Number.isFinite(refreshTtl) ? refreshTtl : 604800,
    });
  }

  verifyRefreshToken(token: string) {
    return this.jwt.verifyAsync<{ uid: string; sid: string }>(token, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
    });
  }

  signTemp2faToken(payload: { uid: string }) {
    return this.jwt.signAsync(
      { ...payload, purpose: "2fa" },
      { secret: this.config.getOrThrow<string>('JWT_2FA_TEMP_SECRET'), 
        expiresIn: 300, }
    );
  }

  verifyTemp2faToken(token: string) {
    return this.jwt.verifyAsync<{ uid: string; purpose: string }>(
      token,
      { secret: this.config.getOrThrow<string>('JWT_2FA_TEMP_SECRET')}
    );
  }

}
