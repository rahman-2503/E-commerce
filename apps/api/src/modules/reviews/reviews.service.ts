import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async findByProduct(productId: string) {
    return this.prisma.review.findMany({
      where: { productId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, data: { productId: string; rating: number; title: string; body: string; images?: string[] }) {
    const product = await this.prisma.product.findUnique({ where: { id: data.productId } });
    if (!product) throw new NotFoundException('Product not found');

    const review = await this.prisma.review.create({
      data: { ...data, userId },
      include: { user: { select: { id: true, name: true } } },
    });

    const stats = await this.prisma.review.aggregate({
      where: { productId: data.productId },
      _avg: { rating: true },
      _count: true,
    });

    await this.prisma.product.update({
      where: { id: data.productId },
      data: {
        rating: stats._avg.rating || 0,
        reviewCount: stats._count,
      },
    });

    return review;
  }
}
