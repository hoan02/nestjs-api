import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { DelayInterceptor } from './interceptors/delay.interceptor';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  // app.useGlobalInterceptors(new DelayInterceptor());
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const config = app.get<ConfigService>(ConfigService);

  const port: number = config.get<number>('PORT');

  const options = new DocumentBuilder()
    .setTitle('Nestjs-api Documentation')
    .setDescription('This is the documentation for Nestjs-api')
    .setVersion('1.0')
    // .addTag('Nestjs-api')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, options);

  SwaggerModule.setup('docs', app, documentFactory);

  await app.listen(port);
  Logger.log(`server listening on port ${port}`);
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
