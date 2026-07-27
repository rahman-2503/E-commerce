import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: string) {
    const items = await this.prisma.$queryRaw`
      SELECT 
        c.id,
        c.product_id,
        c.variant_id,
        c.quantity,
        json_build_object(
          'id', p.id,
          'name', p.name,
          'slug', p.slug,
          'base_price', p.base_price,
          'images', p.images,
          'brand', p.brand
        ) as product
      FROM cart_items c
      JOIN products p ON p.id = c.product_id
      WHERE c.user_id = ${userId}
    `;
    return { items: items || [], total: 0 };
  }

  async addItem(userId: string, productId: string, variantId: string | null, quantity: number) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new BadRequestException('Product not found');

    const existing = await this.prisma.cartItem.findFirst({
      where: { userId, productId, variantId },
    });

    if (existing) {
      return this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    }

    return this.prisma.cartItem.create({
      data: { userId, productId, variantId, quantity },
    });
  }

  async updateQuantity(userId: string, itemId: string, quantity: number) {
    if (quantity <= 0) {
      return this.removeItem(userId, itemId);
    }
    return this.prisma.cartItem.updateMany({
      where: { id: itemId, userId },
      data: { quantity },
    });
  }

  async removeItem(userId: string, itemId: string) {
    return this.prisma.cartItem.deleteMany({
      where: { id: itemId, userId },
    });
  }

  async clearCart(userId: string) {
    return this.prisma.cartItem.deleteMany({ where: { userId } });
  }
}
