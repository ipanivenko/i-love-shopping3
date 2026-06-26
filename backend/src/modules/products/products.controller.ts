import { Controller, Get, Query, Param } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsQueryDto } from './dto/products.querries';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Get()
  list(@Query() query: ProductsQueryDto) {
    return this.productsService.list(query);
  }

  @Get('filters')
  getFilters() {
    return this.productsService.getFilters()
  }

  @Get(':slug/recommendations')
  getRecommendations(@Param('slug') slug: string) {
    return this.productsService.getRecommendations(slug)
  }

  @Get(':slug')
findOne(@Param('slug') slug: string) {
  return this.productsService.findOneBySlug(slug)
}
}
