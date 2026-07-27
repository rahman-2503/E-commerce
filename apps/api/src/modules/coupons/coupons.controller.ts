import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CouponsService } from './coupons.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Coupons')
@Controller('coupons')
export class CouponsController {
  constructor(private couponsService: CouponsService) {}

  @Post('apply')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Apply a coupon code' })
  async apply(@Body() body: { code: string; amount: number }) {
    return this.couponsService.apply(body.code, body.amount);
  }
}
