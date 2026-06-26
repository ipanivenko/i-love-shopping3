import { Module } from '@nestjs/common';
import { SupportAdminService } from './support-admin.service';
import { SupportAdminController } from './support-admin.controller';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  providers: [SupportAdminService, PrismaService],
  controllers: [SupportAdminController]
})
export class SupportAdminModule {}
