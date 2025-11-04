import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { Task, TaskDocument } from './schemas/board.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
    private readonly jwtService: JwtService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // ✅ Create a new task
  async create(
    dto: CreateTaskDto,
    token: string,
    files?: Express.Multer.File[],
  ): Promise<Task> {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      const user = await this.userModel.findById(decoded.sub);
      if (!user) throw new NotFoundException('User not found');

      // Upload images to Cloudinary if provided
      let uploadedImages: string[] = [];
      if (files && files.length > 0) {
        const uploadPromises = files.map((file) =>
          this.cloudinaryService.uploadFile(file),
        );
        const results = await Promise.all(uploadPromises);
        uploadedImages = results.map((r) => r.secure_url);
      }

      const newTask = new this.taskModel({
        ...dto,
        images: uploadedImages,
        createdBy: decoded.sub,
      });

      return await newTask.save();
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  // ✅ Update an existing task
  async update(
    id: string,
    dto: UpdateTaskDto,
    token: string,
    files?: Express.Multer.File[],
  ): Promise<Task> {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      const user = await this.userModel.findById(decoded.sub);
      if (!user) throw new NotFoundException('User not found');

      const task = await this.taskModel.findById(id);
      if (!task) throw new NotFoundException('Task not found');

      // Upload new images if provided
      if (files && files.length > 0) {
        const uploadPromises = files.map((file) =>
          this.cloudinaryService.uploadFile(file),
        );
        const results = await Promise.all(uploadPromises);
        const newImages = results.map((r) => r.secure_url);

        // Merge with existing images
        dto.images = [...(task.images || []), ...newImages];
      }

      const updatedTask = await this.taskModel
        .findByIdAndUpdate(id, dto, { new: true })
        .populate('subtasks')
        .exec();
      
      // @ts-ignore
      return updatedTask;
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  // ✅ Get all tasks affected to the current user
  async findAllAffectedToUser(token: string): Promise<Task[]> {
    const decoded = this.jwtService.verify(token, {
      secret: process.env.JWT_SECRET,
    });
    const user = await this.userModel.findById(decoded.sub);
    if (!user) throw new NotFoundException('User not found');

    return this.taskModel.find({ affectedTo: decoded.sub }).exec();
  }

  // ✅ Get all tasks in the user's organization
  async findAll(token: string): Promise<Task[]> {
    const decoded = this.jwtService.verify(token, {
      secret: process.env.JWT_SECRET,
    });
    const user = await this.userModel.findById(decoded.sub);
    if (!user) throw new NotFoundException('User not found');

    const organizationId = user.organization;
    if (!organizationId) throw new NotFoundException('Organization not found');

    return this.taskModel.find({ organization: organizationId }).exec();
  }

  // ✅ Get one task by ID
  async findOne(id: string, token: string): Promise<Task> {
    const decoded = this.jwtService.verify(token, {
      secret: process.env.JWT_SECRET,
    });
    const user = await this.userModel.findById(decoded.sub);
    if (!user) throw new NotFoundException('User not found');

    const task = await this.taskModel.findById(id).populate('subtasks').exec();
    if (!task) throw new NotFoundException('Task not found');

    return task;
  }

  // ✅ Delete a task
  async remove(id: string, token: string) {
    const decoded = this.jwtService.verify(token, {
      secret: process.env.JWT_SECRET,
    });
    const user = await this.userModel.findById(decoded.sub);
    if (!user) throw new NotFoundException('User not found');

    const deleted = await this.taskModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Task not found');

    return { message: 'Task deleted successfully' };
  }

  // ✅ Change subtasks (with optional subtask image upload)
  async changeSubTasks(
    id: string,
    data: any,
    token: string,
    files?: Express.Multer.File[],
  ) {
    const decoded = this.jwtService.verify(token, {
      secret: process.env.JWT_SECRET,
    });
    const user = await this.userModel.findById(decoded.sub);
    if (!user) throw new NotFoundException('User not found');

    const task = await this.taskModel.findById(id);
    if (!task) throw new NotFoundException('Task not found');

    // Upload images for subtasks if provided
    let uploadedSubtaskImages: string[] = [];
    if (files && files.length > 0) {
      const uploadPromises = files.map((file) =>
        this.cloudinaryService.uploadFile(file),
      );
      const results = await Promise.all(uploadPromises);
      uploadedSubtaskImages = results.map((r) => r.secure_url);
    }

    // Assign images to subtasks
    if (data && data.subtasks) {
      data.subtasks = data.subtasks.map((subtask, index) => ({
        ...subtask,
        images: uploadedSubtaskImages[index]
          ? [uploadedSubtaskImages[index]]
          : subtask.images || [],
      }));
    }

    task.subtasks = data.subtasks;
    await task.save();

    return { message: 'Subtasks updated successfully', task };
  }
}
