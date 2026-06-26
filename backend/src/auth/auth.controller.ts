import {
  Controller, Post, Body, Req, Res, BadRequestException, UseGuards, Get, Patch
}
  from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset.password.dto';
import { ForgotPasswordDto } from './dto/forgot.password.dto';
import { SetRefreshCookie, ClearRefreshCookie } from './cookies.helper';
import { GoogleAuthGuard } from './google-auth.guards';
import { TwoFactorService } from './twofa.service';
import { JwtAuthGuard } from './jwt.auth-guards';
import { Confirm2faDto } from './dto/confirm.2fa.dto';
import { Disable2faDto } from './dto/disable.2fa.dto';
import { Verify2faDto } from './dto/verify.2fa.dto';
import { SetTemp2faCookie } from './cookies.helper';
import { ClearTemp2faCookie } from './cookies.helper';
import { SetupAccountDto } from './dto/setup.account.dto';
import { TokenBucketGuard } from 'src/security/token-bucket';


@Controller('auth')
@UseGuards(TokenBucketGuard)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly twofa: TwoFactorService
  ) { }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto,
    @Req() req: Request,//The Request object represents the incoming message from the user's browser
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login({
      email: dto.email,
      password: dto.password,
      userAgent: req.headers['user-agent'] ?? null,
      ipAddress: req.ip ?? null,
    });

    if (result.requires2fa) {
      SetTemp2faCookie(res, result.tempToken);
      return { requires2fa: true };
    }

    SetRefreshCookie(res, result.refreshToken);
    return { accessToken: result.accessToken };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req: any) {
    const user = req.user;

    return {
      id: user.id,
      email: user.email,
      name: user?.name,
      role: user.role,
      twoFactorEnabled: !!user.twoFactorConfirmedAt,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('setup-account')
  async setupAccount(
    @Req() req: any,
    @Body() dto: SetupAccountDto,
  ) {
    return this.authService.setupAccount(req.user.id, dto);
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      throw new BadRequestException('Missing refresh_token cookie');
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.refresh(refreshToken);

    SetRefreshCookie(res, newRefreshToken);
    return { accessToken };
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto,
    @Req() req: Request) {
    await this.authService.forgotPassword(dto.email, {
      ip: req.ip,
      ua: req.headers['user-agent'] ?? '',
    });

    // Always same response (prevents email enumeration)
    return { ok: true };
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    const { rid, token, newPassword } = dto;
    await this.authService.resetPassword(rid, token, newPassword);
    return { ok: true };
  }


  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refresh_token;

    await this.authService.logout(refreshToken);
    ClearRefreshCookie(res);
    return { ok: true };
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleLogin() {
    //The guard:
    //Intercepts the request
    //Calls the Google strategy
    //Redirects the browser to Google's login page
    //So the function body is never reached.
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    // req.user comes from validate() above
    const user = req.user as any;

    const result = await this.authService.oauthLogin(user);
    const frontUrl = process.env.FRONTEND_URL
    if (result.requires2fa) {
      SetTemp2faCookie(res, result.tempToken);
      return res.redirect(`${frontUrl}/two-factor`);
    }

    SetRefreshCookie(res, result.refreshToken);
    return res.redirect(`${frontUrl}/oauth-success`)
  }

  @Post('2fa/setup')
  @UseGuards(JwtAuthGuard)
  async twoFactorSetup(@Req() req: any) {
    const userId = req.user.id
    const result = await this.twofa.setup(userId);

    return {
      qrDataUrl: result.qrDataUrl,
      manualSecret: result.manualSecret,
      issuer: result.issuer,
      label: result.label,
    };
  }

  @Post('2fa/confirm')
  @UseGuards(JwtAuthGuard)
  async confirm(@Req() req: any, @Body() dto: Confirm2faDto) {
    // req.user.uid comes from JwtStrategy validate()
    return this.twofa.confirm(req.user.id, dto.code);
  }

  @Post('2fa/verify')
  async verify(
    @Body() dto: Verify2faDto,

    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {

    const tempToken = req.cookies?.temp_2fa_token;
    if (!tempToken) {
      throw new BadRequestException('Missing temporary 2FA token');
    }

    const { accessToken, refreshToken } =
      await this.twofa.verify2fa(tempToken, dto.code);

    ClearTemp2faCookie(res);
    // Set refresh cookie only after successful 2FA
    SetRefreshCookie(res, refreshToken);

    return { accessToken };
  }

  @Post('2fa/disable')
  @UseGuards(JwtAuthGuard)
  async disable(@Req() req: any, @Body() dto: Disable2faDto) {
    return this.twofa.disable(req.user.id, dto.password, dto.code);
  }
}
