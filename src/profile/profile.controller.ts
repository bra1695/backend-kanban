import { Controller, Get, Put, Body, Headers, UnauthorizedException, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('profile') // Groups routes under "profile" in Swagger
@ApiBearerAuth() // Shows the lock icon for JWT auth in Swagger
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

@Get()
@ApiOperation({ summary: 'Get user profile information' })
@ApiHeader({
  name: 'Authorization',
  description: 'Bearer JWT token',
  example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
})
@ApiResponse({ status: 200, description: 'Profile retrieved successfully.' })
@ApiResponse({ status: 401, description: 'Unauthorized or invalid token.' })
async getProfile(@Headers('authorization') authHeader: string) {
  // Ensure the header is provided
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedException('Authorization token missing or malformed');
  }

  // Extract the token (remove "Bearer ")
  const token = authHeader.split(' ')[1];

  return this.profileService.getProfile(token);
}

  @Put()
  @ApiOperation({ summary: 'Update user profile information (with image upload to Cloudinary)' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer JWT token',
    example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'John Doe' },
        address: { type: 'string', example: '123 Street, Tunis' },
        postalCode: { type: 'string', example: '1000' },
        phone: { type: 'string', example: '+21612345678' },
        city: { type: 'string', example: 'Tunis' },
        bio: { type: 'string', example: 'Web developer and designer' },
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Profile updated successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized or invalid token.' })
  @UseInterceptors(FileInterceptor('image'))
  async updateProfile(
    @Headers('authorization') authHeader: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization token missing or malformed');
    }

    const token = authHeader.split(' ')[1];
    return this.profileService.updateProfile(token, body, file);
  }

}
