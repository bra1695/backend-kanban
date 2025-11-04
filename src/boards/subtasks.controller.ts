import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Headers,
  UnauthorizedException,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { SubtaskService } from './subtasks.service';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

@ApiTags('SubTasks')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('tasks/:taskId/subtasks')
@Roles(...Object.values(Role))
export class SubtaskController {
  constructor(private readonly subtaskService: SubtaskService) {}

  private extractToken(authHeader: string): string {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Authorization token missing or malformed',
      );
    }
    return authHeader.split(' ')[1];
  }

  // 🟢 Create subtask
  @Post()
  @UseInterceptors(FilesInterceptor('images'))
  @ApiOperation({ summary: 'Create a new SubTask' })
  @ApiResponse({ status: 201, description: 'SubTask created successfully.' })
  async create(
    @Param('taskId') taskId: string,
    @Body() dto: CreateSubtaskDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Headers('authorization') authHeader: string,
  ) {
    const token = this.extractToken(authHeader);
    return this.subtaskService.create(taskId, dto, token, files);
  }

  // 🔵 Get all subtasks for a task
  @Get()
  findAll(@Param('taskId') taskId: string) {
    return this.subtaskService.findAll(taskId);
  }

  // 🟣 Get a single subtask
  @Get(':subtaskId')
  findOne(
    @Param('taskId') taskId: string,
    @Param('subtaskId') subtaskId: string,
  ) {
    return this.subtaskService.findOne(taskId, subtaskId);
  }

  // 🟠 Update subtask
  @Patch(':subtaskId')
  @UseInterceptors(FilesInterceptor('images'))
  update(
    @Param('taskId') taskId: string,
    @Param('subtaskId') subtaskId: string,
    @Body() dto: UpdateSubtaskDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Headers('authorization') authHeader: string,
  ) {
    const token = this.extractToken(authHeader);
    return this.subtaskService.update(taskId, subtaskId, dto, token, files);
  }

  // 🔴 Delete subtask
  @Delete(':subtaskId')
  remove(
    @Param('taskId') taskId: string,
    @Param('subtaskId') subtaskId: string,
  ) {
    return this.subtaskService.remove(taskId, subtaskId);
  }
}
