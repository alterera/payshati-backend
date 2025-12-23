import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Company } from '../../../database/entities/company.entity';
import { UpdateCompanyDto } from '../dto/company-management.dto';

@Injectable()
export class CompanyManagementService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {}

  async listCompanies(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [companies, total] = await this.companyRepository.findAndCount({
      order: { id: 'DESC' },
      skip,
      take: limit,
    });

    return {
      type: 'success',
      message: 'Companies fetched successfully',
      data: companies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getCompany(id: number) {
    const company = await this.companyRepository.findOne({
      where: { id },
    });

    if (!company) {
      throw new BadRequestException({
        type: 'error',
        message: 'Company not found',
      });
    }

    return {
      type: 'success',
      message: 'Company fetched successfully',
      data: company,
    };
  }

  async updateCompany(updateDto: UpdateCompanyDto) {
    if (updateDto.edit_id === 0) {
      throw new BadRequestException({
        type: 'error',
        message: 'Not allowed',
      });
    }

    const company = await this.companyRepository.findOne({
      where: { id: updateDto.edit_id },
    });

    if (!company) {
      throw new BadRequestException({
        type: 'error',
        message: 'Company not found',
      });
    }

    company.domain = updateDto.domain || company.domain;
    company.companyName = updateDto.company_name;
    company.supportNumber = updateDto.support_number;
    company.supportNumber2 = updateDto.support_number_2 || company.supportNumber2;
    company.supportEmail = updateDto.support_email;
    company.companyAddress = updateDto.company_address;
    company.emailMessage = updateDto.email_message ?? company.emailMessage;
    company.refundPolicy = updateDto.refund_policy;
    company.privacyPolicy = updateDto.privacy_policy;
    company.termsAndConditions = updateDto.terms_and_conditions;
    company.whatsappRequestUrl = updateDto.whatsapp_request_url;
    company.whatsappApiMethod = updateDto.whatsapp_api_method;
    // Note: sms_request_url and sms_api_method would need to be added to Company entity if they exist in DB

    const updated = await this.companyRepository.save(company);

    return {
      type: 'success',
      message: 'Company updated successfully',
      data: updated,
    };
  }
}
