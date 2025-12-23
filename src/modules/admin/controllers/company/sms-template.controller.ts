import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../../../auth/guards/admin.guard';
import { TemplateManagementService } from '../../services/template-management.service';
import {
  ListSmsTemplateDto,
  GetSmsTemplateDto,
  UpdateSmsTemplateDto,
  DeleteSmsTemplateDto,
} from '../../dto/template-management.dto';

@Controller('v1/admin/company/sms-template')
export class SmsTemplateController {
  constructor(
    private readonly templateManagementService: TemplateManagementService,
  ) {}

  @Post('list')
  @UseGuards(AdminGuard)
  async listSmsTemplates(@Body() dto: ListSmsTemplateDto) {
    return this.templateManagementService.listSmsTemplates();
  }

  @Post('get')
  @UseGuards(AdminGuard)
  async getSmsTemplate(@Body() dto: GetSmsTemplateDto) {
    return this.templateManagementService.getSmsTemplate(dto.id);
  }

  @Post('update')
  @UseGuards(AdminGuard)
  async updateSmsTemplate(@Body() dto: UpdateSmsTemplateDto) {
    return this.templateManagementService.updateSmsTemplate(dto);
  }

  @Post('delete')
  @UseGuards(AdminGuard)
  async deleteSmsTemplate(@Body() dto: DeleteSmsTemplateDto) {
    return this.templateManagementService.deleteSmsTemplate(dto.id);
  }
}
