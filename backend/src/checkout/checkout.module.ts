import { Module } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';
import { PrismaService } from 'prisma/prisma.service';
import { EncryptionService } from 'src/security/encryption.service';

@Module({
  controllers: [CheckoutController],
  providers: [CheckoutService, PrismaService, EncryptionService],
})
export class CheckoutModule {}
