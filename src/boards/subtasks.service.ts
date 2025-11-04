import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model, Types } from 'mongoose';
import { Task, TaskDocument } from 'src/boards/schemas/board.schema';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { User, UserDocument } from 'src/users/schemas/user.schema';

@Injectable()
export class SubtaskService {
  constructor(
    @InjectModel(Task.name)
    private readonly taskModel: Model<TaskDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // 🟢 Create subtask under a task
  async create(
    taskId: string,
    dto: CreateSubtaskDto,
    token: string,
    files?: Express.Multer.File[],
  ) {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      const user = await this.userModel.findById(decoded.sub);
      if (!user) throw new NotFoundException('User not found');

      const task = await this.taskModel.findById(taskId);
      if (!task) throw new NotFoundException('Task not found');

      let uploadedImages: string[] = [];
      if (files && files.length > 0) {
        const uploads = await Promise.all(
          files.map((file) => this.cloudinaryService.uploadFile(file)),
        );
        uploadedImages = uploads.map((img) => img.secure_url);
      }

      const newSubtask = {
        _id: new Types.ObjectId(),
        title: dto.title,
        description: dto.description,
        dateStart: dto.dateStart ? new Date(dto.dateStart) : undefined,
        dateEnd: dto.dateEnd ? new Date(dto.dateEnd) : undefined,
        hour: dto.hour,
        isCompleted: dto.isCompleted ?? false,
        createdBy: user._id,
        images: uploadedImages,
      };

      (task.subtasks as any).push(newSubtask);
      await task.save();

      return newSubtask;
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  // 🔵 Get all subtasks of a task
  async findAll(taskId: string) {
    const task = await this.taskModel.findById(taskId);
    if (!task) throw new NotFoundException('Task not found');
    return task.subtasks;
  }

  // 🟣 Get one subtask by ID
  async findOne(taskId: string, subtaskId: string) {
    const task = await this.taskModel.findById(taskId);
    if (!task) throw new NotFoundException('Task not found');

    const subtask = task.subtasks.find(
      (s: any) => s._id.toString() === subtaskId,
    );
    if (!subtask) throw new NotFoundException('Subtask not found');

    return subtask;
  }

  // 🟠 Update a subtask
  async update(
    taskId: string,
    subtaskId: string,
    dto: UpdateSubtaskDto,
    token: string,
    files?: Express.Multer.File[],
  ) {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      const user = await this.userModel.findById(decoded.sub);
      if (!user) throw new NotFoundException('User not found');

      const task = await this.taskModel.findById(taskId);
      if (!task) throw new NotFoundException('Task not found');

      const index = task.subtasks.findIndex(
        (s: any) => s._id.toString() === subtaskId,
      );
      if (index === -1) throw new NotFoundException('Subtask not found');

      let uploadedImages: string[] = [];
      if (files && files.length > 0) {
        const uploads = await Promise.all(
          files.map((file) => this.cloudinaryService.uploadFile(file)),
        );
        uploadedImages = uploads.map((img) => img.secure_url);
      }

      const updatedSubtask = {
        ...task.subtasks[index],
        ...dto,
        dateStart: dto.dateStart
          ? new Date(dto.dateStart)
          : task.subtasks[index].dateStart,
        dateEnd: dto.dateEnd
          ? new Date(dto.dateEnd)
          : task.subtasks[index].dateEnd,
        images:
          uploadedImages.length > 0
            ? uploadedImages
            : task.subtasks[index].images,
      };

      task.subtasks[index] = updatedSubtask as any;
      await task.save();

      return updatedSubtask;
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  // 🔴 Delete a subtask
  async remove(taskId: string, subtaskId: string) {
    const task = await this.taskModel.findById(taskId);
    if (!task) throw new NotFoundException('Task not found');

    const index = task.subtasks.findIndex(
      (s: any) => s._id.toString() === subtaskId,
    );
    if (index === -1) throw new NotFoundException('Subtask not found');

    task.subtasks.splice(index, 1);
    await task.save();

    return { message: 'Subtask deleted successfully' };
  }
}
