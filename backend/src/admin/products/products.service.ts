import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException
} from '@nestjs/common'
import { PrismaService } from '../../../prisma/prisma.service'
import { CreateAdminProductDto } from './dto/create.product'
import { UpdateAdminProductDto } from './dto/update.product'
import { ProductStatus } from '@prisma/client'
import { CloudinaryService } from 'src/cloudinary/cloudinary.service'
import { CreateProductColorDto } from './dto/create.product.color'
import { CreateProductSkuDto } from './dto/create.product.sku'
import { UploadProductColorImageDto } from './dto/upload.product.image.dto'
import { UpdateProductColorDto } from './dto/updateProductColor.dto'
import { UpdateProductColorImageDto } from './dto/updateProductImage.dto'
import { UpdateProductSkuDto } from './dto/updateProductSku.dto'
import { Prisma } from '@prisma/client'
import { BulkUploadProductDto } from './dto/bulk.upload.dto'



@Injectable()
export class AdminProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) { }

  async findAll() {
    return this.prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            colors: true,
            reviews: true,
          },
        },
      },
    })
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        colors: {
          include: {
            images: {
              orderBy: {
                sortOrder: 'asc',
              },
            },
            skus: {
              orderBy: {
                sizeEU: 'asc',
              },
            },
          },
        },
      },
    })

    if (!product) {
      throw new NotFoundException('Product not found')
    }

    return product
  }

  async create(dto: CreateAdminProductDto) {
    const slug = this.generateSlug(dto.name)

    const existingSlug = await this.prisma.product.findUnique({
      where: { slug },
    })

    if (existingSlug) {
      throw new BadRequestException('Product slug already exists')
    }

    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    })

    if (!category) {
      throw new BadRequestException('Category not found')
    }

    const brand = await this.prisma.brand.findUnique({
      where: { id: dto.brandId },
    })

    if (!brand) {
      throw new BadRequestException('Brand not found')
    }

    return this.prisma.product.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        priceCents: dto.priceCents,
        currency: dto.currency ?? 'EUR',
        categoryId: dto.categoryId,
        brandId: dto.brandId,
        status: dto.status ?? ProductStatus.DRAFT,
        gender: dto.gender,
        surface: dto.surface,
        weightGrams: dto.weightGrams,
        weightOunces: dto.weightOunces,
        lengthMm: dto.lengthMm,
        widthMm: dto.widthMm,
        heightMm: dto.heightMm,
        lengthIn: dto.lengthIn,
        widthIn: dto.widthIn,
        heightIn: dto.heightIn,
      },
      include: {
        brand: true,
        category: true,
      },
    })
  }

  async update(id: string, dto: UpdateAdminProductDto) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    })

    if (!product) {
      throw new NotFoundException('Product not found')
    }

    const slug = dto.name ? this.generateSlug(dto.name) : undefined

    if (slug && slug !== product.slug) {
      const existingSlug = await this.prisma.product.findUnique({
        where: { slug },
      })

      if (existingSlug) {
        throw new BadRequestException('Product slug already exists')
      }
    }

    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      })

      if (!category) {
        throw new BadRequestException('Category not found')
      }
    }

    if (dto.brandId) {
      const brand = await this.prisma.brand.findUnique({
        where: { id: dto.brandId },
      })

      if (!brand) {
        throw new BadRequestException('Brand not found')
      }
    }

    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: {
        ...dto,
        slug,
      },
      include: {
        brand: true,
        category: true,
      },
    })


    return updatedProduct
  }

  async remove(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    })

    if (!product) {
      throw new NotFoundException('Product not found')
    }

    return this.prisma.product.delete({
      where: { id },
    })
  }

  //COLORS
  async createColor(productId: string, dto: CreateProductColorDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    })

    if (!product) {
      throw new NotFoundException('Product not found')
    }

    try {
      const createdColor = await this.prisma.productColor.create({
        data: {
          productId,
          colorName: dto.colorName,
          colorHex: dto.colorHex || null,
        },
      })

      return createdColor
    } catch (error) {
      console.error('SERVICE createColor error:', error)
      throw error
    }
  }

  async updateColor(colorId: string, dto: UpdateProductColorDto) {
    return this.prisma.productColor.update({
      where: { id: colorId },
      data: {
        colorName: dto.colorName,
        colorHex: dto.colorHex,
      },
    })
  }

  async deleteColor(colorId: string) {
    const color = await this.prisma.productColor.findUnique({
      where: { id: colorId },
      include: {
        images: {
          select: {
            publicId: true,
          },
        },
      },
    })

    if (!color) {
      throw new NotFoundException('Color not found')
    }
//normally need to delete a pic from cloudinary, BUT many reviwers by testing the app 
//can delete pictures that are needed for seeding db
//so, in production it will be uncommented
   /* for (const image of color.images) {
      if (image.publicId) {
        await this.cloudinary.deleteImage(image.publicId)
      }
    }*/

    return this.prisma.productColor.delete({
      where: { id: colorId },
    })
  }

  async createSku(colorId: string, dto: CreateProductSkuDto) {
    const color = await this.prisma.productColor.findUnique({
      where: { id: colorId },
      select: {
        id: true,
        colorName: true,
        product: {
          select: {
            name: true,
            brand: {
              select: { name: true },
            },
          },
        },
      },
    })

    if (!color) {
      throw new NotFoundException('Product color not found')
    }

    const brandPart = normalizeSkuPart(color.product.brand.name)
    const productPart = normalizeSkuPart(color.product.name)
    const colorPart = normalizeSkuPart(color.colorName)
    const sizePart = normalizeSize(dto.sizeEU)

    const generatedSku = `${brandPart}-${productPart}-${colorPart}-EU${sizePart}`

    try {
      return await this.prisma.productSku.create({
        data: {
          colorId,
          sizeEU: dto.sizeEU,
          sizeUS: dto.sizeUS,
          sizeUK: dto.sizeUK,
          sku: generatedSku,
          barcode: dto.barcode || null,
          stockQty: dto.stockQty,
        },
      })
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('This SKU already exists')
      }

      throw error
    }
  }

  async updateSku(skuId: string, dto: UpdateProductSkuDto) {
    return this.prisma.productSku.update({
      where: { id: skuId },
      data: {
        sizeEU: dto.sizeEU,
        sizeUS: dto.sizeUS,
        sizeUK: dto.sizeUK,
        barcode: dto.barcode,
        stockQty: dto.stockQty,
      },
    })
  }

  async deleteSku(skuId: string) {
    return this.prisma.productSku.delete({
      where: { id: skuId },
    })
  }

  async uploadColorImage(
    colorId: string,
    file: Express.Multer.File,
    dto: UploadProductColorImageDto,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required')
    }

    const color = await this.prisma.productColor.findUnique({
      where: { id: colorId },
      select: { id: true },
    })

    if (!color) {
      throw new NotFoundException('Product color not found')
    }

    const uploaded = await this.cloudinary.uploadProductImage(
      file,
      `products/colors/${colorId}`,
    )

    return this.prisma.productColorImage.create({
      data: {
        colorId,
        url: uploaded.secure_url,
        publicId: uploaded.public_id,
        provider: 'cloudinary',
        alt: dto.alt,
        sortOrder: dto.sortOrder,
      },
    })
  }

  async updateImage(imageId: string, dto: UpdateProductColorImageDto) {
    return this.prisma.productColorImage.update({
      where: { id: imageId },
      data: {
        alt: dto.alt,
        sortOrder: dto.sortOrder,
      },
    })
  }

  async deleteImage(imageId: string) {
    const image = await this.prisma.productColorImage.findUnique({
      where: { id: imageId },
    })

    if (!image) {
      throw new NotFoundException('Image not found')
    }
//normally need to delete a pic from cloudinary, BUT many reviwers by testing the app 
//can delete pictures that is needed for seeding db
//so, in production it will be uncommented
   /* if (image.publicId) {
      await this.cloudinary.deleteImage(image.publicId)
    }*/

    return this.prisma.productColorImage.delete({
      where: { id: imageId },
    })
  }

  async bulkCreateFromJson(
    products: BulkUploadProductDto[],
    imageFiles: Express.Multer.File[],
  ) {

    type BulkUploadResult = {
      name: string
      success: boolean
      productId?: string
      error?: string
    }

    type ImageToCreate = {
      url: string
      publicId: string
      alt?: string
      sortOrder: number
    }

    type ColorToCreate = {
      colorName: string
      colorHex?: string
      images: {
        create: ImageToCreate[]
      }
      skus: {
        create: {
          sku: string
          sizeEU: string
          sizeUS?: string
          sizeUK?: string
          barcode?: string
          stockQty: number
        }[]
      }
    }

    const results: BulkUploadResult[] = []

    const imageMap = new Map<string, Express.Multer.File>()

    for (const file of imageFiles) {
      imageMap.set(file.originalname, file)
    }

    for (const product of products) {
      try {
        const category = await this.prisma.category.findFirst({
          where: {
            name: {
              equals: product.category,
              mode: 'insensitive',
            },
          },
        })

        if (!category) {
          throw new BadRequestException(`Category not found: ${product.category}`)
        }

        const brand = await this.prisma.brand.findFirst({
          where: {
            name: {
              equals: product.brand,
              mode: 'insensitive',
            },
          },
        })

        if (!brand) {
          throw new BadRequestException(`Brand not found: ${product.brand}`)
        }

        const slug = product.slug ?? this.generateSlug(product.name)

        const existingProduct = await this.prisma.product.findUnique({
          where: { slug },
        })

        if (existingProduct) {
          throw new BadRequestException(`Product already exists with slug: ${slug}`)
        }

        const colorsToCreate: ColorToCreate[] = []

        for (const color of product.colors) {
          const imagesToCreate: ImageToCreate[] = []

          for (const image of color.images) {
            const file = imageMap.get(image.filename)

            if (!file) {
              throw new BadRequestException(`Image not found: ${image.filename}`)
            }

            const uploadedImage =
              await this.cloudinary.uploadProductImage(file)

            imagesToCreate.push({
              url: uploadedImage.secure_url,
              publicId: uploadedImage.public_id,
              alt: image.altText,
              sortOrder: image.sortOrder,
            })
          }

          colorsToCreate.push({
            colorName: color.name,
            colorHex: color.hexCode,

            images: {
              create: imagesToCreate,
            },

            skus: {
              create: color.items.map((item) => ({
                sku: [
                  normalizeSkuPart(product.name),
                  normalizeSkuPart(color.name),
                  normalizeSkuPart(item.sizeEU),
                ].join('_'),

                sizeEU: item.sizeEU,
                sizeUS: item.sizeUS,
                sizeUK: item.sizeUK,
                barcode: undefined,
                stockQty: item.stockQty,
              })),
            },
          })
        }

        const createdProduct = await this.prisma.product.create({
          data: {
            name: product.name,
            slug,
            description: product.description ?? '',
            priceCents: product.priceCents,
            currency: product.currency,
            categoryId: category.id,
            brandId: brand.id,
            status: product.status,
            gender: product.gender,
            surface: product.surface,

            weightGrams: product.weightGrams,
            weightOunces: product.weightOunces,
            lengthMm: product.lengthMm,
            widthMm: product.widthMm,
            heightMm: product.heightMm,
            lengthIn: product.lengthIn,
            widthIn: product.widthIn,
            heightIn: product.heightIn,

            colors: {
              create: colorsToCreate,
            },
          },
        })

        results.push({
          name: product.name,
          success: true,
          productId: createdProduct.id,
        })
      } catch (error) {
        results.push({
          name: product.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return {
      total: products.length,
      successful: results.filter((result) => result.success).length,
      failed: results.filter((result) => !result.success).length,
      results,
    }
  }


  convertCsvRowsToBulkProducts(rows: any[]): BulkUploadProductDto[] {
    const productMap = new Map<string, any>()

    for (const row of rows) {
      const productKey = row.name

      if (!productMap.has(productKey)) {
        productMap.set(productKey, {
          name: row.name,
          description: row.description,
          priceCents: Number(row.priceCents),
          currency: row.currency || 'EUR',
          category: row.category,
          brand: row.brand,
          status: row.status || 'ACTIVE',
          gender: row.gender,
          surface: row.surface,

          weightGrams: row.weightGrams ? Number(row.weightGrams) : undefined,
          weightOunces: row.weightOunces ? Number(row.weightOunces) : undefined,
          lengthMm: row.lengthMm ? Number(row.lengthMm) : undefined,
          widthMm: row.widthMm ? Number(row.widthMm) : undefined,
          heightMm: row.heightMm ? Number(row.heightMm) : undefined,
          lengthIn: row.lengthIn ? Number(row.lengthIn) : undefined,
          widthIn: row.widthIn ? Number(row.widthIn) : undefined,
          heightIn: row.heightIn ? Number(row.heightIn) : undefined,

          colors: [],
        })
      }

      const product = productMap.get(productKey)

      let color = product.colors.find(
        (color: any) => color.name === row.colorName,
      )

      if (!color) {
        color = {
          name: row.colorName,
          hexCode: row.hexCode || undefined,
          images: [],
          items: [],
        }

        product.colors.push(color)
      }

      if (
        row.image1Filename &&
        !color.images.some((image: any) => image.filename === row.image1Filename)
      ) {
        color.images.push({
          filename: row.image1Filename,
          altText: row.image1AltText,
          sortOrder: Number(row.image1SortOrder || 1),
        })
      }

      if (
        row.image2Filename &&
        !color.images.some((image: any) => image.filename === row.image2Filename)
      ) {
        color.images.push({
          filename: row.image2Filename,
          altText: row.image2AltText,
          sortOrder: Number(row.image2SortOrder || 2),
        })
      }

      color.items.push({
        sizeEU: String(row.sizeEU),
        sizeUS: row.sizeUS ? String(row.sizeUS) : undefined,
        sizeUK: row.sizeUK ? String(row.sizeUK) : undefined,
        barcode: row.barcode ? String(row.barcode) : undefined,
        stockQty: row.stockQty ? Number(row.stockQty) : 0,
      })
    }

    return Array.from(productMap.values())
  }


  private generateSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }



}

function normalizeSkuPart(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function normalizeSize(value: unknown) {
  return String(value).replace('.', '_')
}


