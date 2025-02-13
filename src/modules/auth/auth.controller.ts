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
  UnauthorizedException,
  Query,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { LoginUserDto, RegisterUserDto } from './_dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request } from 'express';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

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
  async logout(@Req() req: Request): Promise<{ message: string }> {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }
    await this.authService.logout(refreshToken, req);
    return { message: 'Successfully logged out' };
  }

  @Post('auth/logout-all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logoutAll(
    @Headers('authorization') auth: string,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    const token = auth?.split(' ')[1];
    const decoded = this.jwtService.verify(token);
    await this.authService.logoutAll(decoded.id, req);
    return { message: 'Successfully logged out from all devices' };
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getCurrentUser(@Headers('authorization') auth: string) {
    const token = auth?.split(' ')[1];
    const decoded = this.jwtService.verify(token);
    const user = await this.userService.findOne(decoded.id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return {
      message: 'Get user success',
      result: true,
      data: {
        user,
      },
    };
  }

  @Get('auth/refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request) {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }
    return await this.authService.refresh(refreshToken, req);
  }

  @Get('auth/sessions')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getActiveSessions(@Headers('authorization') auth: string) {
    const token = auth?.split(' ')[1];
    const decoded = this.jwtService.verify(token);
    const user = await this.userService.findOne(decoded.id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.authService.getActiveSessions(user.id);
  }

  @Get('auth/check-username')
  @HttpCode(HttpStatus.OK)
  async checkUsername(@Query('username') username: string) {
    const exists = await this.userService.checkUsername(username);
    return {
      result: true,
      data: {
        exists
      }
    };
  }

  @Get('auth/check-email') 
  @HttpCode(HttpStatus.OK)
  async checkEmail(@Query('email') email: string) {
    const exists = await this.userService.checkEmail(email);
    return {
      result: true,
      data: {
        exists
      }
    };
  }
}
