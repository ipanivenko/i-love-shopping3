import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    UseGuards
} from '@nestjs/common'
import { AdminOrdersService } from './orders.service'
import { JwtAuthGuard } from 'src/auth/jwt.auth-guards'
import { RolesGuard } from 'src/auth/roles.guard'
import { Roles } from 'src/decorators/role'
import { Role } from '@prisma/client'
import { UpdateOrderStatusDto } from './dto/update.status.dto'
import { ApproveCancellationDto } from './dto/approve.cancel.dto'
import { RejectCancellationDto } from './dto/reject.cancel.dto'


@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin/orders')
export class AdminOrdersController {
    constructor(
        private readonly adminOrdersService: AdminOrdersService,
    ) { }

    @Get()
    findAll() {
        return this.adminOrdersService.findAll()
    }

    @Get(':orderId')
    findOne(@Param('orderId') orderId: string) {
        return this.adminOrdersService.findOne(orderId)
    }

    @Patch(':orderId/status')
    updateStatus(
        @Param('orderId') orderId: string,
        @Body() dto: UpdateOrderStatusDto,
    ) {
        return this.adminOrdersService.updateStatus(
            orderId,
            dto.status,
            dto.note,
        )
    }

    @Patch(':orderId/cancellation/approve')
    approveCancellation(
        @Param('orderId') orderId: string,
        @Body() dto: ApproveCancellationDto,
    ) {
        return this.adminOrdersService.approveCancellation(
            orderId,
            dto.note,
        )
    }

    @Patch(':orderId/cancellation/reject')
    rejectCancellation(
        @Param('orderId') orderId: string,
        @Body() dto: RejectCancellationDto,
    ) {
        return this.adminOrdersService.rejectCancellation(
            orderId,
            dto.note,
        )
    }
}