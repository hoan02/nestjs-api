import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto, RefreshTokenDto, RegisterUserDto } from './_dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('auth/register')
  @HttpCode(HttpStatus.OK)
  async register(@Body() body: RegisterUserDto) {
    return await this.authService.register(body);
  }

  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginUserDto) {
    return await this.authService.login(body);
  }

  @Post('auth/logout')
  @HttpCode(HttpStatus.OK)
  async logout(): Promise<{ message: string }> {
    return { message: 'Successfully logged out' };
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getCurrentUser(@Headers('authorization') auth: string) {
    // Extract token from Bearer token
    const token = auth?.split(' ')[1];
    return this.authService.getCurrentUser(token);
  }

  @Post('auth/refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() body: RefreshTokenDto) {
    return await this.authService.refresh(body.refreshToken);
  }
}
