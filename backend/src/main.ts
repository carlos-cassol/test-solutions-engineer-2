import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app/app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	// Configuração de CORS
	app.enableCors({
		origin: ['http://localhost:3001', 'http://localhost:3000'],
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
		allowedHeaders: ['Content-Type', 'Authorization'],
		credentials: true,
	});

	// Configuração do Swagger
	const config = new DocumentBuilder()
		.setTitle('Test Radar API')
		.setDescription(
			'API do sistema Test Radar - Monitoramento de processos RIDEC',
		)
		.setVersion('1.0')
		.addTag('Webhooks', 'Endpoints para recebimento de webhooks')
		.addTag('Processes', 'Endpoints para gerenciamento de processos')
		.addTag('AI', 'Endpoints para insights de IA')
		.build();

	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api', app, document, {
		swaggerOptions: {
			persistAuthorization: true,
		},
		customSiteTitle: 'Test Radar API Swagger',
	});

	await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
