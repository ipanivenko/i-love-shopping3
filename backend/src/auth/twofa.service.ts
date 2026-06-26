import { Injectable } from "@nestjs/common";
import * as speakeasy from "speakeasy";
import * as QRCode from "qrcode";
import { PrismaService } from "prisma/prisma.service";
import { encryptString, decryptString } from "./crypto.util";
import { BadRequestException, UnauthorizedException, ForbiddenException } from "@nestjs/common";
import { TokensService } from './tokens.service';
import { HashingService } from "./hashing.service";
import { GenerateRecoveryCodes } from "./crypto.util";

@Injectable()
export class TwoFactorService {
  constructor(
    private prisma: PrismaService,
    private hashing: HashingService,
    private tokens: TokensService
  ) { }

  async setup(userId: string) {
    // Fetch user (email is used for nicer label in authenticator)
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, twoFactorConfirmedAt: true },
    });

    if (!user) throw new Error("User not found");

    // Generate secret + otpauth URL
    const issuer = process.env.TOTP_ISSUER ?? "YourApp";
    const label = `${issuer}:${user.email}`;

    const secret = speakeasy.generateSecret({
      length: 20,
      name: label,     // appears in authenticator
      issuer,          // appears as issuer
    });

    if (!secret.base32 || !secret.otpauth_url) {
      throw new Error("Failed to generate TOTP secret");
    }

    // Encrypt and store secret
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecretEncrypted: encryptString(secret.base32),
        twoFactorConfirmedAt: null, // still not enabled until /confirm
      },
    });

    // Convert otpauth URL to QR image data URL (frontend can do <img src="...">)
    const qrDataUrl = await QRCode.toDataURL(secret.otpauth_url);

    return {
      qrDataUrl,
      manualSecret: secret.base32,
      issuer,
      label,
    };
  }

  async confirm(userId: string, code: string) {


    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        twoFactorSecretEncrypted: true,
        twoFactorConfirmedAt: true,
      },
    });

    console.log('confirm: user loaded', {
      hasUser: !!user,
      hasSecret: !!user?.twoFactorSecretEncrypted,
      confirmedAt: user?.twoFactorConfirmedAt,
    });

    if (!user) throw new BadRequestException('User not found');

    if (!user.twoFactorSecretEncrypted) {
      throw new BadRequestException('2FA setup not started');
    }

    if (user.twoFactorConfirmedAt) {
      return { enabled: true };
    }


    const secretBase32 = decryptString(user.twoFactorSecretEncrypted);

    const ok = speakeasy.totp.verify({
      secret: secretBase32,
      encoding: 'base32',
      token: code,
      window: 1,
    });

    if (!ok) {
      throw new BadRequestException('Invalid 2FA code');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorConfirmedAt: new Date(),
      },
    });

    const recoveryCodes = await this.createRecoveryCodes(userId);

    return {
      enabled: true,
      recoveryCodes,
    };
  }

  async verify2fa(tempToken: string, code: string) {
    const payload = await this.tokens.verifyTemp2faToken(tempToken);
    if (payload.purpose !== "2fa") throw new UnauthorizedException();

    const user = await this.prisma.user.findUnique({
      where: { id: payload.uid },
      select: { id: true, role: true, twoFactorSecretEncrypted: true, twoFactorConfirmedAt: true },
    });

    if (!user || !user.twoFactorConfirmedAt || !user.twoFactorSecretEncrypted) {
      throw new UnauthorizedException();
    }

    const secretBase32 = decryptString(user.twoFactorSecretEncrypted);

    const totpOk = speakeasy.totp.verify({
      secret: secretBase32,
      encoding: "base32",
      token: code,
      window: 1,
    });

    let recoveryUsed = false;

    if (!totpOk) {
      // Try recovery codes (only unused ones)
      const candidates = await this.prisma.recoveryCode.findMany({
        where: { userId: user.id, usedAt: null },
        select: { id: true, codeHash: true },
      });

      for (const rc of candidates) {
        const match = await this.hashing.compare(code, rc.codeHash);
        if (match) {
          // Mark as used (single-use!)
          await this.prisma.recoveryCode.update({
            where: { id: rc.id },
            data: { usedAt: new Date() },
          });
          recoveryUsed = true;
          break;
        }
      }

      if (!recoveryUsed) {
        throw new UnauthorizedException("Invalid 2FA code");
      }
    }

    const session = await this.prisma.session.create({
      data: {
        user: { connect: { id: user.id } },
        refreshTokenHash: "TEMP",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const accessToken = await this.tokens.signAccessToken({ uid: user.id, role: user.role });
    const refreshToken = await this.tokens.signRefreshToken({ uid: user.id, sid: session.id });

    const refreshTokenHash = await this.hashing.hash(refreshToken);

    await this.prisma.session.update({
      where: { id: session.id },
      data: { refreshTokenHash },
    });

    return { accessToken, refreshToken };
  }

  async disable(userId: string, password: string, code: string) {
    if (!userId) {
      throw new BadRequestException('Missing authenticated user id')
    }
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        passwordHash: true,
        twoFactorSecretEncrypted: true,
        twoFactorConfirmedAt: true,
      },
    });

    if (!user) throw new BadRequestException('User not found');

    // Must be enabled
    if (!user.twoFactorConfirmedAt || !user.twoFactorSecretEncrypted) {
      throw new BadRequestException('2FA is not enabled');
    }

    //  Password check (requires password user)
    if (!user.passwordHash) {
      //Strict: block disable unless they first set a password
      throw new ForbiddenException('Password is not set for this account, need to set the password first');
    } else {
      const okPass = await this.hashing.compare(password, user.passwordHash);
      if (!okPass) throw new ForbiddenException('Invalid password');
    }

    //  TOTP check
    const secret = decryptString(user.twoFactorSecretEncrypted);
    const okTotp = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code,
    });

    if (!okTotp) throw new ForbiddenException('Invalid 2FA code');

    //  Disable
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorSecretEncrypted: null,
        twoFactorConfirmedAt: null,
      },
    });

    await this.prisma.recoveryCode.deleteMany({ where: { userId: user.id } });

    return { disabled: true };
  }

  async createRecoveryCodes(userId: string) {
    const codes = GenerateRecoveryCodes(5);

    const hashedCodes = await Promise.all(
      codes.map(code => this.hashing.hash(code))
    );

    await this.prisma.recoveryCode.createMany({
      data: hashedCodes.map(hash => ({
        userId,
        codeHash: hash,
      })),
    });

    return codes;
  }

}
