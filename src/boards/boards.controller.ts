import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@ApiTags('Boards')
@ApiBearerAuth()
@Controller('boards')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  private extractToken(authHeader: string): string {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization token missing or malformed');
    }
    return authHeader.split(' ')[1];
  }

  // -------------------- CREATE --------------------
  @Post()
  @ApiBody({
    schema: {
      example: {
        name: 'Project A',
      },
    },
  })
  @ApiOperation({ summary: 'Create a new Board' })
  @ApiResponse({ status: 201, description: 'Board created successfully.' })
  async create(@Body() dto: CreateBoardDto, @Headers('authorization') authHeader: string) {
    const token = this.extractToken(authHeader);
    return this.boardsService.create(dto, token);
  }

  // -------------------- FIND ALL --------------------
  @Get()
  @ApiOperation({ summary: 'Get all boards for current user' })
  async findAll(@Headers('authorization') authHeader: string) {
    const token = this.extractToken(authHeader);
    return this.boardsService.findAll(token);
  }

  // -------------------- FIND ONE --------------------
  @Get(':slug')
  @ApiOperation({ summary: 'Get a board by slug' })
  async findOne(@Param('slug') slug: string, @Headers('authorization') authHeader: string) {
    const token = this.extractToken(authHeader);
    return this.boardsService.findOne(slug, token);
  }

  // -------------------- UPDATE --------------------
  @Put(':slug')
  @ApiOperation({ summary: 'Update a board by slug' })
  async update(
    @Param('slug') slug: string,
    @Body() dto: Partial<CreateBoardDto>,
    @Headers('authorization') authHeader: string,
  ) {
    const token = this.extractToken(authHeader);
    return this.boardsService.update(slug, dto, token);
  }

  // -------------------- DELETE --------------------
  @Delete(':slug')
  @ApiOperation({ summary: 'Delete a board by slug' })
  async remove(@Param('slug') slug: string, @Headers('authorization') authHeader: string) {
    const token = this.extractToken(authHeader);
    return this.boardsService.remove(slug, token);
  }

  // -------------------- ADD COLUMN --------------------
  @Post(':slug/columns')
  @ApiOperation({ summary: 'Add a new column to a board' })
  @ApiBody({
    schema: {
      example: {
        name: 'To Do',
      },
    },
  })
  async addNewColumn(
    @Param('slug') slug: string,
    @Body() columnData: any,
    @Headers('authorization') authHeader: string,
  ) {
    const token = this.extractToken(authHeader);
    return this.boardsService.addNewColumn(slug, token, columnData);
  }
}
