import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
	providers: [EventService],
	exports: [EventService],
	imports: [PrismaModule],
})
export class EventModule {}
