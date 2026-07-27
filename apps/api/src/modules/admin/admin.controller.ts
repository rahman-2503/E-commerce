import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get admin dashboard stats' })
  async getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('orders')
  @ApiOperation({ summary: 'Get all orders with user details' })
  async getOrders(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.findAllOrders({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      status,
    });
  }

  @Patch('orders/:id/status')
  @ApiOperation({ summary: 'Update order status' })
  async updateOrderStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.adminService.updateOrderStatus(id, body.status);
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users with order counts' })
  async getUsers() {
    return this.adminService.findAllUsers();
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all categories' })
  async getCategories() {
    return this.adminService.findAllCategories();
  }

  @Post('change-password')
  @ApiOperation({ summary: 'Change admin password' })
  async changePassword(
    @CurrentUser() user: { id: string },
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    return this.adminService.changePassword(user.id, body.currentPassword, body.newPassword);
  }
}
