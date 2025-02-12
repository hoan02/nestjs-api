import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Headers,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginUserDto,
  RefreshTokenDto,
  RegisterUserDto,
} from './_dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request } from 'express';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('auth/register')
  @HttpCode(HttpStatus.OK)
  async register(@Body() body: RegisterUserDto, @Req() req: Request) {
    return await this.authService.register(body, req);
  }

  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginUserDto, @Req() req: Request) {
    return await this.authService.login(body, req);
  }

  @Post('auth/logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Body() body: RefreshTokenDto): Promise<{ message: string }> {
    await this.authService.logout(body.refreshToken);
    return { message: 'Successfully logged out' };
  }

  @Post('auth/logout-all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logoutAll(
    @Headers('authorization') auth: string,
  ): Promise<{ message: string }> {
    const token = auth?.split(' ')[1];
    const payload = await this.authService.getCurrentUser(token);
    await this.authService.logoutAll(payload.data.user.id);
    return { message: 'Successfully logged out from all devices' };
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getCurrentUser(@Headers('authorization') auth: string) {
    const token = auth?.split(' ')[1];
    return this.authService.getCurrentUser(token);
  }

  @Post('auth/refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() body: RefreshTokenDto, @Req() req: Request) {
    return await this.authService.refresh(body.refreshToken, req);
  }

  @Get('auth/sessions')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getActiveSessions(@Headers('authorization') auth: string) {
    const token = auth?.split(' ')[1];
    const payload = await this.authService.getCurrentUser(token);
    return this.authService.getActiveSessions(payload.data.user.id);
  }
}
