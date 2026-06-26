import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../src/app.module'
import { PrismaService } from '../prisma/prisma.service'
import { CaptchaService } from '../src/auth/captcha.service'
import { Gender, ProductStatus } from '@prisma/client'

describe('Checkout Flow (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService

  let skuId: string
  let shippingMethodId: string

  const registerDto = {
    email: 'checkout-user@test.com',
    password: 'StrongPassword123!',
    confirmPassword: 'StrongPassword123!',
    name: 'Checkout User',
    captchaToken: 'test-captcha-token',
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule =
      await Test.createTestingModule({
        imports: [AppModule],
      })
        .overrideProvider(CaptchaService)
        .useValue({
          verify: jest.fn().mockResolvedValue(true),
        })
        .compile()

    app = moduleFixture.createNestApplication()

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    )

    await app.init()

    prisma = app.get(PrismaService)
  })

  beforeEach(async () => {
    await cleanupTestData()

    const brand = await prisma.brand.create({
      data: {
        name: 'Checkout Brand',
        slug: 'checkout-brand',
      },
    })

    const category = await prisma.category.create({
      data: {
        name: 'Checkout Shoes',
        slug: 'checkout-shoes',
      },
    })

    const product = await prisma.product.create({
      data: {
        name: 'Checkout Test Shoe',
        slug: 'checkout-test-shoe',
        description: 'Test checkout product',
        priceCents: 10000,
        currency: 'EUR',
        status: ProductStatus.ACTIVE,
        gender: Gender.MEN,
        brandId: brand.id,
        categoryId: category.id,
      },
    })

    const color = await prisma.productColor.create({
      data: {
        productId: product.id,
        colorName: 'Black',
        colorHex: '#000000',
      },
    })

   const sku = await prisma.productSku.create({
  data: {
    colorId: color.id,
    sku: 'CHECKOUT-SKU-42',
    sizeEU: '42',
    stockQty: 10,
  },
})

    skuId = sku.id

    const shippingMethod = await prisma.shippingMethod.create({
      data: {
        name: 'Standard Delivery',
        code: 'STANDARD_TEST',
        priceCents: 500,
        isActive: true,
      },
    })

    shippingMethodId = shippingMethod.id
  })

  afterAll(async () => {
    await cleanupTestData()
    await app.close()
  })

  async function cleanupTestData() {
    await prisma.orderStatusHistory.deleteMany({
      where: {
        order: {
          customerInfo: {
            email: {
              contains: 'checkout',
            },
          },
        },
      },
    })

    await prisma.orderItem.deleteMany({
      where: {
        productName: {
          contains: 'Checkout',
        },
      },
    })

    await prisma.orderShippingMethod.deleteMany({
      where: {
        code: {
          contains: 'STANDARD_TEST',
        },
      },
    })

    await prisma.orderShippingAddress.deleteMany({
      where: {
        postcode: '76000',
      },
    })

    await prisma.orderCustomerInfo.deleteMany({
      where: {
        email: {
          contains: 'checkout',
        },
      },
    })

    await prisma.order.deleteMany({
      where: {
        items: {
          some: {
            productName: {
              contains: 'Checkout',
            },
          },
        },
      },
    })

    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'checkout-user',
        },
      },
    })

    await prisma.productSku.deleteMany({
      where: {
        sku: {
          contains: 'CHECKOUT-SKU',
        },
      },
    })

    await prisma.productColor.deleteMany({
      where: {
        colorName: 'Black',
        product: {
          slug: 'checkout-test-shoe',
        },
      },
    })

    await prisma.product.deleteMany({
      where: {
        slug: 'checkout-test-shoe',
      },
    })

    await prisma.shippingMethod.deleteMany({
      where: {
        code: 'STANDARD_TEST',
      },
    })

    await prisma.category.deleteMany({
      where: {
        slug: 'checkout-shoes',
      },
    })

    await prisma.brand.deleteMany({
      where: {
        slug: 'checkout-brand',
      },
    })
  }

  function createCheckoutDto() {
    return {
      customerInfo: {
        email: 'checkout-guest@test.com',
        name: 'Checkout Guest',
      },
      shippingAddress: {
        fullName: 'Checkout Guest',
        phone: '+33123456789',
        address: '10 Test Street',
        city: 'Rouen',
        postcode: '76000',
        country: 'France',
      },
      shippingMethodId,
      items: [
        {
          skuId,
          quantity: 2,
        },
      ],
    }
  }

  it('should create an order as guest user', async () => {
    const response = await request(app.getHttpServer())
      .post('/orders')
      .send(createCheckoutDto())
      .expect(201)

    expect(response.body.order).toBeDefined()
    expect(response.body.guestToken).toBeDefined()

    expect(response.body.order.subtotalCents).toBe(20000)
    expect(response.body.order.shippingCents).toBe(500)
    expect(response.body.order.totalCents).toBe(20500)
    expect(response.body.order.status).toBe('PENDING_PAYMENT')
  })

  it('should reserve stock after guest checkout', async () => {
    await request(app.getHttpServer())
      .post('/orders')
      .send(createCheckoutDto())
      .expect(201)

    const sku = await prisma.productSku.findUnique({
      where: {
        id: skuId,
      },
    })

    expect(sku?.stockQty).toBe(8)
  })

  it('should create an order as logged-in user', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(registerDto)
      .expect(201)

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: registerDto.email,
        password: registerDto.password,
      })
      .expect(201)

    const accessToken = loginResponse.body.accessToken

    const response = await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        ...createCheckoutDto(),
        customerInfo: {
          email: registerDto.email,
          name: registerDto.name,
        },
      })
      .expect(201)

    expect(response.body.order).toBeDefined()
    expect(response.body.guestToken).toBeNull()

    expect(response.body.order.subtotalCents).toBe(20000)
    expect(response.body.order.shippingCents).toBe(500)
    expect(response.body.order.totalCents).toBe(20500)
    expect(response.body.order.status).toBe('PENDING_PAYMENT')
  })

  it('should reject checkout with empty items', async () => {
    await request(app.getHttpServer())
      .post('/orders')
      .send({
        ...createCheckoutDto(),
        items: [],
      })
      .expect(400)
  })

  it('should reject checkout with invalid shipping method', async () => {
    await request(app.getHttpServer())
      .post('/orders')
      .send({
        ...createCheckoutDto(),
        shippingMethodId: 'invalid-shipping-id',
      })
      .expect(404)
  })

  it('should reject checkout when stock is insufficient', async () => {
    await request(app.getHttpServer())
      .post('/orders')
      .send({
        ...createCheckoutDto(),
        items: [
          {
            skuId,
            quantity: 99,
          },
        ],
      })
      .expect(400)
  })
})