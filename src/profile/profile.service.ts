import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
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
  async updateProfile(token: string, data: Partial<User>) {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      const updatedUser = await this.userModel.findByIdAndUpdate(
        decoded.sub,
        { $set: data },
        { new: true },
      ).select('-password');

      if (!updatedUser) throw new NotFoundException('User not found');

      return updatedUser;
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
