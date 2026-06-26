import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('/search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('suggestions')
  suggestions(@Query('query') q: string) {
    return this.searchService.suggestions(q);
  }
}