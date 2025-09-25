import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private userService: UsersService,
    private mailService: MailService
  ) { }

  async register(data: Partial<User>) {
    const user = new this.userModel(data);
    user.save();
    const payload = { sub: user._id, username: user.username, role: user.role, type: user.type };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async login(username: string, password: string) {
    const user = await this.userModel.findOne({ username });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user._id, username: user.username, role: user.role, type: user.type };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
  async forgetPassword(email: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // create a reset token valid for 15 minutes
    const token = this.jwtService.sign(
      { sub: user._id },
      { secret: process.env.JWT_SECRET, expiresIn: '15m' },
    );

    await this.mailService.sendForgotPassword(user.email, token);

    return { message: 'Password reset email sent' };
  }
async resetPassword(token: string, newPassword: string) {
  try {
    const decoded = this.jwtService.verify(token, {
      secret: process.env.JWT_SECRET,
    });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await this.userModel.findByIdAndUpdate(
      decoded.sub,
      { password: hashedPassword },
      { new: true }
    );

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return { message: 'Password has been reset successfully' };
  } catch (err) {
    throw new UnauthorizedException('Invalid or expired reset token');
  }
}
}
