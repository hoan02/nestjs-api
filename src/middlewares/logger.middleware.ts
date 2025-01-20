import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('RequestLogger');

  use(req: Request, res: Response, next: NextFunction) {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    this.logger.log(`${req.method} ${req.originalUrl} - IP: ${ip}`);

    next();
  }
}
