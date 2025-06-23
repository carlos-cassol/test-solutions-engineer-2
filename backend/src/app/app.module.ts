import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { WebhookModule } from '../webhooks/webhooks.module';
import { ProcessesModule } from '../processes/processes.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AiModule } from '../AI/ai.module';
import { EventModule } from '../event/event.module';
import { AlertsModule } from '../alerts/alerts.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		PrismaModule,
		WebhookModule,
		ProcessesModule,
		AiModule,
		EventModule,
		AlertsModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
