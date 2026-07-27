import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, isBlocked: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true, isBlocked: true, createdAt: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async update(id: string, data: { name?: string }) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, name: true, role: true, isBlocked: true, createdAt: true },
    });
  }

  async block(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role === 'ADMIN') throw new ConflictException('Cannot block an admin');
    return this.prisma.user.update({
      where: { id },
      data: { isBlocked: true },
      select: { id: true, email: true, name: true, role: true, isBlocked: true, createdAt: true },
    });
  }

  async unblock(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return this.prisma.user.update({
      where: { id },
      data: { isBlocked: false },
      select: { id: true, email: true, name: true, role: true, isBlocked: true, createdAt: true },
    });
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role === 'ADMIN') throw new ConflictException('Cannot delete an admin');
    try {
      await this.prisma.$transaction(async (tx) => {
        const orders = await tx.order.findMany({ where: { userId: id }, select: { id: true } });
        const orderIds = orders.map(o => o.id);
        if (orderIds.length > 0) {
          await tx.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
          await tx.order.deleteMany({ where: { userId: id } });
        }
        await tx.cartItem.deleteMany({ where: { userId: id } });
        await tx.user.delete({ where: { id } });
      });
      return { message: 'User deleted successfully' };
    } catch (e) {
      throw new InternalServerErrorException('Failed to delete user');
    }
  }
}
