import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { MergeCartDto } from './dto/merge-cart.dto';
import { Gender, ProductStatus } from '@prisma/client';
import { PreviewCartDto } from './dto/preview-cart.dto';
import { CartWarning, CartPreviewItem, CartPreviewResponse } from "@app/shared/cart"
import { GuestRecommendationsDto } from './dto/guestRecom.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class CartService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cloudinary: CloudinaryService,
    ) { }

    private async getValidSku(dto: AddCartItemDto) {
        const sku = await this.prisma.productSku.findUnique({
            where: { id: dto.skuId },
            include: {
                color: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        if (!sku) {
            throw new NotFoundException('SKU not found');
        }

        if (sku.color.product.status !== ProductStatus.ACTIVE) {
            throw new BadRequestException('Product is not available');
        }

        if (sku.stockQty <= 0) {
            throw new BadRequestException('Out of stock');
        }

        if (dto.quantity > sku.stockQty) {
            throw new BadRequestException('Requested quantity exceeds stock');
        }

        return sku;
    }

    async addItem(userId: string, dto: AddCartItemDto) {

        const sku = await this.getValidSku(dto);

        let cart = await this.prisma.cart.findUnique({
            where: { userId },
        });

        if (!cart) {
            cart = await this.prisma.cart.create({
                data: { userId },
            });
        }

        const existingItem = await this.prisma.cartItem.findUnique({
            where: {
                cartId_skuId: {
                    cartId: cart.id,
                    skuId: dto.skuId,
                },
            },
        });

        if (existingItem) {
            const nextQuantity = existingItem.quantity + dto.quantity;

            if (nextQuantity > sku.stockQty) {
                throw new BadRequestException(
                    `Only ${sku.stockQty} item(s) available in stock`,
                );
            }

            await this.prisma.cartItem.update({
                where: { id: existingItem.id },
                data: {
                    quantity: nextQuantity,
                },
            });
        } else {
            if (dto.quantity > sku.stockQty) {
                throw new BadRequestException(
                    `Only ${sku.stockQty} item(s) available in stock`,
                );
            }

            await this.prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    skuId: dto.skuId,
                    quantity: dto.quantity,
                },
            });
        }
        return this.getCart(userId);
    }

    async getCart(userId: string): Promise<CartPreviewResponse> {
        const cart = await this.prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        sku: {
                            include: {
                                color: {
                                    include: {
                                        product: {
                                            include: {
                                                brand: true,
                                            },
                                        },
                                        images: {
                                            orderBy: { sortOrder: 'asc' },
                                            take: 1,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!cart) {
            return {
                items: [],
                subtotalCents: 0,
                warnings: [],
            };
        }

        const warnings: CartWarning[] = [];

        const items = cart.items.map((item) => {
            const product = item.sku.color.product;

            let quantity = item.quantity;
            let lineTotalCents = item.quantity * product.priceCents;

            if (product.status !== ProductStatus.ACTIVE) {
                quantity = 0;
                lineTotalCents = 0;

                warnings.push({
                    skuId: item.skuId,
                    reason: 'PRODUCT_NOT_AVAILABLE',
                    message: `${product.name} is no longer available.`,
                });
            } else if (item.sku.stockQty <= 0) {
                quantity = 0;
                lineTotalCents = 0;

                warnings.push({
                    skuId: item.skuId,
                    reason: 'OUT_OF_STOCK',
                    message: `${product.name} is currently out of stock.`,
                });
            } else if (item.quantity > item.sku.stockQty) {
                quantity = item.sku.stockQty;
                lineTotalCents = quantity * product.priceCents;

                warnings.push({
                    skuId: item.skuId,
                    reason: 'QUANTITY_ADJUSTED',
                    message: `Only ${item.sku.stockQty} item(s) available for ${product.name}. Quantity adjusted from ${item.quantity} to ${quantity}.`,
                });
            }

            return {
                skuId: item.skuId,
                productId: product.id,
                slug: product.slug,
                name: product.name,

                brandName: product.brand.name,
                brandId: product.brandId,
                categoryId: product.categoryId,
                gender: product.gender,

                colorName: item.sku.color.colorName,
                sizeEU: item.sku.sizeEU.toString(),
                imageUrl:
                    item.sku.color.images[0]?.publicId
                        ? this.cloudinary.getThumbnailUrl(
                            item.sku.color.images[0].publicId,
                        )
                        : null,
                currency: product.currency,
                priceCents: product.priceCents,
                requestedQuantity: item.quantity,
                quantity,
                availableQuantity: item.sku.stockQty,
                lineTotalCents,
            };
        });

        const subtotalCents = items.reduce(
            (sum, item) => sum + item.lineTotalCents,
            0,
        );

        return {
            items,
            subtotalCents,
            warnings,
        };
    }

    async updateItemBySku(userId: string, skuId: string, dto: UpdateCartItemDto) {
        const item = await this.prisma.cartItem.findFirst({
            where: {
                skuId,
                cart: {
                    userId,
                },
            },
            include: {
                sku: true,
            },
        })

        if (!item) {
            throw new NotFoundException('Cart item not found')
        }

        if (dto.quantity > item.sku.stockQty) {
            throw new BadRequestException(`Only ${item.sku.stockQty} available`)
        }

        if (dto.quantity <= 0) {
            await this.prisma.cartItem.delete({
                where: { id: item.id },
            })
        } else {
            await this.prisma.cartItem.update({
                where: { id: item.id },
                data: { quantity: dto.quantity },
            })
        }

        return this.getCart(userId)
    }

    async removeItem(userId: string, skuId: string) {
        const cart = await this.prisma.cart.findUnique({
            where: { userId },
        })

        if (!cart) {
            throw new NotFoundException('Cart not found')
        }

        const item = await this.prisma.cartItem.findFirst({
            where: {
                cartId: cart.id,
                skuId,
            },
        })

        if (!item) {
            throw new NotFoundException('Cart item not found')
        }

        await this.prisma.cartItem.delete({
            where: { id: item.id },
        })

        return this.getCart(userId)
    }

    async mergeCart(userId: string, dto: MergeCartDto) {
        let cart = await this.prisma.cart.findUnique({
            where: { userId },
        });

        if (!cart) {
            cart = await this.prisma.cart.create({
                data: { userId },
            });
        }

        for (const guestItem of dto.items) {
            const sku = await this.prisma.productSku.findUnique({
                where: { id: guestItem.skuId },
            });

            if (!sku) {
                continue;
            }

            if (sku.stockQty <= 0) {
                continue;
            }

            const existingItem = await this.prisma.cartItem.findUnique({
                where: {
                    cartId_skuId: {
                        cartId: cart.id,
                        skuId: guestItem.skuId,
                    },
                },
            });

            const currentQuantity = existingItem?.quantity ?? 0;
            const nextQuantity = currentQuantity + guestItem.quantity;
            const finalQuantity = Math.min(nextQuantity, sku.stockQty);

            if (finalQuantity <= 0) {
                continue;
            }

            if (existingItem) {
                await this.prisma.cartItem.update({
                    where: { id: existingItem.id },
                    data: {
                        quantity: finalQuantity,
                    },
                });
            } else {
                await this.prisma.cartItem.create({
                    data: {
                        cartId: cart.id,
                        skuId: guestItem.skuId,
                        quantity: Math.min(guestItem.quantity, sku.stockQty),
                    },
                });
            }
        }

        return this.getCart(userId);
    }


    async clearCart(userId: string) {
        const cart = await this.prisma.cart.findUnique({
            where: { userId },
        });

        if (!cart) {
            return {
                id: null,
                items: [],
                totalItems: 0,
                subtotalCents: 0,
                currency: 'EUR',
            };
        }

        await this.prisma.cartItem.deleteMany({
            where: {
                cartId: cart.id,
            },
        });

        return this.getCart(userId);
    }


    async previewCart(dto: PreviewCartDto) {
        if (!dto.items.length) {
            return {
                items: [],
                subtotalCents: 0,
                warnings: [],
            };
        }

        const skuIds = dto.items.map((item) => item.skuId);

        const skus = await this.prisma.productSku.findMany({
            where: {
                id: { in: skuIds },
            },
            select: {
                id: true,
                stockQty: true,
                sizeEU: true,
                color: {
                    select: {
                        colorName: true,
                        product: {
                            select: {
                                id: true,
                                slug: true,
                                name: true,
                                status: true,
                                priceCents: true,
                                currency: true,
                                brandId: true,
                                categoryId: true,
                                gender: true,
                                brand: {
                                    select: {
                                        name: true,
                                    },
                                },
                            },
                        },
                        images: {
                            select: {
                                publicId: true,
                                alt: true,
                            },
                            orderBy: {
                                sortOrder: 'asc',
                            },
                            take: 1,
                        },
                    },
                },
            },
        });

        const skuMap = new Map(skus.map((sku) => [sku.id, sku]));

        const warnings: CartWarning[] = [];
        const previewItems: CartPreviewItem[] = [];

        for (const item of dto.items) {
            const sku = skuMap.get(item.skuId);

            if (!sku) {
                warnings.push({
                    skuId: item.skuId,
                    reason: 'SKU_NOT_FOUND',
                    message: 'This item no longer exists.',
                });

                continue;
            }

            const product = sku.color.product;

            if (product.status !== ProductStatus.ACTIVE) {
                warnings.push({
                    skuId: item.skuId,
                    reason: 'PRODUCT_NOT_AVAILABLE',
                    message: `${product.name} is no longer available.`,
                });

                continue;
            }

            if (sku.stockQty <= 0) {
                warnings.push({
                    skuId: item.skuId,
                    reason: 'OUT_OF_STOCK',
                    message: `${product.name} is currently out of stock.`,
                });

                previewItems.push({
                    skuId: sku.id,
                    productId: product.id,
                    slug: product.slug,
                    name: product.name,
                    brandName: product.brand.name,
                    brandId: product.brandId,
                    categoryId: product.categoryId,
                    gender: product.gender,
                    colorName: sku.color.colorName,
                    sizeEU: sku.sizeEU.toString(),
                    imageUrl:
                        sku.color.images[0]?.publicId
                            ? this.cloudinary.getThumbnailUrl(
                                sku.color.images[0].publicId,
                            )
                            : null,
                    currency: product.currency,
                    priceCents: product.priceCents,
                    requestedQuantity: item.quantity,
                    quantity: 0,
                    availableQuantity: 0,
                    lineTotalCents: 0,
                });

                continue;
            }

            const adjustedQuantity = Math.min(item.quantity, sku.stockQty);

            if (adjustedQuantity !== item.quantity) {
                warnings.push({
                    skuId: item.skuId,
                    reason: 'QUANTITY_ADJUSTED',
                    message: `Only ${sku.stockQty} item(s) available for ${product.name}.`,
                });
            }

            previewItems.push({
                skuId: sku.id,
                productId: product.id,
                slug: product.slug,
                name: product.name,
                brandName: product.brand.name,
                brandId: product.brandId,
                categoryId: product.categoryId,
                gender: product.gender,
                colorName: sku.color.colorName,
                sizeEU: sku.sizeEU.toString(),
                imageUrl:
                    sku.color.images[0]?.publicId
                        ? this.cloudinary.getThumbnailUrl(
                            sku.color.images[0].publicId,
                        )
                        : null,
                currency: product.currency,
                priceCents: product.priceCents,
                requestedQuantity: item.quantity,
                quantity: adjustedQuantity,
                availableQuantity: sku.stockQty,
                lineTotalCents: product.priceCents * adjustedQuantity,
            });
        }

        const subtotalCents = previewItems.reduce(
            (sum, item) => sum + item.lineTotalCents,
            0,
        );

        return {
            items: previewItems,
            subtotalCents,
            warnings,
        };
    }

    private async getFallbackRecommendations() {
        const products = await this.prisma.product.findMany({
            where: {
                status: ProductStatus.ACTIVE,
            },
            include: {
                colors: {
                    include: {
                        images: {
                            orderBy: { sortOrder: 'asc' },
                            take: 1,
                        },
                    },
                },
                brand: true,
                category: true,
            },
            take: 6,
            orderBy: { createdAt: 'desc' },
        });

        return products.map((product) => ({
            id: product.id,
            name: product.name,
            slug: product.slug,
            priceCents: product.priceCents,
            currency: product.currency,
            brand: product.brand.name,
            category: product.category.name,
            gender: product.gender,
            thumbnailUrl:
                product.colors[0]?.images[0]?.publicId
                    ? this.cloudinary.getMediumUrl(
                        product.colors[0].images[0].publicId,
                    )
                    : null,
        }))
    }

    private getAllowedGenders(cartGenders: Gender[]): Gender[] {
        const hasKids = cartGenders.includes(Gender.KIDS);
        const hasMen = cartGenders.includes(Gender.MEN);
        const hasWomen = cartGenders.includes(Gender.WOMEN);
        const hasUnisex = cartGenders.includes(Gender.UNISEX);

        const allowedGenders = new Set<Gender>();

        if (hasKids && !hasMen && !hasWomen && !hasUnisex) {
            allowedGenders.add(Gender.KIDS);
            return [...allowedGenders];
        }

        if (hasKids) allowedGenders.add(Gender.KIDS);

        if (hasMen) {
            allowedGenders.add(Gender.MEN);
            allowedGenders.add(Gender.UNISEX);
        }

        if (hasWomen) {
            allowedGenders.add(Gender.WOMEN);
            allowedGenders.add(Gender.UNISEX);
        }

        if (hasUnisex) {
            allowedGenders.add(Gender.UNISEX);
            allowedGenders.add(Gender.MEN);
            allowedGenders.add(Gender.WOMEN);
        }

        return [...allowedGenders];
    }

    private async findRecommendationsFromProducts(products: {
        id: string;
        categoryId: string;
        brandId: string;
        gender: Gender | null;
    }[]) {
        if (products.length === 0) {
            return this.getFallbackRecommendations();
        }

        const productIdsInCart = [...new Set(products.map((p) => p.id))];
        const categoryIds = [...new Set(products.map((p) => p.categoryId))];
        const brandIds = [...new Set(products.map((p) => p.brandId))];

        const cartGenders = [
            ...new Set(
                products
                    .map((p) => p.gender)
                    .filter((g): g is Gender => g !== null),
            ),
        ];

        const allowedGenders = this.getAllowedGenders(cartGenders);

        const recommendations = await this.prisma.product.findMany({
            where: {
                status: ProductStatus.ACTIVE,
                id: {
                    notIn: productIdsInCart,
                },
                ...(allowedGenders.length > 0
                    ? {
                        gender: {
                            in: allowedGenders,
                        },
                    }
                    : {}),
                OR: [
                    { categoryId: { in: categoryIds } },
                    { brandId: { in: brandIds } },
                ],
            },
            include: {
                colors: {
                    include: {
                        images: {
                            orderBy: { sortOrder: 'asc' },
                            take: 1,
                        },
                    },
                },
                brand: true,
                category: true,
            },
            take: 6,
            orderBy: { createdAt: 'desc' },
        });

        if (recommendations.length === 0) {
            return this.getFallbackRecommendations();
        }

        return recommendations.map((product) => ({
            id: product.id,
            name: product.name,
            slug: product.slug,
            priceCents: product.priceCents,
            currency: product.currency,
            brand: product.brand.name,
            category: product.category.name,
            gender: product.gender,
            thumbnailUrl:
                product.colors[0]?.images[0]?.publicId
                    ? this.cloudinary.getMediumUrl(
                        product.colors[0].images[0].publicId,
                    )
                    : null,
        }))
    }

    async getRecommendations(userId: string) {
        const cart = await this.prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        sku: {
                            include: {
                                color: {
                                    include: {
                                        product: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!cart || cart.items.length === 0) {
            return this.getFallbackRecommendations();
        }

        const cartProducts = cart.items.map((item) => item.sku.color.product);

        return this.findRecommendationsFromProducts(cartProducts);
    }


    async getGuestRecommendations(dto: GuestRecommendationsDto) {
        const preview = await this.previewCart(dto);

        const products = preview.items.map((item) => ({
            id: item.productId,
            categoryId: item.categoryId,
            brandId: item.brandId,
            gender: item.gender as Gender | null,
        }));

        return this.findRecommendationsFromProducts(products);
    }
}
