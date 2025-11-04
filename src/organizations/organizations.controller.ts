import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UploadedFile, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';


@ApiTags('Organizations')
@Controller('organizations')
@ApiBearerAuth() 
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
export class OrganizationsController {
  constructor(private readonly orgService: OrganizationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new organization (with optional image)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('logo'))
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiResponse({ status: 201, description: 'Organization created successfully.' })
  async create(@Body() dto: CreateOrganizationDto,@UploadedFile() file?: Express.Multer.File,) {
    return this.orgService.create(dto,file);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all organization' })
  @ApiResponse({ status: 200, description: 'List of organizations retrieved successfully.' })
  async findAll() {
    return this.orgService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a single user by ID' })
  @ApiParam({ name: 'id', type: String })
  async findOne(@Param('id') id: string) {
    return this.orgService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing organization (with optional image)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('logo'))
  @ApiResponse({ status: 200, description: 'Organization updated successfully.' })
  @ApiParam({ name: 'id', type: String })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async update(@Param('id') id: string, @Body() dto: UpdateOrganizationDto) {
    return this.orgService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.orgService.delete(id);
  }

  @Put(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate organization'})
  @ApiParam({name: 'id', type: String})
  @HttpCode(200)
  @ApiResponse({status: 200, description: "Organization  deactivated successfully"})
  async deactivate(@Param('id') id: string){
     return this.orgService.desactivateOrganization(id)
  }
  @Put(':id/activate')
  @ApiOperation({ summary: 'Deactivate organization'})
  @ApiParam({name: 'id', type: String})
  @HttpCode(200)
  @ApiResponse({status: 200, description: "Organization  activated successfully"})
  async activate(@Param('id') id: string){
     return this.orgService.activeOrganization(id)
  }
}
