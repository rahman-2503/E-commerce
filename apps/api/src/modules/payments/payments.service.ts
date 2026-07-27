import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import Razorpay from 'razorpay';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  private razorpay: Razorpay;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.razorpay = new Razorpay({
      key_id: this.configService.get('RAZORPAY_KEY_ID'),
      key_secret: this.configService.get('RAZORPAY_KEY_SECRET'),
    });
  }

  async createOrder(amount: number, currency: string = 'INR') {
    const order = await this.razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency,
      receipt: `receipt_${Date.now()}`,
    });
    return order;
  }

  async verifyPayment(
    orderId: string,
    paymentId: string,
    signature: string,
    userId: string,
  ) {
    const secret = this.configService.get('RAZORPAY_KEY_SECRET');
    const expected = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (expected !== signature) {
      throw new BadRequestException('Invalid payment signature');
    }

    const order = await this.prisma.order.findFirst({
      where: { paymentId: orderId, userId },
    });

    if (order) {
      await this.prisma.order.update({
        where: { id: order.id },
        data: {
          paymentId: paymentId,
          paymentResponse: { orderId, paymentId, signature },
          status: 'CONFIRMED',
        },
      });
    }

    return { success: true };
  }
}
