import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user cart' })
  async getCart(@CurrentUser() user: { id: string }) {
    return this.cartService.getCart(user.id);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add item to cart' })
  async addItem(
    @CurrentUser() user: { id: string },
    @Body() body: { productId: string; variantId?: string; quantity: number },
  ) {
    return this.cartService.addItem(user.id, body.productId, body.variantId || null, body.quantity);
  }

  @Patch('items/:id')
  @ApiOperation({ summary: 'Update cart item quantity' })
  async updateQuantity(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() body: { quantity: number },
  ) {
    return this.cartService.updateQuantity(user.id, id, body.quantity);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Remove item from cart' })
  async removeItem(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.cartService.removeItem(user.id, id);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear cart' })
  async clearCart(@CurrentUser() user: { id: string }) {
    return this.cartService.clearCart(user.id);
  }
}
