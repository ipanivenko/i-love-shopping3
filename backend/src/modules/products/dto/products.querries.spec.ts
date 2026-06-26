import { Gender, ShoeSurface } from '@prisma/client';
import {
  ProductSortBy,
  ProductsQueryDto,
  SortOrder,
} from './products.querries';
import { validateDto } from '../../../../test/utils/validate-dto';

describe('ProductsQueryDto Validation', () => {
  it('should pass with valid query parameters', async () => {
    const { errors } = await validateDto(ProductsQueryDto, {
      page: '2' as any,
      pageSize: '12' as any,
      brand: ['nike', 'adidas'],
      category: ['running'],
      priceMin: '1000' as any,
      priceMax: '5000' as any,
      gender: [Gender.MEN],
      surface: [ShoeSurface.ROAD],
      ratingAvgMin: '4' as any,
      sortBy: ProductSortBy.PRICE,
      sortOrder: SortOrder.ASC,
      query: 'gel kayano',
    });

    expect(errors).toHaveLength(0);
  });

  it('should transform page and pageSize to numbers', async () => {
    const { instance, errors } = await validateDto(ProductsQueryDto, {
      page: '3' as any,
      pageSize: '24' as any,
    });

    expect(errors).toHaveLength(0);
    expect(instance.page).toBe(3);
    expect(instance.pageSize).toBe(24);
  });

  it('should fail when page is less than 1', async () => {
    const { errors } = await validateDto(ProductsQueryDto, {
      page: '0' as any,
    });

    expect(errors.some((e) => e.property === 'page')).toBe(true);
  });

  it('should transform single brand into array', async () => {
    const { instance, errors } = await validateDto(ProductsQueryDto, {
      brand: 'nike' as any,
    });

    expect(errors).toHaveLength(0);
    expect(instance.brand).toEqual(['nike']);
  });

  it('should transform single category into array', async () => {
    const { instance, errors } = await validateDto(ProductsQueryDto, {
      category: 'running' as any,
    });

    expect(errors).toHaveLength(0);
    expect(instance.category).toEqual(['running']);
  });

  it('should add UNISEX when gender is MEN', async () => {
    const { instance, errors } = await validateDto(ProductsQueryDto, {
      gender: Gender.MEN as any,
    });

    expect(errors).toHaveLength(0);
    expect(instance.gender).toContain(Gender.MEN);
    expect(instance.gender).toContain(Gender.UNISEX);
  });

  it('should fail with invalid gender', async () => {
    const { errors } = await validateDto(ProductsQueryDto, {
      gender: ['INVALID'] as any,
    });

    expect(errors.some((e) => e.property === 'gender')).toBe(true);
  });

  it('should fail with invalid surface', async () => {
    const { errors } = await validateDto(ProductsQueryDto, {
      surface: ['INVALID'] as any,
    });

    expect(errors.some((e) => e.property === 'surface')).toBe(true);
  });

  it('should fail with invalid sortBy', async () => {
    const { errors } = await validateDto(ProductsQueryDto, {
      sortBy: 'wrong' as any,
    });

    expect(errors.some((e) => e.property === 'sortBy')).toBe(true);
  });

  it('should fail with invalid sortOrder', async () => {
    const { errors } = await validateDto(ProductsQueryDto, {
      sortOrder: 'wrong' as any,
    });

    expect(errors.some((e) => e.property === 'sortOrder')).toBe(true);
  });
});