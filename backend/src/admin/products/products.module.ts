import { Module } from '@nestjs/common';
import { AdminProductsController } from './products.controller';
import { AdminProductsService } from './products.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({

  imports: [CloudinaryModule],
  controllers: [AdminProductsController],
  providers: [AdminProductsService],
  exports: [AdminProductsService],
})
export class ProductsModule { }
