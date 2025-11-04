import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private readonly cloudinaryService: CloudinaryService,

  ) {}

  // ✅ get user profile by token
  async getProfile(token: string) {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      const user = await this.userModel.findById(decoded.sub).select('-password');
      if (!user) throw new NotFoundException('User not found');

      return user;
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  // ✅ update user profile (only connected user can modify himself)
 async updateProfile(token: string, updateData: any, file?: Express.Multer.File) {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
        
      });

      const user = await this.userModel.findById(decoded.sub);
      if (!user) throw new NotFoundException('User not found');

      // Upload image to Cloudinary if provided
      if (file) {
        const uploadedImage = await this.cloudinaryService.uploadFile(file);
        updateData.image = uploadedImage.secure_url;
      }

      // Update allowed fields only
      const allowedFields = ['name', 'address', 'postalCode', 'phone', 'city', 'bio', 'image'];
      allowedFields.forEach((field) => {
        if (updateData[field] !== undefined) {
          user[field] = updateData[field];
        }
      });

      await user.save();

      return {
        message: 'Profile updated successfully',
        user: user.toObject(),
      };
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
