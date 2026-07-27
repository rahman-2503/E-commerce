import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboard() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalRevenue,
      totalOrders,
      totalProducts,
      totalUsers,
      recentOrders,
      lowStockProducts,
      todayOrders,
      todayRevenue,
      statusDistribution,
    ] = await Promise.all([
      this.prisma.order.aggregate({ _sum: { total: true }, where: { status: 'DELIVERED' as any } }),
      this.prisma.order.count(),
      this.prisma.product.count(),
      this.prisma.user.count(),
      this.prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } } },
      }),
      this.prisma.product.findMany({
        where: { variants: { some: { stock: { lte: 5 } } } },
        take: 10,
        include: { variants: true },
      }),
      this.prisma.order.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: { createdAt: { gte: today, lt: tomorrow } },
      }),
      this.prisma.order.groupBy({ by: ['status'], _count: true }),
    ]);

    return {
      revenue: totalRevenue._sum.total || 0,
      totalOrders,
      totalProducts,
      totalUsers,
      todayOrders,
      todayRevenue: todayRevenue._sum?.total || 0,
      statusDistribution: statusDistribution.map((s) => ({ status: s.status, count: s._count })),
      recentOrders,
      lowStockProducts,
    };
  }

  async findAllOrders(params: { page?: number; limit?: number; status?: string }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (params.status) where.status = params.status;

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          items: {
            include: { product: { select: { name: true, images: true } } },
          },
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateOrderStatus(id: string, status: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    return this.prisma.order.update({
      where: { id },
      data: { status: status as any },
      include: { items: true, user: { select: { id: true, name: true, email: true } } },
    });
  }

  async findAllUsers() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      createdAt: u.createdAt,
      orderCount: u._count.orders,
    }));
  }

  async findAllCategories() {
    return this.prisma.category.findMany({
      include: { _count: { select: { products: true } } },
    });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Current password is incorrect');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
    return { message: 'Password updated successfully' };
  }
}
