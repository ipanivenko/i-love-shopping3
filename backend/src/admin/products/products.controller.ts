import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import { AdminProductsService } from './products.service'
import { CreateAdminProductDto } from './dto/create.product'
import { UpdateAdminProductDto } from './dto/update.product'
import { JwtAuthGuard } from 'src/auth/jwt.auth-guards'
import { RolesGuard } from 'src/auth/roles.guard'
import { Roles } from 'src/decorators/role'
import { Role } from '@prisma/client'
import { CreateProductColorDto } from './dto/create.product.color'
import { CreateProductSkuDto } from './dto/create.product.sku'
import { UploadProductColorImageDto } from './dto/upload.product.image.dto'
import { FileInterceptor } from '@nestjs/platform-express'
import { UseInterceptors } from '@nestjs/common'
import { UploadedFile } from '@nestjs/common'
import { UpdateProductColorDto } from './dto/updateProductColor.dto'
import { UpdateProductColorImageDto } from './dto/updateProductImage.dto'
import { UpdateProductSkuDto } from './dto/updateProductSku.dto'
import { BadRequestException } from '@nestjs/common'
import { BulkUploadProductDto } from './dto/bulk.upload.dto'
import { ValidationError, validate } from 'class-validator'
import { plainToInstance } from 'class-transformer'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import { UploadedFiles } from '@nestjs/common'
import { parse } from 'csv-parse/sync'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin/products')
export class AdminProductsController {
  constructor(private readonly productsService: AdminProductsService) { }

  @Get()
  findAll() {
    return this.productsService.findAll()
  }

  @Post()
  create(@Body() dto: CreateAdminProductDto) {
    return this.productsService.create(dto)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAdminProductDto,
  ) {
    console.log('BACKEND DTO:', dto)
    return this.productsService.update(id, dto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id)
  }

  //find product
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id)
  }

  // PRODUCT COLORS
  @Post(':productId/colors')
  createColor(
    @Param('productId') productId: string,
    @Body() dto: CreateProductColorDto,
  ) {
    return this.productsService.createColor(productId, dto)
  }

  @Patch('colors/:colorId')
  updateColor(
    @Param('colorId') colorId: string,
    @Body() dto: UpdateProductColorDto,
  ) {
    return this.productsService.updateColor(colorId, dto)
  }

  @Delete('colors/:colorId')
  deleteColor(@Param('colorId') colorId: string) {
    return this.productsService.deleteColor(colorId)
  }

  // COLOR IMAGES
  @Post('colors/:colorId/images')
  @UseInterceptors(FileInterceptor('image'))
  uploadColorImage(
    @Param('colorId') colorId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadProductColorImageDto,
  ) {
    return this.productsService.uploadColorImage(colorId, file, dto)
  }

  // COLOR SKUS / SIZES / STOCK
  @Post('colors/:colorId/skus')
  createSku(
    @Param('colorId') colorId: string,
    @Body() dto: CreateProductSkuDto,
  ) {
    return this.productsService.createSku(colorId, dto)
  }

  @Patch('images/:imageId')
  updateImage(
    @Param('imageId') imageId: string,
    @Body() dto: UpdateProductColorImageDto,
  ) {
    return this.productsService.updateImage(imageId, dto)
  }

  @Delete('images/:imageId')
  deleteImage(@Param('imageId') imageId: string) {
    return this.productsService.deleteImage(imageId)
  }

  @Patch('skus/:skuId')
  updateSku(
    @Param('skuId') skuId: string,
    @Body() dto: UpdateProductSkuDto,
  ) {
    return this.productsService.updateSku(skuId, dto)
  }

  @Delete('skus/:skuId')
  deleteSku(@Param('skuId') skuId: string) {
    return this.productsService.deleteSku(skuId)
  }


  @Post('bulk-json')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'json', maxCount: 1 },
      { name: 'images', maxCount: 200 },
    ]),
  )
  async bulkUploadJson(
    @UploadedFiles()
    files: {
      json?: Express.Multer.File[]
      images?: Express.Multer.File[]
    },
  ) {
    const jsonFile = files.json?.[0]
    const imageFiles = files.images ?? []

    if (!jsonFile) {
      throw new BadRequestException('JSON file is required')
    }

    if (!jsonFile.originalname.endsWith('.json')) {
      throw new BadRequestException('Only JSON files are allowed')
    }

    let rawProducts: unknown

    try {
      rawProducts = JSON.parse(jsonFile.buffer.toString('utf-8'))
    } catch {
      throw new BadRequestException('Invalid JSON file')
    }

    if (!Array.isArray(rawProducts)) {
      throw new BadRequestException('JSON must contain an array of products')
    }

    const products = plainToInstance(BulkUploadProductDto, rawProducts)

    const validationErrors: ValidationError[] = []

    for (const product of products) {
      const errors = await validate(product)

      if (errors.length > 0) {
        validationErrors.push(...errors)
      }
    }

    if (validationErrors.length > 0) {
      throw new BadRequestException(validationErrors)
    }

    return this.productsService.bulkCreateFromJson(products, imageFiles)
  }


  @Post('bulk-csv')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'csv', maxCount: 1 },
      { name: 'images', maxCount: 200 },
    ]),
  )
  async bulkUploadCsv(
    @UploadedFiles()
    files: {
      csv?: Express.Multer.File[]
      images?: Express.Multer.File[]
    },
  ) {
    const csvFile = files.csv?.[0]
    const imageFiles = files.images ?? []

    if (!csvFile) {
      throw new BadRequestException('CSV file is required')
    }

    if (!csvFile.originalname.endsWith('.csv')) {
      throw new BadRequestException('Only CSV files are allowed')
    }

    let rows: any[]

    try {
      rows = parse(csvFile.buffer.toString('utf-8'), {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      })
    } catch {
      throw new BadRequestException('Invalid CSV file')
    }

    const rawProducts = this.productsService.convertCsvRowsToBulkProducts(rows)

    const products = plainToInstance(
      BulkUploadProductDto,
      rawProducts,
    ) as BulkUploadProductDto[]

    const validationErrors: ValidationError[] = []

    for (const product of products) {
      const errors = await validate(product)

      if (errors.length > 0) {
        validationErrors.push(...errors)
      }
    }

    if (validationErrors.length > 0) {
      throw new BadRequestException(validationErrors)
    }

    return this.productsService.bulkCreateFromJson(products, imageFiles)
  }

}