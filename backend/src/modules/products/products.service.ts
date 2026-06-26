import { Injectable, NotFoundException } from '@nestjs/common'
import { ProductStatus, BrandStatus, CategoryStatus, Prisma, Gender, ShoeSurface } from '@prisma/client'
import { ProductsQueryDto } from './dto/products.querries'
import { PrismaService } from 'prisma/prisma.service'
import type {
  ProductListItemDTO,
  PaginatedResponseDTO,
  ProductsFiltersDTO,
} from '@app/shared/index'
import type { ProductDetails } from '@app/shared/product'
import { CloudinaryService } from 'src/cloudinary/cloudinary.service'

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) { }

  async list(
    dto: ProductsQueryDto,
  ): Promise<PaginatedResponseDTO<ProductListItemDTO>> {
    const page = dto.page ?? 1
    const pageSize = dto.pageSize ?? 12
    const skip = (page - 1) * pageSize

    const where: Prisma.ProductWhereInput = {
      status: ProductStatus.ACTIVE,

      brand: {
        status: BrandStatus.ACTIVE,
        ...(dto.brand?.length ? { slug: { in: dto.brand } } : {}),
      },

      category: {
        status: CategoryStatus.ACTIVE,
        ...(dto.category?.length ? { slug: { in: dto.category } } : {}),
      },

      ...(dto.gender?.length
        ? { gender: { in: dto.gender as Gender[] } }
        : {}),

      ...(dto.surface?.length
        ? { surface: { in: dto.surface as ShoeSurface[] } }
        : {}),

      ...(dto.priceMin !== undefined || dto.priceMax !== undefined
        ? {
          priceCents: {
            ...(dto.priceMin !== undefined
              ? { gte: dto.priceMin * 100 }
              : {}),
            ...(dto.priceMax !== undefined
              ? { lte: dto.priceMax * 100 }
              : {}),
          },
        }
        : {}),

      ...(dto.ratingAvgMin !== undefined
        ? { ratingAvg: { gte: dto.ratingAvgMin } }
        : {}),

      ...(dto.query
        ? {
          OR: dto.query
            .trim()
            .split(/\s+/)
            .map((word) => ({
              OR: [
                {
                  name: {
                    contains: word,
                    mode: 'insensitive',
                  },
                },
                {
                  category: {
                    name: {
                      contains: word,
                      mode: 'insensitive',
                    },
                  },
                },
              ],
            })),
        }
        : {}),
    }

    const useRelevance = dto.sortBy === 'relevance' && !!dto.query?.trim()

    const orderBy = useRelevance
      ? [{ createdAt: 'desc' as const }]
      : this.buildOrder(dto)

    const [rawItems, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy,
        skip: useRelevance ? 0 : skip,
        take: useRelevance ? 300 : pageSize,
        select: {
          id: true,
          slug: true,
          name: true,
          gender: true,
          currency: true,
          priceCents: true,
          surface: true,
          ratingAvg: true,

          customerRatingAvg: true,

          brand: {
            select: {
              name: true,
              slug: true,
            },
          },

          category: {
            select: {
              name: true,
              slug: true,
            },
          },

          colors: {
            orderBy: {
              colorName: 'asc',
            },
            select: {
              colorName: true,
              colorHex: true,
              images: {
                orderBy: {
                  sortOrder: 'asc',
                },
                take: 2,
                select: {
                  publicId: true,
                  alt: true,
                  sortOrder: true,
                },
              },
            },
          },
        },
      }),

      this.prisma.product.count({ where }),
    ])

    let finalItems = rawItems

    if (useRelevance) {
      finalItems = rawItems
        .map((p) => ({
          p,
          s: this.relevanceScore(p, dto.query!),
        }))
        .sort((a, b) => b.s - a.s)
        .map((x) => x.p)
        .slice(skip, skip + pageSize)
    }

    const mappedItems: ProductListItemDTO[] = finalItems.map((p) => {
      const defaultColor = p.colors[0]
      const defaultImages = defaultColor?.images ?? []

      const imageUrl = (publicId?: string | null) =>
        publicId
          ? this.cloudinary.getMediumUrl(publicId)
          : null

      const ratingAvg =
        p.customerRatingAvg !== null && Number(p.customerRatingAvg) > 0
          ? Number(p.customerRatingAvg)
          : p.ratingAvg !== null
            ? Number(p.ratingAvg)
            : null

      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        gender: p.gender ?? null,
        currency: p.currency,
        priceCents: p.priceCents,
        surface: p.surface ?? null,
        ratingAvg,
        brand: p.brand.name,
        category: p.category.name,
        image: imageUrl(defaultImages[0]?.publicId),
        hoverImage: imageUrl(defaultImages[1]?.publicId),
        colors: p.colors.map((color) => ({
          colorName: color.colorName,
          colorHex: color.colorHex ?? null,
          image: imageUrl(color.images[0]?.publicId),
          hoverImage: imageUrl(color.images[1]?.publicId),
        })),
      }
    })

    return {
      items: mappedItems,
      page,
      pageSize,
      total,
    }
  }

  async findOneBySlug(slug: string): Promise<ProductDetails> {
    const product = await this.prisma.product.findFirst({
      where: {
        slug,
        status: ProductStatus.ACTIVE,
        brand: {
          status: BrandStatus.ACTIVE,
        },
        category: {
          status: CategoryStatus.ACTIVE,
        },
      },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        currency: true,
        priceCents: true,
        gender: true,
        surface: true,
        ratingAvg: true,
        ratingCount: true,

        customerRatingAvg: true,
        customerReviewCount: true,

        weightGrams: true,
        weightOunces: true,

        lengthMm: true,
        widthMm: true,
        heightMm: true,

        lengthIn: true,
        widthIn: true,
        heightIn: true,

        brand: {
          select: {
            name: true,
            slug: true,
          },
        },

        category: {
          select: {
            name: true,
            slug: true,
          },
        },

        colors: {
          select: {
            id: true,
            colorName: true,
            colorHex: true,
            images: {
              orderBy: { sortOrder: 'asc' },
              select: {
                id: true,
                url: true,
                alt: true,
                sortOrder: true,
              },
            },
            skus: {
              orderBy: { sizeEU: 'asc' },
              select: {
                id: true,
                sizeEU: true,
                sizeUS: true,
                sizeUK: true,
                sku: true,
                barcode: true,
                stockQty: true,
              },
            },
          },
        },
      },
    })

    if (!product) {
      throw new NotFoundException('Product not found')
    }

    const customerReviewCount = product.customerReviewCount

    const ratingAvg = Number(
      customerReviewCount > 0
        ? product.customerRatingAvg ?? 0
        : product.ratingAvg ?? 0,
    )

    const ratingCount =
      customerReviewCount > 0
        ? customerReviewCount
        : product.ratingCount

    return {
      ...product,
      ratingAvg,
      ratingCount,
      lengthIn: this.toNumber(product.lengthIn),
      widthIn: this.toNumber(product.widthIn),
      heightIn: this.toNumber(product.heightIn),
      colors: product.colors.map((color) => ({
        ...color,
        skus: color.skus.map((sku) => ({
          ...sku,
          sizeEU: Number(sku.sizeEU),
          sizeUS: sku.sizeUS ? Number(sku.sizeUS) : null,
          sizeUK: sku.sizeUK ? Number(sku.sizeUK) : null,
        })),
      })),
    }
  }

  async getFilters(): Promise<ProductsFiltersDTO> {
    const [brands, surfaces] = await Promise.all([
      this.prisma.brand.findMany({
        where: {
          status: BrandStatus.ACTIVE,
          products: {
            some: {
              status: ProductStatus.ACTIVE,
              category: {
                status: CategoryStatus.ACTIVE,
              },
            },
          },
        },
        select: {
          name: true,
          slug: true,
        },
        orderBy: {
          name: 'asc',
        },
      }),

      this.prisma.product.findMany({
        where: {
          status: ProductStatus.ACTIVE,
          surface: { not: null },
          brand: {
            status: BrandStatus.ACTIVE,
          },
          category: {
            status: CategoryStatus.ACTIVE,
          },
        },
        select: {
          surface: true,
        },
        distinct: ['surface'],
      }),
    ])

    return {
      brands: brands.map((brand) => ({
        label: brand.name,
        value: brand.slug,
      })),

      surfaces: surfaces.map((item) => ({
        label: this.formatSurfaceLabel(item.surface!),
        value: item.surface!,
      })),
    }
  }

  private buildOrder(
    dto: ProductsQueryDto,
  ): Prisma.ProductOrderByWithRelationInput[] {
    const dir: Prisma.SortOrder =
      dto.sortOrder === 'asc' ? 'asc' : 'desc'

    if (!dto.sortBy) {
      return [{ createdAt: 'desc' }]
    }

    switch (dto.sortBy) {
      case 'price':
        return [
          { priceCents: dir },
          { createdAt: 'desc' },
        ]

      case 'rating':
        return [
          { customerRatingAvg: dir },
          { ratingAvg: dir },
          { customerReviewCount: 'desc' },
          { createdAt: 'desc' },
        ]

      case 'createdAt':
        return [{ createdAt: dir }]

      default:
        return [{ createdAt: 'desc' }]
    }
  }

  private relevanceScore(
    product: { name: string; category?: { name: string } },
    query: string,
  ) {
    const q = query.trim().toLowerCase()
    const words = query.split(/\s+/).filter(Boolean)

    const name = product.name.toLowerCase()
    const category = (product.category?.name ?? '').toLowerCase()

    let score = 0
    let matchedWords = 0

    if (name === q) score += 1000

    for (const w of words) {
      let matched = false

      if (name.startsWith(w)) {
        score += 500
        matched = true
      } else if (name.includes(w)) {
        score += 300
        matched = true
      }

      if (category.includes(w)) {
        score += 120
        matched = true
      }

      if (matched) matchedWords++
    }

    if (words.length > 0) {
      if (matchedWords === words.length) score += 400
      else score -= (words.length - matchedWords) * 200
    }

    return score
  }

  async getRecommendations(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      select: {
        id: true,
        categoryId: true,
        brandId: true,
        gender: true,
        surface: true,
      },
    })

    if (!product) {
      return []
    }

    const genderFilter: Gender[] | undefined =
      product.gender === Gender.KIDS
        ? [Gender.KIDS]
        : product.gender === Gender.MEN
          ? [Gender.MEN, Gender.UNISEX]
          : product.gender === Gender.WOMEN
            ? [Gender.WOMEN, Gender.UNISEX]
            : undefined

    const products = await this.prisma.product.findMany({
      where: {
        id: { not: product.id },
        status: 'ACTIVE',
        ...(genderFilter && {
          gender: {
            in: genderFilter,
          },
        }),

        OR: [
          { categoryId: product.categoryId },
          { brandId: product.brandId },
          { surface: product.surface },
        ],
      },
      take: 4,
      orderBy: [
        { customerRatingAvg: 'desc' },
        { ratingAvg: 'desc' },
        { createdAt: 'desc' },
      ],
      select: {
        id: true,
        slug: true,
        name: true,
        priceCents: true,
        currency: true,
        ratingAvg: true,
        customerRatingAvg: true,
        gender: true,
        surface: true,
        brand: {
          select: {
            name: true,
            slug: true,
          },
        },
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
        colors: {
          orderBy: {
            colorName: 'asc',
          },
          select: {
            colorName: true,
            colorHex: true,
            images: {
              orderBy: {
                sortOrder: 'asc',
              },
              take: 2,
              select: {
                publicId: true,
                alt: true,
                sortOrder: true,
              },
            },
          },
        },
      },
    })

    return products.map((p) => {
      const defaultImages = p.colors[0]?.images ?? []

      const imageUrl = (publicId?: string | null) =>
        publicId
          ? this.cloudinary.getMediumUrl(publicId)
          : null

      const ratingAvg =
        p.customerRatingAvg != null
          ? Number(p.customerRatingAvg)
          : p.ratingAvg != null
            ? Number(p.ratingAvg)
            : null

      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        gender: p.gender ?? null,
        currency: p.currency,
        priceCents: p.priceCents,
        surface: p.surface ?? null,
        ratingAvg,
        brand: p.brand.name,
        category: p.category.name,
        image: imageUrl(defaultImages[0]?.publicId),
        hoverImage: imageUrl(defaultImages[1]?.publicId),
        colors: p.colors.map((color) => ({
          colorName: color.colorName,
          colorHex: color.colorHex ?? null,
          image: imageUrl(color.images[0]?.publicId),
          hoverImage: imageUrl(color.images[1]?.publicId),
        })),
      }
    })
  }

  private toNumber(value: unknown): number | null {
    return value ? Number(value) : null
  }

  private formatSurfaceLabel(surface: string): string {
    surface = surface.replace('_', ' ')
    return surface.charAt(0) + surface.slice(1).toLowerCase()
  }
}