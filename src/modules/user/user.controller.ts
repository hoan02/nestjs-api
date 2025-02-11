import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './_dto/user.dto';
import { LoginUserDto, LoginUserRequestDto, NewUserRequestDto, UserResponseDto } from './_dto/auth.dto';
import { UserService } from './user.service';
import { UserTableDto } from './_dto/user-table.dto';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('users')
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.CREATED)
  register(@Body() body: NewUserRequestDto): Promise<UserResponseDto> {
    return this.userService.create(body.user);
  }

  @Post('users/login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginUserRequestDto): Promise<{ user: UserResponseDto }> {
    const user = await this.userService.login(body.user);
    return { user };
  }

  @Post('users/logout')
  @HttpCode(HttpStatus.OK)
  async logout(): Promise<{ message: string }> {
    return this.userService.logout();
  }

  @Get('user')
  @HttpCode(HttpStatus.OK)
  async getCurrentUser(): Promise<{ user: UserResponseDto }> {
    // TODO: Get userId from JWT token
    const userId = '123'; // Temporary hardcoded for testing
    const user = await this.userService.getCurrentUser(userId);
    return { user };
  }

  @Put('user')
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.OK)
  async updateCurrentUser(@Body() body: { user: UpdateUserDto }): Promise<{ user: UserResponseDto }> {
    // TODO: Get userId from JWT token
    const userId = '123'; // Temporary hardcoded for testing
    const user = await this.userService.update(userId, body.user);
    return { user };
  }

  // Admin endpoints
  @Get('users')
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ): Promise<UserTableDto> {
    return this.userService.findAll(page, limit);
  }

  @Get('users/check-username')
  @HttpCode(HttpStatus.OK)
  checkUsername(@Query('username') username: string): Promise<boolean> {
    return this.userService.checkUsername(username);
  }

  @Get('users/check-email')
  @HttpCode(HttpStatus.OK)
  checkEmail(@Query('email') email: string): Promise<boolean> {
    return this.userService.checkEmail(email);
  }

  @Get('users/:id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.userService.findOne(id);
  }

  @Put('users/:id')
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.OK)
  async adminUpdate(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.update(id, updateUserDto);
  }

  @Delete('users/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.userService.delete(id);
  }
}
