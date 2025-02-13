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
  UseGuards,
  Request
} from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './_dto/user.dto';
import { UserResponseDto } from '../auth/_dto/auth.dto';
import { UserService } from './user.service';
import { UserTableDto } from './_dto/user-table.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}


  @Post('users')
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.userService.create(createUserDto);
  }

  @Put('user')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.OK)
  async updateCurrentUser(
    @Request() req,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<UserResponseDto> {
    return this.userService.update(req.user.id, updateUserDto);
  }

  // Admin endpoints
  @Get('users')
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.userService.findOne(id);
  }

  @Put('users/:id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.OK)
  async adminUpdate(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.update(id, updateUserDto);
  }

  @Delete('users/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.userService.delete(id);
  }
}
