import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AddressesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' },
    });
  }

  async create(userId: string, data: { label: string; line1: string; line2?: string; city: string; state: string; zip: string; country?: string; isDefault?: boolean }) {
    if (data.isDefault) {
      await this.prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    return this.prisma.address.create({ data: { ...data, userId, country: data.country || 'India' } });
  }

  async update(userId: string, id: string, data: { label?: string; line1?: string; line2?: string; city?: string; state?: string; zip?: string; country?: string; isDefault?: boolean }) {
    const address = await this.prisma.address.findFirst({ where: { id, userId } });
    if (!address) throw new NotFoundException('Address not found');

    if (data.isDefault) {
      await this.prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    return this.prisma.address.update({ where: { id }, data });
  }

  async remove(userId: string, id: string) {
    const address = await this.prisma.address.findFirst({ where: { id, userId } });
    if (!address) throw new NotFoundException('Address not found');
    return this.prisma.address.delete({ where: { id } });
  }
}
