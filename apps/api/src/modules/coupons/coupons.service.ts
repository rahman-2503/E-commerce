import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  async apply(code: string, amount: number) {
    const coupon = await this.prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!coupon) throw new BadRequestException('Invalid coupon code');
    if (!coupon.isActive) throw new BadRequestException('Coupon is no longer active');
    if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new BadRequestException('Coupon has expired');
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) throw new BadRequestException('Coupon usage limit reached');
    if (coupon.minOrderValue && amount < coupon.minOrderValue) throw new BadRequestException(`Minimum order value of ₹${coupon.minOrderValue} required`);

    let discount = 0;
    if (coupon.type === 'PERCENTAGE') {
      discount = Math.round((amount * coupon.value) / 100);
    } else {
      discount = coupon.value;
    }

    discount = Math.min(discount, amount);

    return { discount, couponCode: coupon.code };
  }
}
