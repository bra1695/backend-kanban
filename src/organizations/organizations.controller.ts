import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('organizations')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class OrganizationsController {
  constructor(private readonly orgService: OrganizationsService) {}

  @Post()
  @Roles('superadmin', 'admin')
  async create(@Body() dto: CreateOrganizationDto) {
    return this.orgService.create(dto);
  }

  @Get()
  async findAll() {
    return this.orgService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.orgService.findOne(id);
  }

  @Put(':id')
  @Roles('superadmin', 'admin')
  async update(@Param('id') id: string, @Body() dto: UpdateOrganizationDto) {
    return this.orgService.update(id, dto);
  }

  @Delete(':id')
  @Roles('superadmin')
  async delete(@Param('id') id: string) {
    return this.orgService.delete(id);
  }
}
