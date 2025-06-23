import {
	Controller,
	Post,
	Body,
	HttpStatus,
	HttpException,
} from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { MaintenanceWebhook } from './dto/maintenance-status.dto';

@Controller('webhooks')
export class WebhooksController {
	constructor(private readonly webhooksService: WebhooksService) {}

	@Post('maintenance')
	async handleMaintenanceWebhook(@Body() dto: MaintenanceWebhook) {
		try {
			const result = await this.webhooksService.handleMaintenanceEvent(dto);
			return {
				status: HttpStatus.OK,
				message: 'Event processed successfully',
				data: result,
			};
		} catch (error) {
			throw new HttpException(
				{
					status: HttpStatus.BAD_REQUEST,
					error: error.message,
				},
				HttpStatus.BAD_REQUEST,
			);
		}
	}

	// @Post('financial')
	// async handleFinancialWebhook(@Body() dto: any) {
	// 	return await this.webhooksService.handleFinancialEvent(dto);
	// }

	// @Post('supply')
	// async handleSupplyWebhook(@Body() dto: any) {
	// 	return await this.webhooksService.handleSupplyEvent(dto);
	// }
}
