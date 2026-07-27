import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Addresses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('addresses')
export class AddressesController {
  constructor(private addressesService: AddressesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all addresses for current user' })
  async findAll(@CurrentUser() user: { id: string }) {
    return this.addressesService.findAll(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new address' })
  async create(@CurrentUser() user: { id: string }, @Body() body: any) {
    return this.addressesService.create(user.id, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an address' })
  async update(@CurrentUser() user: { id: string }, @Param('id') id: string, @Body() body: any) {
    return this.addressesService.update(user.id, id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an address' })
  async remove(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.addressesService.remove(user.id, id);
  }
}
