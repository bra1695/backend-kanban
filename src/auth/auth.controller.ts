import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth') // Group under "auth" section in Swagger
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({
    schema: {
      example: {
        name:"johndoe",
        username: 'johndoe',
        email: 'john@example.com',
        password: 'StrongPassword123!',
        address: 'address123',
        postalCode: '1234',
        type:'organization || simple'
      },
    },
  })
  @ApiResponse({ status: 201, description: 'User registered successfully.' })
  @ApiResponse({ status: 400, description: 'Validation failed.' })

  async register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with credentials' })
  @ApiBody({
    schema: {
      example: {
        identifier: 'johndoe||johndoe@example.com',
        password: 'StrongPassword123!',
      },
    },
  })
  @ApiResponse({ status: 200, description: 'User logged in successfully.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  async login(@Body() body) {
    return this.authService.login(body.identifier, body.password);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset link' })
  @ApiBody({
    schema: {
      example: {
        email: 'john@example.com',
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Password reset link sent successfully.' })
  @ApiResponse({ status: 404, description: 'Email not found.' })
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgetPassword(email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset user password using token' })
  @ApiBody({
    schema: {
      example: {
        token: 'abcd1234token',
        password: 'NewStrongPassword!',
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Password reset successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token.' })
  async resetPassword(
    @Body('token') token: string,
    @Body('password') password: string,
  ) {
    return this.authService.resetPassword(token, password);
  }

  @Post('confirm-account')
  @ApiOperation({ summary: 'Confirm user account using token' })
  @ApiBody({
    schema: {
      example: {
        token: 'confirmationToken123',
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Account confirmed successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token.' })
  async confirmAccount(@Body('token') token: string) {
    return this.authService.confirmAccount(token);
  }
}
