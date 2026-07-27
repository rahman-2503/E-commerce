import { Controller, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('Variants')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('variants')
export class VariantsController {
  constructor(private prisma: PrismaService) {}

  @Patch(':id')
  @ApiOperation({ summary: 'Update variant (Admin)' })
  async update(@Param('id') id: string, @Body() body: { stock?: number; price?: number }) {
    return this.prisma.productVariant.update({
      where: { id },
      data: body,
    });
  }
}
