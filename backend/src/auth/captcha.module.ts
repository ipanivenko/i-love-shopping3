import { Module } from '@nestjs/common';
import { CaptchaService } from './captcha.service';

@Module({
  providers: [CaptchaService], // Register it here
  exports: [CaptchaService],   // Export it so AuthModule can see it
})
export class CaptchaModule {}