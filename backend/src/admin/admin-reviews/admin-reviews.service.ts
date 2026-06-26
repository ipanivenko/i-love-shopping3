import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'prisma/prisma.service'
import { UpdateAdminReviewDto } from './dto/update.review.dto'

@Injectable()
export class AdminReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        helpfulVotes: {
          select: {
            id: true,
          },
        },
      },
    })
  }

  async updateReview(reviewId: string, dto: UpdateAdminReviewDto) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    })

    if (!review) {
      throw new NotFoundException('Review not found')
    }

    const updatedReview = await this.prisma.review.update({
      where: { id: reviewId },
      data: {
        rating: dto.rating,
        comment: dto.comment,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    })

    await this.recalculateProductReviewStats(review.productId)

    return updatedReview
  }

  async deleteReview(reviewId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    })

    if (!review) {
      throw new NotFoundException('Review not found')
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.reviewHelpfulVote.deleteMany({
        where: { reviewId },
      })

      await tx.review.delete({
        where: { id: reviewId },
      })
    })

    await this.recalculateProductReviewStats(review.productId)

    return {
      message: 'Review deleted successfully',
    }
  }

  private async recalculateProductReviewStats(productId: string) {
    const stats = await this.prisma.review.aggregate({
      where: { productId },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    })

    await this.prisma.product.update({
      where: { id: productId },
      data: {
        customerRatingAvg: stats._avg.rating ?? 0,
        customerReviewCount: stats._count.rating,
      },
    })
  }
}