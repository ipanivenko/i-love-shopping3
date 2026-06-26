import {
    BadRequestException,
    NotFoundException,
} from '@nestjs/common'
import { OrdersService } from './orders.service'
import { OrderStatus } from '@prisma/client'

describe('Order Summary Calculations', () => {
    let service: OrdersService

    const prisma = {
        shippingMethod: {
            findFirst: jest.fn(),
        },
        productSku: {
            findMany: jest.fn(),
        },
        $transaction: jest.fn(),
    }

    const encryptionService = {
        encrypt: jest.fn((value) => `encrypted:${value}`),
        encryptRequired: jest.fn((value) => `encrypted:${value}`),

        decrypt: jest.fn((value) =>
            typeof value === 'string'
                ? value.replace('encrypted:', '')
                : value,
        ),

        decryptRequired: jest.fn((value) =>
            typeof value === 'string'
                ? value.replace('encrypted:', '')
                : value,
        ),

        safeDecrypt: jest.fn((value) =>
            typeof value === 'string'
                ? value.replace('encrypted:', '')
                : value,
        ),
    }

    const rabbitmqService = {
        publish: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()

        service = new OrdersService(
            prisma as any,
            encryptionService as any,
            rabbitmqService as any,
        )
    })

    const dto = {
        shippingMethodId: 'shipping-1',
        customerInfo: {
            email: 'customer@test.com',
            name: 'John Doe',
        },
        shippingAddress: {
            fullName: 'John Doe',
            phone: '+33123456789',
            address: '10 Test Street',
            city: 'Rouen',
            postcode: '76000',
            country: 'France',
        },
        items: [
            {
                skuId: 'sku-1',
                quantity: 2,
            },
            {
                skuId: 'sku-2',
                quantity: 1,
            },
        ],
    }

    const shippingMethod = {
        id: 'shipping-1',
        name: 'Standard Delivery',
        code: 'STANDARD',
        priceCents: 500,
        isActive: true,
    }

    const skus = [
        {
            id: 'sku-1',
            stockQty: 10,
            sizeEU: '42',
            color: {
                images: [{ url: 'image-1.jpg' }],
                product: {
                    name: 'Nike Air',
                    slug: 'nike-air',
                    priceCents: 10000,
                    brand: {
                        name: 'Nike',
                    },
                },
            },
        },
        {
            id: 'sku-2',
            stockQty: 5,
            sizeEU: '43',
            color: {
                images: [{ url: 'image-2.jpg' }],
                product: {
                    name: 'Adidas Run',
                    slug: 'adidas-run',
                    priceCents: 8000,
                    brand: {
                        name: 'Adidas',
                    },
                },
            },
        },
    ]

    function mockTransaction() {
        const tx = {
            productSku: {
                updateMany: jest.fn().mockResolvedValue({ count: 1 }),
            },
            order: {
                create: jest.fn().mockResolvedValue({
                    id: 'order-1',
                    userId: 'user-1',
                    guestToken: null,
                    status: OrderStatus.PENDING_PAYMENT,
                    subtotalCents: 28000,
                    shippingCents: 500,
                    totalCents: 28500,
                    currency: 'EUR',
                    items: [],
                    customerInfo: {
                        email: 'encrypted:customer@test.com',
                        name: 'encrypted:John Doe',
                    },
                    shippingAddress: {
                        fullName: 'encrypted:John Doe',
                        phone: 'encrypted:+33123456789',
                        address: 'encrypted:10 Test Street',
                        city: 'encrypted:Rouen',
                        postcode: '76000',
                        country: 'France',
                    },
                    shippingMethod: {
                        name: 'Standard Delivery',
                        code: 'STANDARD',
                        priceCents: 500,
                    },
                    orderStatusHistory: [],
                }),
            },
        }

        prisma.$transaction.mockImplementation(async (callback) => {
            return callback(tx)
        })

        return tx
    }

    it('should calculate subtotal, shipping, and total correctly', async () => {
        prisma.shippingMethod.findFirst.mockResolvedValue(shippingMethod)
        prisma.productSku.findMany.mockResolvedValue(skus)

        const tx = mockTransaction()

        await service.create('user-1', dto as any)

        expect(tx.order.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    subtotalCents: 28000,
                    shippingCents: 500,
                    totalCents: 28500,
                    currency: 'EUR',
                }),
            }),
        )
    })

    it('should create order items with correct line totals', async () => {
        prisma.shippingMethod.findFirst.mockResolvedValue(shippingMethod)
        prisma.productSku.findMany.mockResolvedValue(skus)

        const tx = mockTransaction()

        await service.create('user-1', dto as any)

        expect(tx.order.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    items: {
                        create: [
                            expect.objectContaining({
                                skuId: 'sku-1',
                                quantity: 2,
                                unitPriceCents: 10000,
                                lineTotalCents: 20000,
                            }),
                            expect.objectContaining({
                                skuId: 'sku-2',
                                quantity: 1,
                                unitPriceCents: 8000,
                                lineTotalCents: 8000,
                            }),
                        ],
                    },
                }),
            }),
        )
    })

    it('should throw BadRequestException when order has no items', async () => {
        await expect(
            service.create('user-1', {
                ...dto,
                items: [],
            } as any),
        ).rejects.toBeInstanceOf(BadRequestException)
    })

    it('should throw NotFoundException when shipping method does not exist', async () => {
        prisma.shippingMethod.findFirst.mockResolvedValue(null)

        await expect(
            service.create('user-1', dto as any),
        ).rejects.toBeInstanceOf(NotFoundException)
    })

    it('should throw BadRequestException when some SKUs are missing', async () => {
        prisma.shippingMethod.findFirst.mockResolvedValue(shippingMethod)
        prisma.productSku.findMany.mockResolvedValue([skus[0]])

        await expect(
            service.create('user-1', dto as any),
        ).rejects.toBeInstanceOf(BadRequestException)
    })

    it('should throw BadRequestException when stock is not enough', async () => {
        prisma.shippingMethod.findFirst.mockResolvedValue(shippingMethod)

        prisma.productSku.findMany.mockResolvedValue([
            {
                ...skus[0],
                stockQty: 1,
            },
            skus[1],
        ])

        await expect(
            service.create('user-1', dto as any),
        ).rejects.toBeInstanceOf(BadRequestException)
    })

    it('should reserve stock inside transaction', async () => {
        prisma.shippingMethod.findFirst.mockResolvedValue(shippingMethod)
        prisma.productSku.findMany.mockResolvedValue(skus)

        const tx = mockTransaction()

        await service.create('user-1', dto as any)

        expect(tx.productSku.updateMany).toHaveBeenCalledWith({
            where: {
                id: 'sku-1',
                stockQty: {
                    gte: 2,
                },
            },
            data: {
                stockQty: {
                    decrement: 2,
                },
            },
        })

        expect(tx.productSku.updateMany).toHaveBeenCalledWith({
            where: {
                id: 'sku-2',
                stockQty: {
                    gte: 1,
                },
            },
            data: {
                stockQty: {
                    decrement: 1,
                },
            },
        })
    })

    it('should throw BadRequestException if stock update fails during transaction', async () => {
        prisma.shippingMethod.findFirst.mockResolvedValue(shippingMethod)
        prisma.productSku.findMany.mockResolvedValue(skus)

        const tx = {
            productSku: {
                updateMany: jest.fn().mockResolvedValue({ count: 0 }),
            },
            order: {
                create: jest.fn(),
            },
        }

        prisma.$transaction.mockImplementation(async (callback) => {
            return callback(tx)
        })

        await expect(
            service.create('user-1', dto as any),
        ).rejects.toBeInstanceOf(BadRequestException)

        expect(tx.order.create).not.toHaveBeenCalled()
    })
})