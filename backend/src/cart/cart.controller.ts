import { Body, Controller, Post, UseGuards, Get, Patch, Param, Delete } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from 'src/auth/jwt.auth-guards';
import { CurrentUser } from 'src/decorators/current.user';
import { MergeCartDto } from './dto/merge-cart.dto';
import { PreviewCartDto } from './dto/preview-cart.dto';
import { GuestRecommendationsDto } from './dto/guestRecom.dto';

@Controller('cart')
export class CartController {
    constructor(
        private readonly cartService: CartService,
    ) { }
    @UseGuards(JwtAuthGuard)
    @Post('items')
    addItem(
        @CurrentUser('id') userId: string,
        @Body() dto: AddCartItemDto,
    ) {
        return this.cartService.addItem(userId, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    getCart(@CurrentUser('id') userId: string) {
        return this.cartService.getCart(userId);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('items/sku/:skuId')
    updateItem(
        @CurrentUser('id') userId: string,
        @Param('skuId') skuId: string,
        @Body() dto: UpdateCartItemDto,
    ) {
        return this.cartService.updateItemBySku(userId, skuId, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('items/:itemId')
    deleteItem(
        @CurrentUser('id') userId: string,
        @Param('itemId') itemId: string
    ) {
        return this.cartService.removeItem(userId, itemId);
    }


    @UseGuards(JwtAuthGuard)
    @Post('merge')
    mergeCart(
        @CurrentUser('id') userId: string,
        @Body() dto: MergeCartDto,
    ) {
        return this.cartService.mergeCart(userId, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('recommendations')
    getRecommendations(@CurrentUser('id') userId: string) {
        return this.cartService.getRecommendations(userId);
    }

    @Post('recommendations/guest')
    getGuestRecommendations(@Body() dto: GuestRecommendationsDto) {
        return this.cartService.getGuestRecommendations(dto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete()
    clearCart(@CurrentUser('id') userId: string) {
        return this.cartService.clearCart(userId);
    }

    //guest cart validation
    @Post('preview')
    previewCart(@Body() dto: PreviewCartDto) {
        return this.cartService.previewCart(dto);
    }

}
