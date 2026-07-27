import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, UnauthorizedException, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user orders' })
  async findAll(@CurrentUser() user: { id: string }) {
    return this.ordersService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  async findById(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.ordersService.findById(id, user.id);
  }

  @Get(':id/invoice')
  @ApiOperation({ summary: 'Download invoice PDF for delivered order' })
  async downloadInvoice(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const html = await this.ordersService.generateInvoiceHtml(id, user.id);
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${id.slice(0, 8)}.html"`);
    res.send(html);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  async create(@CurrentUser() user: any, @Body() body: any) {
    if (user.role === 'ADMIN') {
      throw new UnauthorizedException('Admins cannot place orders');
    }
    return this.ordersService.create(user.id, body);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update order status (Admin)' })
  async updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.ordersService.updateStatus(id, body.status);
  }
}
