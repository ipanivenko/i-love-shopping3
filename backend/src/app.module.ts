import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from 'prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from './modules/products/products.module';
import { SearchModule } from './modules/search/search.module';
import { CaptchaModule } from './auth/captcha.module';
import { CartModule } from './cart/cart.module';
import { ShippingMethodsModule } from './shipping-methods/shipping-methods.module';
import { CheckoutModule } from './checkout/checkout.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { ScheduleModule } from '@nestjs/schedule';
import { EmailModule } from './email/email.module';
import { RabbitmqService } from './rabbitmq/rabbitmq.service';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AdminModule } from './admin/admin.module';
import { FaqModule } from './faq/faq.module';
import { SupportService } from './support/support.service';
import { SupportModule } from './support/support.module';
import { SupportAdminModule } from './support-admin/support-admin.module';

@Module({
  imports: [AuthModule, CaptchaModule, PrismaModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    ProductsModule, SearchModule, CartModule, ShippingMethodsModule, CheckoutModule, 
    OrdersModule, PaymentsModule, EmailModule, RabbitmqModule, ReviewsModule, AdminModule, FaqModule, SupportModule, SupportAdminModule],
  controllers: [AppController],
  providers: [AppService, RabbitmqService, SupportService],
})
export class AppModule { }
