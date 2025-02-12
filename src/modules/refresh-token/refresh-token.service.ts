import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  RefreshToken,
  RefreshTokenDocument,
} from '../../schemas/refresh-token';
import { Request } from 'express';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UAParser } from 'ua-parser-js';

const MAX_ACTIVE_SESSIONS = 5; // Giới hạn số phiên đăng nhập đồng thời

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshTokenDocument>,
  ) {}

  private getDeviceInfo(req: Request): any {
    const parser = new UAParser(req.headers['user-agent']);
    const device = parser.getDevice();
    const os = parser.getOS();
    const browser = parser.getBrowser();

    return {
      deviceType: device.type || 'unknown',
      deviceModel: device.model || 'unknown',
      deviceVendor: device.vendor || 'unknown',
      osName: os.name || 'unknown',
      osVersion: os.version || 'unknown',
      browserName: browser.name || 'unknown',
      browserVersion: browser.version || 'unknown',
      ip: req.ip,
    };
  }

  async createRefreshToken(
    userId: string,
    token: string,
    expiresIn: number,
    req: Request,
  ): Promise<RefreshToken> {
    // Kiểm tra số lượng phiên đang hoạt động
    const activeSessions = await this.getUserActiveSessions(userId);
    if (activeSessions.length >= MAX_ACTIVE_SESSIONS) {
      // Tự động vô hiệu hóa token cũ nhất
      const oldestSession = activeSessions[activeSessions.length - 1];
      await this.invalidateToken(oldestSession.token);
    }

    const deviceInfo = this.getDeviceInfo(req);
    const expiresAt = new Date();
    expiresAt.setTime(expiresAt.getTime() + expiresIn * 1000);

    const refreshToken = new this.refreshTokenModel({
      userId,
      token,
      expiresAt,
      deviceInfo: JSON.stringify(deviceInfo),
      ipAddress: deviceInfo.ip,
      lastUsedAt: new Date(),
    });

    return refreshToken.save();
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    return this.refreshTokenModel.findOne({ token, isValid: true }).exec();
  }

  async invalidateToken(token: string): Promise<void> {
    await this.refreshTokenModel
      .updateOne({ token }, { isValid: false })
      .exec();
  }

  async invalidateAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokenModel
      .updateMany({ userId }, { isValid: false })
      .exec();
  }

  async getUserActiveSessions(userId: string): Promise<RefreshToken[]> {
    return this.refreshTokenModel
      .find({
        userId,
        isValid: true,
        expiresAt: { $gt: new Date() },
      })
      .sort({ lastUsedAt: -1 }) // Sắp xếp theo thời gian sử dụng gần nhất
      .exec();
  }

  async updateLastUsed(token: string): Promise<void> {
    await this.refreshTokenModel
      .updateOne({ token }, { lastUsedAt: new Date() })
      .exec();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupExpiredTokens(): Promise<void> {
    const result = await this.refreshTokenModel
      .deleteMany({
        $or: [{ expiresAt: { $lt: new Date() } }, { isValid: false }],
      })
      .exec();

    console.log(`Cleaned up ${result.deletedCount} expired/invalid tokens`);
  }

  async getSessionDetails(token: string): Promise<any> {
    const session = await this.refreshTokenModel.findOne({ token }).exec();
    if (!session) {
      throw new UnauthorizedException('Session not found');
    }

    const deviceInfo = JSON.parse(session.deviceInfo);
    return {
      deviceType: deviceInfo.deviceType,
      deviceModel: deviceInfo.deviceModel,
      deviceVendor: deviceInfo.deviceVendor,
      osName: deviceInfo.osName,
      osVersion: deviceInfo.osVersion,
      browserName: deviceInfo.browserName,
      browserVersion: deviceInfo.browserVersion,
      ip: deviceInfo.ip,
      lastUsedAt: session.lastUsedAt,
      // createdAt: session.createdAt,
    };
  }
}
