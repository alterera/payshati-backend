import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailTemplate } from '../../../database/entities/email-template.entity';
import { SmsTemplate } from '../../../database/entities/sms-template.entity';
import {
  UpdateEmailTemplateDto,
  DeleteEmailTemplateDto,
  UpdateSmsTemplateDto,
  DeleteSmsTemplateDto,
} from '../dto/template-management.dto';

@Injectable()
export class TemplateManagementService {
  constructor(
    @InjectRepository(EmailTemplate)
    private emailTemplateRepository: Repository<EmailTemplate>,
    @InjectRepository(SmsTemplate)
    private smsTemplateRepository: Repository<SmsTemplate>,
  ) {}

  // Email Template methods
  async listEmailTemplates() {
    const templates = await this.emailTemplateRepository.find({
      order: { id: 'DESC' },
    });

    return {
      type: 'success',
      message: 'Email templates fetched successfully',
      data: templates,
    };
  }

  async getEmailTemplate(id: number) {
    const template = await this.emailTemplateRepository.findOne({
      where: { id },
    });

    if (!template) {
      throw new BadRequestException({
        type: 'error',
        message: 'Email template not found',
      });
    }

    return {
      type: 'success',
      message: 'Email template fetched successfully',
      data: template,
    };
  }

  async updateEmailTemplate(updateDto: UpdateEmailTemplateDto) {
    if (updateDto.edit_id === 0) {
      throw new BadRequestException({
        type: 'error',
        message: 'Server down',
      });
    }

    const template = await this.emailTemplateRepository.findOne({
      where: { id: updateDto.edit_id },
    });

    if (!template) {
      throw new BadRequestException({
        type: 'error',
        message: 'Email template not found',
      });
    }

    template.slug = updateDto.slug;
    template.subject = updateDto.subject;
    template.content = updateDto.content;
    template.status = updateDto.status;

    const updated = await this.emailTemplateRepository.save(template);

    return {
      type: 'success',
      message: 'Email template updated successfully',
      data: updated,
    };
  }

  async deleteEmailTemplate(id: number) {
    await this.emailTemplateRepository.delete(id);

    return {
      type: 'success',
      message: 'Email template deleted successfully',
    };
  }

  // SMS Template methods
  async listSmsTemplates() {
    const templates = await this.smsTemplateRepository.find({
      order: { id: 'DESC' },
    });

    return {
      type: 'success',
      message: 'SMS templates fetched successfully',
      data: templates,
    };
  }

  async getSmsTemplate(id: number) {
    const template = await this.smsTemplateRepository.findOne({
      where: { id },
    });

    if (!template) {
      throw new BadRequestException({
        type: 'error',
        message: 'SMS template not found',
      });
    }

    return {
      type: 'success',
      message: 'SMS template fetched successfully',
      data: template,
    };
  }

  async updateSmsTemplate(updateDto: UpdateSmsTemplateDto) {
    if (updateDto.edit_id === 0) {
      throw new BadRequestException({
        type: 'error',
        message: 'Server down',
      });
    }

    const template = await this.smsTemplateRepository.findOne({
      where: { id: updateDto.edit_id },
    });

    if (!template) {
      throw new BadRequestException({
        type: 'error',
        message: 'SMS template not found',
      });
    }

    template.slug = updateDto.slug;
    template.templateId = updateDto.template_id;
    template.content = updateDto.content;
    template.status = updateDto.status;

    const updated = await this.smsTemplateRepository.save(template);

    return {
      type: 'success',
      message: 'SMS template updated successfully',
      data: updated,
    };
  }

  async deleteSmsTemplate(id: number) {
    await this.smsTemplateRepository.delete(id);

    return {
      type: 'success',
      message: 'SMS template deleted successfully',
    };
  }
}
