import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Bank } from '../../../database/entities/bank.entity';
import {
  CreateBankDto,
  UpdateBankDto,
} from '../dto/bank-management.dto';

@Injectable()
export class BankManagementService {
  constructor(
    @InjectRepository(Bank)
    private bankRepository: Repository<Bank>,
  ) {}

  async listBanks(page: number, limit: number, userId: number) {
    const skip = (page - 1) * limit;
    const [banks, total] = await this.bankRepository.findAndCount({
      where: {
        userId,
        deletedAt: IsNull(),
      },
      order: { id: 'DESC' },
      skip,
      take: limit,
    });

    return {
      type: 'success',
      message: 'Banks fetched successfully',
      data: banks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getBank(id: number) {
    const bank = await this.bankRepository.findOne({
      where: { id },
    });

    if (!bank) {
      throw new BadRequestException({
        type: 'error',
        message: 'Bank not found',
      });
    }

    return {
      type: 'success',
      message: 'Bank fetched successfully',
      data: bank,
    };
  }

  async createBank(createBankDto: CreateBankDto, userId: number) {
    const bank = this.bankRepository.create({
      userId,
      bankName: createBankDto.bank_name,
      accountName: createBankDto.account_name,
      accountNumber: createBankDto.account_number,
      bankBranch: createBankDto.bank_branch,
      ifscCode: createBankDto.ifsc_code,
      accountType: createBankDto.account_type,
      bankLogo: createBankDto.bank_logo || 'bank_logo.png',
      status: createBankDto.status,
    });

    const savedBank = await this.bankRepository.save(bank);

    return {
      type: 'success',
      message: 'Bank created successfully',
      data: savedBank,
    };
  }

  async updateBank(updateBankDto: UpdateBankDto) {
    const bank = await this.bankRepository.findOne({
      where: { id: updateBankDto.edit_id },
    });

    if (!bank) {
      throw new BadRequestException({
        type: 'error',
        message: 'Bank not found',
      });
    }

    bank.bankName = updateBankDto.bank_name;
    bank.accountName = updateBankDto.account_name;
    bank.accountNumber = updateBankDto.account_number;
    bank.bankBranch = updateBankDto.bank_branch;
    bank.ifscCode = updateBankDto.ifsc_code;
    bank.accountType = updateBankDto.account_type;
    bank.bankLogo = updateBankDto.bank_logo || updateBankDto.old_bank_logo || bank.bankLogo;
    bank.status = updateBankDto.status;

    const updatedBank = await this.bankRepository.save(bank);

    return {
      type: 'success',
      message: 'Bank updated successfully',
      data: updatedBank,
    };
  }

  async deleteBank(id: number) {
    const bank = await this.bankRepository.findOne({
      where: { id },
    });

    if (!bank) {
      throw new BadRequestException({
        type: 'error',
        message: 'Bank not found',
      });
    }

    await this.bankRepository.update(id, {
      deletedAt: new Date(),
    });

    return {
      type: 'success',
      message: 'Bank deleted successfully',
    };
  }
}
