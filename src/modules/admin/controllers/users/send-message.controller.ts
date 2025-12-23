import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../../../auth/guards/admin.guard';
import { SendMessageService } from '../../services/send-message.service';
import { SendMessageDto } from '../../dto/send-message.dto';

@Controller('v1/admin/users/send-message')
export class SendMessageController {
  constructor(
    private readonly sendMessageService: SendMessageService,
  ) {}

  @Post('users')
  @UseGuards(AdminGuard)
  async sendMessageUsers(@Body() dto: SendMessageDto) {
    return this.sendMessageService.sendMessage(dto);
  }
}
