import { Module } from '@nestjs/common';
import { SupportController } from './support.controller';
import { PrismaModule } from 'prisma/prisma.module';
import { SupportService } from './support.service';

@Module({
  imports: [PrismaModule],
  controllers: [SupportController],
  providers: [SupportService],
})
export class SupportModule {}
