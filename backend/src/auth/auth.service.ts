import {
    Injectable, ConflictException, UnauthorizedException, BadRequestException, NotFoundException
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { HashingService } from './hashing.service';
import { TokensService } from './tokens.service';
import { CaptchaService } from './captcha.service';
import { SetupAccountDto } from './dto/setup.account.dto';
import { EmailService } from 'src/email/email.service';

type GoogleOAuthUser = {
    provider: 'google';
    providerAccountId: string;
    email: string | null;
    name?: string | null;
    picture?: string | null;
};

type LoginResult =
    | { requires2fa: true; tempToken: string }
    | { requires2fa: false; accessToken: string; refreshToken: string };

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private hashing: HashingService,
        private tokens: TokensService,
        private captchaService: CaptchaService,
        private readonly emailService: EmailService,
    ) { }

    async register(dto: RegisterDto) {

        await this.captchaService.verify(dto.captchaToken);

        if (dto.password !== dto.confirmPassword) {
            throw new BadRequestException('Passwords do not match');
        }
        //check if the user exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
            select: {
                id: true,
                email: true,
                name: true,
                passwordHash: true,
                accounts: {
                    select: {
                        provider: true,
                    },
                },
            },
        });


        if (existingUser) {
            const hasGoogleAccount = existingUser.accounts.some(
                (account) => account.provider === 'google'
            );

            if (!existingUser.passwordHash && hasGoogleAccount) {
                throw new ConflictException(
                    'This account was created with Google sign-in. Please sign in with Google. '
                    + 'After signing in, you can add a password in your account settings. Or you can click "Forgot password"'
                );
            }

            throw new ConflictException('User already exists');
        }

        //hashing
        const hash = await this.hashing.hash(dto.password);

        //create the user in db
        return this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash: hash,
                name: dto.name,
            },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
            },
        });
    }

    async login(input: {
        email: string; password: string; userAgent: string | null;
        ipAddress: string | null
    }): Promise<LoginResult> {
        const user = await this.prisma.user.findUnique({
            where: { email: input.email },
            select: {
                id: true,
                email: true,
                name: true,
                passwordHash: true,
                twoFactorConfirmedAt: true,
                role: true,
                accounts: {
                    select: {
                        provider: true,
                    },
                },
            },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const hasGoogleAccount = user.accounts.some(
            (account) => account.provider === 'google'
        );

        if (!user.passwordHash) {
            if (hasGoogleAccount) {
                throw new UnauthorizedException(
                    'This account was created with Google sign-in. Please sign in with Google. '
                    + 'After signing in, you can add a password in your account settings. Or you can click "Forgot password"'
                );
            }

            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await this.hashing.compare(input.password, user.passwordHash);
        if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

        const twoFaEnabled = user.twoFactorConfirmedAt != null;

        if (twoFaEnabled) {
            const tempToken = await this.tokens.signTemp2faToken({ uid: user.id });
            return { requires2fa: true, tempToken };
        }

        //  create session row (device session)
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        const session = await this.prisma.session.create({
            data: {
                userId: user.id,
                refreshTokenHash: 'TEMP', // will update after we create token
                expiresAt,
                userAgent: input.userAgent,
                ipAddress: input.ipAddress,
            },
            select: { id: true },
        });

        const accessToken = await this.tokens.signAccessToken({ uid: user.id, role: user.role });
        const refreshToken = await this.tokens.signRefreshToken({ uid: user.id, sid: session.id });

        const refreshTokenHash = await this.hashing.hash(refreshToken);

        await this.prisma.session.update({
            where: { id: session.id },
            data: { refreshTokenHash }
        })

        return { requires2fa: false, accessToken, refreshToken };
    }

    async refresh(refreshToken: string) {

        let payload: { uid: string; sid: string };

        try {
            payload = await this.tokens.verifyRefreshToken(refreshToken);
        } catch {
            throw new UnauthorizedException('Invalid refresh token');
        }

        const session = await this.prisma.session.findUnique({
            where: { id: payload.sid }
        });

        if (!session || session.revokedAt || session.expiresAt < new Date()) {
            throw new UnauthorizedException('Invalid session user');
        }

        // Bind session to the user in the token (extra safety)
        if (session.userId !== payload.uid) {
            throw new UnauthorizedException('Refresh token reuse detected');
        }

        const valid = await this.hashing.compare(refreshToken, session.refreshTokenHash);

        if (!valid) {
            // Reuse detected: old/stolen refresh token presented
            await this.prisma.session.updateMany({
                where: { userId: payload.uid, revokedAt: null },
                data: { revokedAt: new Date() },
            });
            throw new UnauthorizedException();
        }

        const user = await this.prisma.user.findUnique({
            where: { id: payload.uid },
            select: {
                id: true,
                role: true,
            },
        })

        if (!user) {
            throw new UnauthorizedException('User not found')
        }

        const accessToken = await this.tokens.signAccessToken({
            uid: user.id,
            role: user.role,
        })


        const newRefreshToken = await this.tokens.signRefreshToken({
            uid: payload.uid,
            sid: session.id
        });

        const newRefreshTokenHash = await this.hashing.hash(newRefreshToken);

        await this.prisma.session.update({
            where: { id: session.id },
            data: {
                refreshTokenHash: newRefreshTokenHash,
            },
        });

        return { accessToken, refreshToken: newRefreshToken };
    }

    async logout(refreshToken?: string) {
        if (!refreshToken) {
            return
        }

        let payload: { uid: string; sid: string }

        try {
            payload = await this.tokens.verifyRefreshToken(refreshToken)
        } catch {
            return
        }

        await this.prisma.session.updateMany({
            where: {
                id: payload.sid,
                revokedAt: null,
            },
            data: {
                revokedAt: new Date(),
            },
        });

    }

    async forgotPassword(email: string, meta: { ip?: string; ua?: string }) {
        const user = await this.prisma.user.findUnique({ where: { email } });

        // Always return OK, even if user doesn't exist
        if (!user) return;

        const token = await this.tokens.signAccessToken({
            uid: user.id,
            role: user.role,
        })
        const tokenHash = await this.hashing.hash(token);

        const reset = await this.prisma.passwordResetToken.create({
            data: {
                userId: user.id,
                tokenHash,
                expiresAt: new Date(Date.now() + 15 * 60 * 1000),
                requestedIp: meta.ip,
                userAgent: meta.ua,
            },
        });

        const base = process.env.FRONTEND_URL ?? "http://127.0.0.1:5173";
        const link =
            `${base}/reset-password` +
            `?rid=${encodeURIComponent(reset.id)}` +
            `&token=${encodeURIComponent(token)}`;
        await this.emailService.sendPasswordResetEmail(email, link)

    }

    async resetPassword(rid: string, token: string, newPassword: string) {
        const prt = await this.prisma.passwordResetToken.findUnique({ where: { id: rid } });
        if (!prt || prt.usedAt || prt.expiresAt < new Date()) {
            throw new BadRequestException('Invalid or expired reset token');
        }

        const ok = await this.hashing.compare(token, prt.tokenHash);
        if (!ok) {
            throw new BadRequestException('Invalid or expired reset token');
        }

        const passwordHash = await this.hashing.hash(newPassword);

        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: prt.userId },
                data: { passwordHash },
            }),
            this.prisma.passwordResetToken.update({
                where: { id: prt.id },
                data: { usedAt: new Date() },
            }),
            // revoke all sessions after password reset
            this.prisma.session.updateMany({
                where: { userId: prt.userId, revokedAt: null },
                data: { revokedAt: new Date() },
            }),
        ]);
    }

    async oauthLogin(oauthUser: GoogleOAuthUser): Promise<LoginResult> {

        if (!oauthUser.email) {
            throw new BadRequestException('Google did not provide email.');
        }

        const account = await this.prisma.account.findUnique({
            where: {
                //the combination of 'google' + 'that specific ID' must be unique
                provider_providerAccountId: {
                    provider: 'google',
                    providerAccountId: oauthUser.providerAccountId,
                },
            },
            //Prisma will perform a join (or a second query) 
            // to grab the User associated with that account and nest it inside the result
            include: { user: true },
        });

        let user = account?.user ?? null;

        if (!user) {
            user = await this.prisma.user.findUnique({
                where: { email: oauthUser.email }
            });

            if (!user) {
                user = await this.prisma.user.create({
                    data: {
                        email: oauthUser.email,
                        isVerified: true,
                        name: oauthUser.name,
                        image: oauthUser.picture,
                        // passwordHash stays null for OAuth-only accounts
                    },
                });
            } else {
                // User exists → update only missing fields
                const updateData: any = {};

                if (!user.name && oauthUser.name) {
                    updateData.name = oauthUser.name;
                }

                if (!user.image && oauthUser.picture) {
                    updateData.image = oauthUser.picture;
                }

                if (!user.isVerified) {
                    updateData.isVerified = true;
                }

                if (Object.keys(updateData).length > 0) {
                    user = await this.prisma.user.update({
                        where: { id: user.id },
                        data: updateData,
                    });
                }
            }


            await this.prisma.account.create({
                data: {
                    user: { connect: { id: user.id } },
                    type: 'oauth',
                    provider: 'google',
                    providerAccountId: oauthUser.providerAccountId,
                },
            });
        }

        const twoFaEnabled = user.twoFactorConfirmedAt != null;

        if (twoFaEnabled) {
            const tempToken = await this.tokens.signTemp2faToken({ uid: user.id });
            return { requires2fa: true, tempToken };
        }

        const session = await this.prisma.session.create({
            data: {
                user: { connect: { id: user.id } },
                refreshTokenHash: 'TEMP',//will update soon
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            },
        });


        const accessToken = await this.tokens.signAccessToken({
            uid: user.id,
            role: user.role,
        })

        const refreshToken = await this.tokens.signRefreshToken({
            uid: user.id,
            sid: session.id,
        });


        const refreshTokenHash = await this.hashing.hash(refreshToken);

        await this.prisma.session.update({
            where: { id: session.id },
            data: { refreshTokenHash },
        });

        return { requires2fa: false, accessToken, refreshToken }
    }

    async setupAccount(userId: string, dto: SetupAccountDto) {
        const trimmedName = dto.name?.trim();
        const wantsPasswordChange = !!dto.password || !!dto.confirmPassword;

        if (!trimmedName && !wantsPasswordChange) {
            throw new BadRequestException('No changes provided');
        }

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                passwordHash: true,
                accounts: {
                    select: {
                        provider: true,
                    },
                },
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const updateData: {
            name?: string;
            passwordHash?: string;
        } = {};

        if (trimmedName && trimmedName !== user.name) {
            updateData.name = trimmedName;
        }

        if (wantsPasswordChange) {
            if (!dto.password || !dto.confirmPassword) {
                throw new BadRequestException('Both password fields are required');
            }

            if (dto.password !== dto.confirmPassword) {
                throw new BadRequestException('Passwords do not match');
            }

            updateData.passwordHash = await this.hashing.hash(dto.password);
        }

        if (Object.keys(updateData).length === 0) {
            throw new BadRequestException('No changes detected');
        }

        await this.prisma.user.update({
            where: { id: user.id },
            data: updateData,
        });

        return {
            message: 'Account updated successfully',
        };
    }

}
