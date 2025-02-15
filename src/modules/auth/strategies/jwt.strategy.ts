import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private userService: UserService,
    private configService: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('SECRET_KEY'),
    });
  }

  async validate(payload: any) {
    // console.log('\n=== JWT Strategy Validate ===');
    // console.log('Incoming payload:', payload);
    
    // Verify user exists in database
    const user = await this.userService.findOne(payload.id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    
    // Return user info from database to ensure up-to-date role
    const result = {
      id: user.id,
      email: user.email,
      role: user.role || 'user' // Fallback to 'user' if role is missing
    };
    
    // console.log('Returning user:', result);
    return result;
  }
}
