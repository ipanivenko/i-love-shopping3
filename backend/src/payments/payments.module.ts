import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PrismaService } from 'prisma/prisma.service';
import { OrdersModule } from 'src/orders/orders.module';
import { EncryptionService } from 'src/security/encryption.service';
import { EmailModule } from 'src/email/email.module';
import { RabbitmqModule } from 'src/rabbitmq/rabbitmq.module';
import { PaymentSucceededConsumer } from 'src/rabbitmq/paimentSuccessConsumer';
import { PaymentFailedConsumer } from 'src/rabbitmq/paimentFailedConsumer';
import { OrderRefundRequestedConsumer } from 'src/rabbitmq/order.refund.consumer';
import { OrderCancellationRequestedConsumer } from 'src/rabbitmq/order.cancel.consumer'
import { OrderCancellationAdminApprovalConsumer } from 'src/rabbitmq/order.cancel.admin.appr';

@Module({
  imports: [EmailModule, RabbitmqModule, OrdersModule],
  providers: [PaymentsService, PrismaService,
    EncryptionService, PaymentSucceededConsumer,
    PaymentFailedConsumer, OrderRefundRequestedConsumer, OrderCancellationRequestedConsumer,
    OrderCancellationAdminApprovalConsumer],
  controllers: [PaymentsController]
})
export class PaymentsModule { }
