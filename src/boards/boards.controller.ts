import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('boards')
@UseGuards(AuthGuard('jwt'))
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Post()
  async create(@Body() dto: CreateBoardDto, @Req() req) {
    const user = req.user;

    // ✅ Only admins/superadmins can create boards
    if (!['admin', 'superadmin'].includes(user.type)) {
      throw new ForbiddenException('Only admins can create boards');
    }

    return this.boardsService.create(dto, user._id);
  }

  @Get()
  findAll() {
    return this.boardsService.findAll();
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.boardsService.findOne(slug);
  }

  @Put(':slug')
  update(@Param('slug') slug: string, @Body() dto: Partial<CreateBoardDto>) {
    return this.boardsService.update(slug, dto);
  }

  @Delete(':slug')
  remove(@Param('slug') slug: string) {
    return this.boardsService.remove(slug);
  }
}
