import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common'
import { CartService } from './cart.service'
import { ProductStatus } from '@prisma/client'

describe('CartService', () => {
  let service: CartService

  const prisma = {
    productSku: {
      findUnique: jest.fn(),
    },
    cart: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    cartItem: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    service = new CartService(prisma as any)
  })

  const mockSku = {
    id: 'sku-1',
    stockQty: 5,
    sizeEU: { toString: () => '42' },
    color: {
      colorName: 'Black',
      images: [{ url: 'image.jpg' }],
      product: {
        id: 'product-1',
        slug: 'nike-air',
        name: 'Nike Air',
        status: ProductStatus.ACTIVE,
        priceCents: 10000,
        currency: 'EUR',
        brandId: 'brand-1',
        categoryId: 'cat-1',
        gender: 'MEN',
        brand: {
          name: 'Nike',
        },
      },
    },
  }

  const mockCart = {
    id: 'cart-1',
    userId: 'user-1',
  }

  const mockCartWithItems = {
    ...mockCart,
    items: [
      {
        id: 'item-1',
        skuId: 'sku-1',
        quantity: 2,
        sku: mockSku,
      },
    ],
  }

  describe('addItem', () => {
    it('should create cart and add item when user has no cart', async () => {
      prisma.productSku.findUnique.mockResolvedValue(mockSku)
      prisma.cart.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockCartWithItems)

      prisma.cart.create.mockResolvedValue(mockCart)
      prisma.cartItem.findUnique.mockResolvedValue(null)
      prisma.cartItem.create.mockResolvedValue({
        id: 'item-1',
        cartId: 'cart-1',
        skuId: 'sku-1',
        quantity: 2,
      })

      const result = await service.addItem('user-1', {
        skuId: 'sku-1',
        quantity: 2,
      })

      expect(prisma.cart.create).toHaveBeenCalledWith({
        data: { userId: 'user-1' },
      })

      expect(prisma.cartItem.create).toHaveBeenCalledWith({
        data: {
          cartId: 'cart-1',
          skuId: 'sku-1',
          quantity: 2,
        },
      })

      expect(result.subtotalCents).toBe(20000)
      expect(result.items).toHaveLength(1)
    })

    it('should increase quantity when item already exists', async () => {
      prisma.productSku.findUnique.mockResolvedValue(mockSku)
      prisma.cart.findUnique
        .mockResolvedValueOnce(mockCart)
        .mockResolvedValueOnce({
          ...mockCart,
          items: [
            {
              id: 'item-1',
              skuId: 'sku-1',
              quantity: 4,
              sku: mockSku,
            },
          ],
        })

      prisma.cartItem.findUnique.mockResolvedValue({
        id: 'item-1',
        cartId: 'cart-1',
        skuId: 'sku-1',
        quantity: 2,
      })

      prisma.cartItem.update.mockResolvedValue({
        id: 'item-1',
        quantity: 4,
      })

      const result = await service.addItem('user-1', {
        skuId: 'sku-1',
        quantity: 2,
      })

      expect(prisma.cartItem.update).toHaveBeenCalledWith({
        where: { id: 'item-1' },
        data: { quantity: 4 },
      })

      expect(result.subtotalCents).toBe(40000)
    })

    it('should throw NotFoundException when SKU does not exist', async () => {
      prisma.productSku.findUnique.mockResolvedValue(null)

      await expect(
        service.addItem('user-1', {
          skuId: 'bad-sku',
          quantity: 1,
        }),
      ).rejects.toBeInstanceOf(NotFoundException)
    })

    it('should throw BadRequestException when product is inactive', async () => {
      prisma.productSku.findUnique.mockResolvedValue({
        ...mockSku,
        color: {
          ...mockSku.color,
          product: {
            ...mockSku.color.product,
            status: ProductStatus.ARCHIVED,
          },
        },
      })

      await expect(
        service.addItem('user-1', {
          skuId: 'sku-1',
          quantity: 1,
        }),
      ).rejects.toBeInstanceOf(BadRequestException)
    })

    it('should throw BadRequestException when quantity exceeds stock', async () => {
      prisma.productSku.findUnique.mockResolvedValue(mockSku)

      await expect(
        service.addItem('user-1', {
          skuId: 'sku-1',
          quantity: 10,
        }),
      ).rejects.toBeInstanceOf(BadRequestException)
    })

    it('should throw BadRequestException when existing quantity plus new quantity exceeds stock', async () => {
      prisma.productSku.findUnique.mockResolvedValue(mockSku)
      prisma.cart.findUnique.mockResolvedValue(mockCart)

      prisma.cartItem.findUnique.mockResolvedValue({
        id: 'item-1',
        cartId: 'cart-1',
        skuId: 'sku-1',
        quantity: 4,
      })

      await expect(
        service.addItem('user-1', {
          skuId: 'sku-1',
          quantity: 2,
        }),
      ).rejects.toBeInstanceOf(BadRequestException)
    })
  })

  describe('getCart', () => {
    it('should return empty cart when cart does not exist', async () => {
      prisma.cart.findUnique.mockResolvedValue(null)

      const result = await service.getCart('user-1')

      expect(result).toEqual({
        items: [],
        subtotalCents: 0,
        warnings: [],
      })
    })

    it('should return cart with subtotal', async () => {
      prisma.cart.findUnique.mockResolvedValue(mockCartWithItems)

      const result = await service.getCart('user-1')

      expect(result.items).toHaveLength(1)
      expect(result.subtotalCents).toBe(20000)
      expect(result.warnings).toEqual([])
    })

    it('should warn when product is inactive', async () => {
      prisma.cart.findUnique.mockResolvedValue({
        ...mockCart,
        items: [
          {
            id: 'item-1',
            skuId: 'sku-1',
            quantity: 2,
            sku: {
              ...mockSku,
              color: {
                ...mockSku.color,
                product: {
                  ...mockSku.color.product,
                  status: ProductStatus.ARCHIVED,
                },
              },
            },
          },
        ],
      })

      const result = await service.getCart('user-1')

      expect(result.subtotalCents).toBe(0)
      expect(result.warnings[0].reason).toBe('PRODUCT_NOT_AVAILABLE')
    })

    it('should warn when item is out of stock', async () => {
      prisma.cart.findUnique.mockResolvedValue({
        ...mockCart,
        items: [
          {
            id: 'item-1',
            skuId: 'sku-1',
            quantity: 2,
            sku: {
              ...mockSku,
              stockQty: 0,
            },
          },
        ],
      })

      const result = await service.getCart('user-1')

      expect(result.subtotalCents).toBe(0)
      expect(result.warnings[0].reason).toBe('OUT_OF_STOCK')
    })

    it('should adjust quantity when cart quantity is higher than stock', async () => {
      prisma.cart.findUnique.mockResolvedValue({
        ...mockCart,
        items: [
          {
            id: 'item-1',
            skuId: 'sku-1',
            quantity: 10,
            sku: {
              ...mockSku,
              stockQty: 3,
            },
          },
        ],
      })

      const result = await service.getCart('user-1')

      expect(result.items[0].quantity).toBe(3)
      expect(result.items[0].requestedQuantity).toBe(10)
      expect(result.subtotalCents).toBe(30000)
      expect(result.warnings[0].reason).toBe('QUANTITY_ADJUSTED')
    })
  })

  describe('updateItemBySku', () => {
    it('should update item quantity', async () => {
      prisma.cartItem.findFirst.mockResolvedValue({
        id: 'item-1',
        skuId: 'sku-1',
        quantity: 1,
        sku: {
          stockQty: 5,
        },
      })

      prisma.cartItem.update.mockResolvedValue({
        id: 'item-1',
        quantity: 3,
      })

      prisma.cart.findUnique.mockResolvedValue(mockCartWithItems)

      await service.updateItemBySku('user-1', 'sku-1', {
        quantity: 3,
      })

      expect(prisma.cartItem.update).toHaveBeenCalledWith({
        where: { id: 'item-1' },
        data: { quantity: 3 },
      })
    })

    it('should delete item when quantity is zero', async () => {
      prisma.cartItem.findFirst.mockResolvedValue({
        id: 'item-1',
        skuId: 'sku-1',
        quantity: 1,
        sku: {
          stockQty: 5,
        },
      })

      prisma.cartItem.delete.mockResolvedValue({})
      prisma.cart.findUnique.mockResolvedValue({
        ...mockCart,
        items: [],
      })

      await service.updateItemBySku('user-1', 'sku-1', {
        quantity: 0,
      })

      expect(prisma.cartItem.delete).toHaveBeenCalledWith({
        where: { id: 'item-1' },
      })
    })

    it('should throw NotFoundException when cart item does not exist', async () => {
      prisma.cartItem.findFirst.mockResolvedValue(null)

      await expect(
        service.updateItemBySku('user-1', 'sku-1', {
          quantity: 1,
        }),
      ).rejects.toBeInstanceOf(NotFoundException)
    })

    it('should throw BadRequestException when quantity exceeds stock', async () => {
      prisma.cartItem.findFirst.mockResolvedValue({
        id: 'item-1',
        skuId: 'sku-1',
        quantity: 1,
        sku: {
          stockQty: 2,
        },
      })

      await expect(
        service.updateItemBySku('user-1', 'sku-1', {
          quantity: 5,
        }),
      ).rejects.toBeInstanceOf(BadRequestException)
    })
  })

  describe('removeItem', () => {
    it('should remove item from cart', async () => {
      prisma.cart.findUnique
        .mockResolvedValueOnce(mockCart)
        .mockResolvedValueOnce({
          ...mockCart,
          items: [],
        })

      prisma.cartItem.findFirst.mockResolvedValue({
        id: 'item-1',
        skuId: 'sku-1',
        cartId: 'cart-1',
      })

      prisma.cartItem.delete.mockResolvedValue({})

      await service.removeItem('user-1', 'sku-1')

      expect(prisma.cartItem.delete).toHaveBeenCalledWith({
        where: { id: 'item-1' },
      })
    })

    it('should throw NotFoundException when cart does not exist', async () => {
      prisma.cart.findUnique.mockResolvedValue(null)

      await expect(
        service.removeItem('user-1', 'sku-1'),
      ).rejects.toBeInstanceOf(NotFoundException)
    })

    it('should throw NotFoundException when cart item does not exist', async () => {
      prisma.cart.findUnique.mockResolvedValue(mockCart)
      prisma.cartItem.findFirst.mockResolvedValue(null)

      await expect(
        service.removeItem('user-1', 'sku-1'),
      ).rejects.toBeInstanceOf(NotFoundException)
    })
  })

  describe('clearCart', () => {
    it('should clear cart items', async () => {
      prisma.cart.findUnique
        .mockResolvedValueOnce(mockCart)
        .mockResolvedValueOnce({
          ...mockCart,
          items: [],
        })

      prisma.cartItem.deleteMany.mockResolvedValue({
        count: 2,
      })

      const result = await service.clearCart('user-1')

      expect(prisma.cartItem.deleteMany).toHaveBeenCalledWith({
        where: {
          cartId: 'cart-1',
        },
      })

      expect(result.items).toEqual([])
    })

    it('should return empty cart response when cart does not exist', async () => {
      prisma.cart.findUnique.mockResolvedValue(null)

      const result = await service.clearCart('user-1')

      expect(result).toEqual({
        id: null,
        items: [],
        totalItems: 0,
        subtotalCents: 0,
        currency: 'EUR',
      })
    })
  })
})