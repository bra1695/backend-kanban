import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async findAll() {
    return this.userModel.find().populate('organization').exec();
  }
  async findByEmail(email: string): Promise<any> { return this.userModel.findOne({ email }).exec(); }

  async findById(id: string) {
    const user = await this.userModel.findById(id).populate('organization').exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(data: CreateUserDto, file?: Express.Multer.File) {
    if (file) {
      const uploaded = await this.cloudinaryService.uploadFile(file);
      data = { ...data, image: uploaded.secure_url };
    }

    if (data.password) {
      // @ts-ignore
      data.password = await bcrypt.hash(data.password, 10);
    }

    const user = new this.userModel(data);
    return user.save();
  }

async update(id: string, data: UpdateUserDto, file?: Express.Multer.File) {
  const user = await this.userModel.findById(id);
  if (!user) throw new NotFoundException('User not found');

  // Upload image if provided
  if (file) {
    const uploaded = await this.cloudinaryService.uploadFile(file);
    data.image = uploaded.secure_url; // only overwrite if new file
  }

  // Hash password if provided
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }

  // Only update fields that are defined in `data`
  Object.keys(data).forEach((key) => {
    if (data[key] !== undefined) {
      user[key] = data[key];
    }
  });

  return user.save();
}


  async delete(id: string) {
    const user = await this.userModel.findByIdAndDelete(id);
    if (!user) throw new NotFoundException('User not found');
    return { message: 'User deleted successfully' };
  }

  async activateUser(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');
    user.isActive = true;
    await user.save();
    return { message: 'User account activated successfully' };
  }

  async deactivateUser(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');
    user.isActive = false;
    await user.save();
    return { message: 'User account deactivated successfully' };
  }
}
