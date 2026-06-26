import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common'
import { AdminReviewsService } from './admin-reviews.service'
import { UpdateAdminReviewDto } from './dto/update.review.dto'
import { JwtAuthGuard } from 'src/auth/jwt.auth-guards'
import { RolesGuard } from 'src/auth/roles.guard'
import { Roles } from 'src/decorators/role'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/reviews')
export class AdminReviewsController {
  constructor(private readonly adminReviewsService: AdminReviewsService) {}

  @Get()
  findAll() {
    return this.adminReviewsService.findAll()
  }

  @Patch(':id')
  updateReview(
    @Param('id') reviewId: string,
    @Body() dto: UpdateAdminReviewDto,
  ) {
    return this.adminReviewsService.updateReview(reviewId, dto)
  }

  @Delete(':id')
  deleteReview(@Param('id') reviewId: string) {
    return this.adminReviewsService.deleteReview(reviewId)
  }
}