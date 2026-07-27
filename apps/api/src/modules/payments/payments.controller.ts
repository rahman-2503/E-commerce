import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('create-order')
  @ApiOperation({ summary: 'Create a Razorpay order' })
  async createOrder(@Body() body: { amount: number; currency?: string }) {
    return this.paymentsService.createOrder(body.amount, body.currency);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify payment signature' })
  async verifyPayment(
    @CurrentUser() user: { id: string },
    @Body() body: { orderId: string; paymentId: string; signature: string },
  ) {
    return this.paymentsService.verifyPayment(
      body.orderId,
      body.paymentId,
      body.signature,
      user.id,
    );
  }
}
