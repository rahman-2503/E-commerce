import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    page?: number;
    limit?: number;
    categoryId?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 12;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.categoryId) where.categoryId = params.categoryId;
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    if (params.minPrice || params.maxPrice) {
      where.basePrice = {};
      if (params.minPrice) where.basePrice.gte = params.minPrice;
      if (params.maxPrice) where.basePrice.lte = params.maxPrice;
    }

    const orderBy: any = {};
    if (params.sort === 'price_asc') orderBy.basePrice = 'asc';
    else if (params.sort === 'price_desc') orderBy.basePrice = 'desc';
    else if (params.sort === 'newest') orderBy.createdAt = 'desc';
    else if (params.sort === 'rating') orderBy.rating = 'desc';
    else orderBy.createdAt = 'desc';

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: { category: true, variants: true },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        variants: true,
        reviews: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findFeatured() {
    return this.prisma.product.findMany({
      where: { isFeatured: true },
      include: { category: true },
      take: 8,
    });
  }

  async create(data: any) {
    return this.prisma.product.create({ data, include: { category: true } });
  }

  async update(id: string, data: any) {
    return this.prisma.product.update({ where: { id }, data, include: { category: true } });
  }

  async remove(id: string) {
    return this.prisma.product.delete({ where: { id } });
  }
}
