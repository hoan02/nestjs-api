import { IsNotEmpty, IsString, IsEmail } from 'class-validator';
import { CreateUserDto } from './user.dto';



export class LoginUserDto {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

export class UserResponseDto {
  id: string;
  email: string;
  username: string;
  fullName?: string;
  role: string;
  profilePicture?: string;
  status?: string;
  phoneNumber?: string;
}

export interface LoginUserRequestDto {
  user: LoginUserDto;
}

export interface NewUserRequestDto {
  user: CreateUserDto;
}
