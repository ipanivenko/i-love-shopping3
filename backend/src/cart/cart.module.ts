import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { PrismaService } from 'prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  controllers: [CartController],
  providers: [CartService, PrismaService],
  imports: [CloudinaryModule]
})
export class CartModule {}
