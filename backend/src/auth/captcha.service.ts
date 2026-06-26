import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class CaptchaService {
  async verify(captchaToken: string): Promise<void> {
    const secret = process.env.RECAPTCHA_SECRET_KEY;

    if (!secret) {
      throw new Error('Missing RECAPTCHA_SECRET_KEY');
    }

    const params = new URLSearchParams();
    params.append('secret', secret);
    params.append('response', captchaToken);

    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await response.json();

    if (!data.success) {
      throw new BadRequestException('CAPTCHA verification failed');
    }
  }
}