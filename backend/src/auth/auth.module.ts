import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { HashingService } from './hashing.service';
import { TokensService } from './tokens.service';
import { ThrottlerModule } from '@nestjs/throttler';
import { GoogleStrategy } from './google.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.startegy';
import { TwoFactorService } from './twofa.service';
import { CaptchaModule } from './captcha.module';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [PrismaModule, JwtModule.register({}), ThrottlerModule.forRoot([
      { ttl: 60_000, limit: 20 },
    ]), PassportModule, CaptchaModule, EmailModule],
  controllers: [AuthController],
  providers: [AuthService, HashingService, TokensService, TwoFactorService, GoogleStrategy, JwtStrategy ],
})
export class AuthModule {}