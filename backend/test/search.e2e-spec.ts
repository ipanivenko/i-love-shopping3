import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from 'prisma/prisma.service';

jest.setTimeout(30000);

describe('Search Suggestions API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    if (app) await app.close();
    if (prisma) await prisma.$disconnect();
  });

  it('should return empty suggestions when query is missing', async () => {
    const response = await request(app.getHttpServer())
      .get('/search/suggestions')
      .expect(200);

    expect(response.body).toEqual({
      suggestions: [],
    });
  });

  it('should return empty suggestions when query has less than 2 characters', async () => {
    const response = await request(app.getHttpServer())
      .get('/search/suggestions?query=a')
      .expect(200);

    expect(response.body).toEqual({
      suggestions: [],
    });
  });

  it('should return suggestions array for valid query', async () => {
    const response = await request(app.getHttpServer())
      .get('/search/suggestions?query=sh')
      .expect(200);

    expect(response.body).toHaveProperty('suggestions');
    expect(Array.isArray(response.body.suggestions)).toBe(true);
  });

  it('should return suggestions with valid structure', async () => {
    const response = await request(app.getHttpServer())
      .get('/search/suggestions?query=sh')
      .expect(200);

    for (const suggestion of response.body.suggestions) {
      expect(suggestion).toHaveProperty('type');
      expect(suggestion).toHaveProperty('label');
      expect(suggestion).toHaveProperty('value');

      expect(['brand', 'category', 'product']).toContain(suggestion.type);
      expect(typeof suggestion.label).toBe('string');
      expect(typeof suggestion.value).toBe('string');

      if (suggestion.slug !== undefined) {
        expect(typeof suggestion.slug).toBe('string');
      }
    }
  });

  it('should not return duplicate suggestions with same type and label', async () => {
    const response = await request(app.getHttpServer())
      .get('/search/suggestions?query=sh')
      .expect(200);

    const keys = response.body.suggestions.map(
      (s: { type: string; label: string }) =>
        `${s.type}:${s.label.toLowerCase()}`,
    );

    const uniqueKeys = new Set(keys);

    expect(uniqueKeys.size).toBe(keys.length);
  });
});