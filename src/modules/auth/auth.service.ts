import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { LoginUserDto, RegisterUserDto } from './_dto/auth.dto';
import { RefreshTokenService } from '../refresh-token/refresh-token.service';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private refreshTokenService: RefreshTokenService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        profilePicture: user.profilePicture,
        status: user.status,
        phoneNumber: user.phoneNumber,
      };
    }
    return null;
  }

  async login(loginUserDto: LoginUserDto, req: Request) {
    const user = await this.validateUser(
      loginUserDto.email,
      loginUserDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, id: user.id };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('ACCESS_TOKEN_EXPIRATION'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRATION'),
    });

    // Lưu refresh token vào database
    await this.refreshTokenService.createRefreshToken(
      user.id.toString(),
      refreshToken,
      this.configService.get<number>('REFRESH_TOKEN_EXPIRATION_SEC'),
      req,
    );

    // Thiết lập refresh token dưới dạng cookie
    req.res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === 'production', // Chỉ sử dụng cookie an toàn trong môi trường sản xuất
      secure: false, // Chỉ sử dụng cookie an toàn trong môi trường sản xuất
      sameSite: 'none', // Cho phép cookie hoạt động với các domain khác nhau
      maxAge:
        this.configService.get<number>('REFRESH_TOKEN_EXPIRATION_SEC') * 1000, // Thời gian sống của cookie
    });

    return {
      message: 'Login Success',
      result: true,
      data: {
        user,
        accessToken,
      },
    };
  }

  async register(value: RegisterUserDto, req: Request) {
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
      expiresIn: this.configService.get<string>('ACCESS_TOKEN_EXPIRATION'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRATION'),
    });

    // Lưu refresh token vào database
    await this.refreshTokenService.createRefreshToken(
      user.id.toString(),
      refreshToken,
      this.configService.get<number>('REFRESH_TOKEN_EXPIRATION_SEC'),
      req,
    );

    // Thiết lập refresh token dưới dạng cookie
    req.res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Chỉ sử dụng cookie an toàn trong môi trường sản xuất
      maxAge:
        this.configService.get<number>('REFRESH_TOKEN_EXPIRATION_SEC') * 1000, // Thời gian sống của cookie
    });

    return {
      message: 'Register Success',
      result: true,
      data: {
        user,
        accessToken,
      },
    };
  }

  async refresh(refreshToken: string, req: Request) {
    try {
      // Kiểm tra refresh token có tồn tại và hợp lệ trong database không
      const storedToken =
        await this.refreshTokenService.findByToken(refreshToken);
      if (!storedToken || !storedToken.isValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const payload = this.jwtService.verify(refreshToken);
      const user = await this.userService.findOne(payload.id);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const newPayload = { email: user.email, id: user.id };
      const accessToken = this.jwtService.sign(newPayload, {
        expiresIn: this.configService.get<string>('ACCESS_TOKEN_EXPIRATION'),
      });

      // Cập nhật thời gian sử dụng cuối cùng của refresh token
      await this.refreshTokenService.updateLastUsed(refreshToken);

      // Thiết lập refresh token mới dưới dạng cookie
      req.res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Chỉ sử dụng cookie an toàn trong môi trường sản xuất
        maxAge:
          this.configService.get<number>('REFRESH_TOKEN_EXPIRATION_SEC') * 1000, // Thời gian sống của cookie
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

  async logout(refreshToken: string, req: Request): Promise<void> {
    await this.refreshTokenService.invalidateToken(refreshToken);
    // Xóa cookie refreshToken
    req.res.clearCookie('refreshToken');
  }

  async logoutAll(userId: string, req: Request): Promise<void> {
    await this.refreshTokenService.invalidateAllUserTokens(userId);
    // Xóa cookie refreshToken
    req.res.clearCookie('refreshToken');
  }

  async getActiveSessions(userId: string) {
    const sessions =
      await this.refreshTokenService.getUserActiveSessions(userId);
    return {
      message: 'Get active sessions success',
      result: true,
      data: {
        sessions,
      },
    };
  }
}
