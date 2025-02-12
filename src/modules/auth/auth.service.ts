import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { LoginUserDto, RegisterUserDto } from './_dto/auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user.toObject();
      return result;
    }

    return null;
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.validateUser(
      loginUserDto.email,
      loginUserDto.password,
    );
    if (!user) {
      console.log('401');
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, id: user._id };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    return {
      message: 'Login Success',
      result: true,
      data: {
        user,
        accessToken,
        refreshToken,
      },
    };
  }

  async getCurrentUser(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userService.findOne(payload.id);
      if (!user) {
        throw new UnauthorizedException();
      }

      return {
        message: 'Get user success',
        result: true,
        data: {
          user,
        },
      };
    } catch {
      throw new UnauthorizedException();
    }
  }

  async register(value: RegisterUserDto) {
    // Check if email already exists
    const existingEmail = await this.userService.checkEmail(value.email);
    if (existingEmail) {
      throw new UnauthorizedException('Email already exists');
    }

    // Check if username already exists
    const existingUsername = await this.userService.checkUsername(
      value.username,
    );
    if (existingUsername) {
      throw new UnauthorizedException('Username already exists');
    }

    // Create new user
    const user = await this.userService.create(value);

    // Generate tokens
    const payload = { email: user.email, id: user.id };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    return {
      message: 'Register Success',
      result: true,
      data: {
        user,
        accessToken,
        refreshToken,
      },
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);

      const user = await this.userService.findOne(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const newPayload = { email: user.email, sub: payload.sub };
      const accessToken = this.jwtService.sign(newPayload, {
        expiresIn: '15m',
      });

      return {
        message: 'Refresh token success',
        result: true,
        data: {
          accessToken,
        },
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
