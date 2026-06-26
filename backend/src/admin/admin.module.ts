import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { ProductsModule } from './products/products.module';
import { AdminBrandsController } from './products/brand.controller';
import { AdminCategoriesController } from './products/category.controller';
import { AdminBrandsService } from './products/brand.service';
import { AdminCategoriesService } from './products/category.service';
import { ShippingMethodService } from './shipping-method/shipping-method.service';
import { ShippingMethodController } from './shipping-method/shipping-method.controller';
import { AdminOrdersService } from './orders/orders.service';
import { AdminOrdersController } from './orders/orders.controller';
import { RabbitmqModule } from 'src/rabbitmq/rabbitmq.module';
import { EncryptionService } from 'src/security/encryption.service';
import { AdminUsersService } from './users/users.service';
import { AdminUsersController } from './users/users.controller';
import { AdminReviewsService } from './admin-reviews/admin-reviews.service';
import { AdminReviewsController } from './admin-reviews/admin-reviews.controller';

@Module({
  controllers: [
    AdminController,
    AdminBrandsController,
    AdminCategoriesController,
    ShippingMethodController,
    AdminOrdersController,
    AdminUsersController,
    AdminReviewsController,
  ],
  providers: [
    AdminService,
    AdminBrandsService,
    AdminCategoriesService,
    ShippingMethodService,
    AdminOrdersService,
    EncryptionService,
    AdminUsersService,
    AdminReviewsService,
  ],
  imports: [ProductsModule, RabbitmqModule],
})
export class AdminModule {}
