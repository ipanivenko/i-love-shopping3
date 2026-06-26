import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateReviewDto } from './dto/create-review.dto'
import { OrderStatus } from '@prisma/client'

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) { }

  async createReview(productId: string, userId: string, dto: CreateReviewDto) {
  const product = await this.prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  })

  if (!product) {
    throw new NotFoundException('Product not found')
  }

  const alreadyReviewed = await this.prisma.review.findUnique({
    where: {
      productId_userId: {
        productId,
        userId,
      },
    },
    select: { id: true },
  })

  if (alreadyReviewed) {
    throw new BadRequestException('You already reviewed this product')
  }

  const hasBoughtProduct = await this.prisma.order.findFirst({
    where: {
      userId,
      status: OrderStatus.PAYMENT_SUCCESSFUL,
      items: {
        some: {
          sku: {
            color: {
              productId,
            },
          },
        },
      },
    },
    select: { id: true },
  })

  if (!hasBoughtProduct) {
    throw new ForbiddenException(
      'Only registered users who bought this product can review it',
    )
  }

  return this.prisma.$transaction(async (tx) => {
    const review = await tx.review.create({
      data: {
        productId,
        userId,
        rating: dto.rating,
        comment: dto.comment?.trim() || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            helpfulVotes: true,
          },
        },
      },
    })

    const ratingStats = await tx.review.aggregate({
      where: { productId },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    })

    await tx.product.update({
      where: { id: productId },
      data: {
        customerRatingAvg: ratingStats._avg.rating ?? 0,
        customerReviewCount: ratingStats._count.rating,
      },
    })

    return {
      ...review,
      hasMarkedHelpful: false,
    }
  })
}

  async getProductReviews(productId: string, userId?: string) {
    const reviews = await this.prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            helpfulVotes: true,
          },
        },
        helpfulVotes: userId
          ? {
            where: { userId },
            select: { id: true },
          }
          : false,
      },
      orderBy: [
        {
          helpfulVotes: {
            _count: 'desc',
          },
        },
        {
          createdAt: 'desc',
        },
      ],
    })


    const formattedReviews = reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      user: review.user,
      _count: review._count,
      hasMarkedHelpful:
        'helpfulVotes' in review &&
        Array.isArray(review.helpfulVotes) &&
        review.helpfulVotes.length > 0,
    }))

    const ratingStats = await this.prisma.review.aggregate({
      where: { productId },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    })

    let canReview = false
    let hasReviewed = false

    if (userId) {
      const alreadyReviewed = await this.prisma.review.findUnique({
        where: {
          productId_userId: {
            productId,
            userId,
          },
        },
        select: { id: true },
      })

      hasReviewed = !!alreadyReviewed

      const boughtOrderItem = await this.prisma.orderItem.findFirst({
        where: {
          order: {
            userId,
            status: {
              in: [OrderStatus.PAYMENT_SUCCESSFUL],
            },
          },
          sku: {
            color: {
              productId,
            },
          },
        },
        select: { id: true },
      })

      canReview = !!boughtOrderItem && !hasReviewed
    }

    return {
      averageRating: ratingStats._avg.rating ?? 0,
      reviewCount: ratingStats._count.rating,
      canReview,
      hasReviewed,
      reviews: formattedReviews,
    }
  }

  async markHelpful(reviewId: string, userId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    })

    if (!review) {
      throw new NotFoundException('Review not found')
    }

    return this.prisma.reviewHelpfulVote.create({
      data: {
        reviewId,
        userId,
      },
    })
  }

  async removeHelpful(reviewId: string, userId: string) {
    return this.prisma.reviewHelpfulVote.delete({
      where: {
        reviewId_userId: {
          reviewId,
          userId,
        },
      },
    })
  }
}