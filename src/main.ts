import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PrismaClient } from '@prisma/client';
import { AppModule } from './app.module';


// TODO Check if we can use just that one client
//export var prisma = new PrismaClient();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('NFT management API')
    .setDescription('You can manage your NFTs here')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  
  SwaggerModule.setup('doc', app, document);

  await app.listen(3000);
}

/*async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}*/
bootstrap();
