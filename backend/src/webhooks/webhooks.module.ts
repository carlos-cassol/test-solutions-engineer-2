import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { ProcessesModule } from '../processes/processes.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
	imports: [ProcessesModule, PrismaModule],
	controllers: [WebhooksController],
	providers: [WebhooksService],
	exports: [WebhooksService],
})
export class WebhookModule {}
