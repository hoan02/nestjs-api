import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

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
}
bootstrap();
