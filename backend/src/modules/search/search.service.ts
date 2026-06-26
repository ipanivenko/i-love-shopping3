import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { ProductStatus } from '@prisma/client';

type SuggestionType = 'brand' | 'category' | 'product';
type Suggestion = {
  type: SuggestionType;
  label: string;     
  value: string;     
  slug?: string;    
};

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async suggestions(qRaw: string) {
    const q = (qRaw ?? '').trim();
    if (q.length < 2) return { suggestions: [] as Suggestion[] };

    const [brands, categories, products] = await Promise.all([
      this.prisma.brand.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: { name: true, slug: true },
        take: 5,
        orderBy: { name: 'asc' },
      }),

      this.prisma.category.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: { name: true, slug: true },
        take: 5,
        orderBy: { name: 'asc' },
      }),

      this.prisma.product.findMany({
        where: {
          status: ProductStatus.ACTIVE,
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: { name: true, slug: true },
        take: 8,
        orderBy: { name: 'asc' },
      }),
    ]);

    const merged: Suggestion[] = [
      ...brands.map(b => ({
        type: 'brand' as const,
        label: b.name,
        value: b.name,
        slug: b.slug,
      })),
      ...categories.map(c => ({
        type: 'category' as const,
        label: c.name,
        value: c.name,
        slug: c.slug,
      })),
      ...products.map(p => ({
        type: 'product' as const,
        label: p.name,
        value: p.name,
        slug: p.slug,
      })),
    ];

    // de-dup by (type + label)
    const seen = new Set<string>();
    const suggestions = merged.filter(s => {
      const key = `${s.type}:${s.label.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return { suggestions };
  }
}