import 'dotenv/config';
import { NestFactory, FastifyAdapter } from '@nestjs/core';
import { AppModule } from 'app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AttachUser } from './guards/user.guard';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, new FastifyAdapter());
    const options = new DocumentBuilder()
        .setTitle('Bistec API')
        .setDescription('Owed payment record keeping for `el bistec`')
        .setVersion('1.0')
        .addBearerAuth('Authorization', 'header')
        .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('explorer', app, document);
    app.useGlobalGuards(new AttachUser());
    app.setGlobalPrefix('api');
    await app.listen(3000);
}
bootstrap();
