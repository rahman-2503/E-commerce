import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Wishlist')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wishlist')
export class WishlistController {
  constructor(private wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: 'Get user wishlist' })
  async findAll(@CurrentUser() user: { id: string }) {
    return this.wishlistService.findAll(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Add product to wishlist' })
  async add(@CurrentUser() user: { id: string }, @Body() body: { productId: string }) {
    return this.wishlistService.add(user.id, body.productId);
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Remove product from wishlist' })
  async remove(@CurrentUser() user: { id: string }, @Param('productId') productId: string) {
    return this.wishlistService.remove(user.id, productId);
  }
}
