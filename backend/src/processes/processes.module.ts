import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProcessesController } from './processes.controller';
import { ProcessesService } from './processes.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AiModule } from 'src/AI/ai.module';
import { EventModule } from 'src/event/event.module';
import { AlertsModule } from 'src/alerts/alerts.module';

@Module({
	imports: [PrismaModule, ConfigModule, AiModule, EventModule, AlertsModule],
	controllers: [ProcessesController],
	providers: [ProcessesService],
	exports: [ProcessesService],
})
export class ProcessesModule {}
