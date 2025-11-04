import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { Role, User, UserDocument, UserType } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private userService: UsersService,
    private mailService: MailService
  ) { }

async register(data: RegisterDto) {
  const user = new this.userModel(data);

  const token = this.jwtService.sign(
    { sub: user._id },
    { secret: process.env.JWT_SECRET, expiresIn: '24h' },
  );

  user.confirmationToken = token;
  user.isActive = false;
  if(data.type==='organization'){
  user.type=UserType.ADMIN;
  }
  else{
    user.type=UserType.USER;
  }
  await user.save();

  await this.mailService.sendAccountConfirmation(user.email, token);

  return { message: 'Registration successful. Please confirm your email.' };
}

async confirmAccount(token: string) {
  try {
    const decoded = this.jwtService.verify(token, {
      secret: process.env.JWT_SECRET,
    });

    const user = await this.userModel.findById(decoded.sub);
    if (!user) throw new NotFoundException('User not found');

    if (user.isActive) {
      return { message: 'Account already confirmed' };
    }

    if (user.confirmationToken !== token) {
      throw new UnauthorizedException('Invalid confirmation token');
    }

    user.isActive = true;
    // @ts-ignore
    user.confirmationToken = null;
    await user.save();

    return { message: 'Account confirmed successfully' };
  } catch (err) {
    throw new UnauthorizedException('Invalid or expired confirmation token');
  }
}

async login(identifier: string, password: string) {
  // Find user by username OR email
  const user = await this.userModel.findOne({
    $or: [{ username: identifier }, { email: identifier }],
  });

  console.log("my users ",user);

  if (!user) {
    throw new UnauthorizedException('Invalid credentials');
  }

  if (!user.isActive) {
    throw new UnauthorizedException('Please confirm your account first');
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new UnauthorizedException('Invalid credentials');
  }

  const payload = {
    sub: user._id,
    username: user.username,
    email: user.email,
    type: user.type,
  };

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
