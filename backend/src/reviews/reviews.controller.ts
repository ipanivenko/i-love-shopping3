import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common'
import { ReviewsService } from './reviews.service'
import { CreateReviewDto } from './dto/create-review.dto'
import { JwtAuthGuard } from 'src/auth/jwt.auth-guards'
import { CurrentUser } from 'src/decorators/current.user'
import { OptionalJwtAuthGuard } from 'src/auth/jwt.auth-guards.optional'

@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) { }

  @Post('products/:productId/reviews')
  @UseGuards(JwtAuthGuard)
  createReview(
    @Param('productId') productId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.createReview(productId, userId, dto)
  }

  @Get('products/:productId/reviews')
  @UseGuards(OptionalJwtAuthGuard)
  getProductReviews(
    @Param('productId') productId: string,
    @CurrentUser('id') userId: string,) {
      console.log("userId: ", userId)
    return this.reviewsService.getProductReviews(productId, userId)
  }

  @Post('reviews/:reviewId/helpful')
  @UseGuards(JwtAuthGuard)
  markHelpful(
    @Param('reviewId') reviewId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.reviewsService.markHelpful(reviewId, userId)
  }

  @Delete('reviews/:reviewId/helpful')
  @UseGuards(JwtAuthGuard)
  removeHelpful(
    @Param('reviewId') reviewId: string,
    @CurrentUser('id') userId: string
  ) {
    return this.reviewsService.removeHelpful(reviewId, userId)
  }
}