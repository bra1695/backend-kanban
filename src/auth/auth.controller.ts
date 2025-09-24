import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() body) {
    return this.authService.register(body);
  }

  
  @Post('login')
  async login(@Body() body) {
    return this.authService.login(body.username, body.password);
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgetPassword(email);
  }
}
