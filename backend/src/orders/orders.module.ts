import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaService } from 'prisma/prisma.service';
import { EncryptionService } from 'src/security/encryption.service';
import { RabbitmqModule } from 'src/rabbitmq/rabbitmq.module';
import { OrdersConsumer } from 'src/rabbitmq/order.expired.consumer';

@Module({
  imports: [ RabbitmqModule],
  controllers: [OrdersController],
  providers: [OrdersService, PrismaService, EncryptionService, OrdersConsumer ],
  exports: [OrdersService],
})
export class OrdersModule {}
