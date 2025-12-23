import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../../../auth/guards/admin.guard';
import { TemplateManagementService } from '../../services/template-management.service';
import {
  ListEmailTemplateDto,
  GetEmailTemplateDto,
  UpdateEmailTemplateDto,
  DeleteEmailTemplateDto,
} from '../../dto/template-management.dto';

@Controller('v1/admin/company/email-template')
export class EmailTemplateController {
  constructor(
    private readonly templateManagementService: TemplateManagementService,
  ) {}

  @Post('list')
  @UseGuards(AdminGuard)
  async listEmailTemplates(@Body() dto: ListEmailTemplateDto) {
    return this.templateManagementService.listEmailTemplates();
  }

  @Post('get')
  @UseGuards(AdminGuard)
  async getEmailTemplate(@Body() dto: GetEmailTemplateDto) {
    return this.templateManagementService.getEmailTemplate(dto.id);
  }

  @Post('update')
  @UseGuards(AdminGuard)
  async updateEmailTemplate(@Body() dto: UpdateEmailTemplateDto) {
    return this.templateManagementService.updateEmailTemplate(dto);
  }

  @Post('delete')
  @UseGuards(AdminGuard)
  async deleteEmailTemplate(@Body() dto: DeleteEmailTemplateDto) {
    return this.templateManagementService.deleteEmailTemplate(dto.id);
  }
}
