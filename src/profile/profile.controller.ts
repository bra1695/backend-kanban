import { Controller, Get, Put, Body, Headers } from '@nestjs/common';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  async getProfile(@Headers('authorization') authHeader: string) {
    const token = authHeader?.split(' ')[1];
    return this.profileService.getProfile(token);
  }

  @Put()
  async updateProfile(
    @Headers('authorization') authHeader: string,
    @Body() body: any,
  ) {
    const token = authHeader?.split(' ')[1];
    return this.profileService.updateProfile(token, body);
  }
}
