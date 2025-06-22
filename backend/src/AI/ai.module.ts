import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { EventModule } from '../event/event.module';

@Module({
	imports: [ConfigModule, PrismaModule, EventModule],
	providers: [AiService],
	exports: [AiService],
})
export class AiModule {}
