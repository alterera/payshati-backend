import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AmountBlock } from '../../../database/entities/amount-block.entity';
import {
  CreateAmountBlockDto,
  UpdateAmountBlockDto,
} from '../dto/amount-block.dto';

@Injectable()
export class AmountBlockService {
  constructor(
    @InjectRepository(AmountBlock)
    private amountBlockRepository: Repository<AmountBlock>,
  ) {}

  async listAmountBlocks(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [blocks, total] = await this.amountBlockRepository.findAndCount({
      order: { id: 'DESC' },
      skip,
      take: limit,
    });

    return {
      type: 'success',
      message: 'Amount blocks fetched successfully',
      data: blocks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAmountBlock(id: number) {
    const block = await this.amountBlockRepository.findOne({
      where: { id },
    });

    if (!block) {
      throw new BadRequestException({
        type: 'error',
        message: 'Amount block not found',
      });
    }

    return {
      type: 'success',
      message: 'Amount block fetched successfully',
      data: block,
    };
  }

  async createAmountBlock(createDto: CreateAmountBlockDto) {
    // Check if already exists
    const existing = await this.amountBlockRepository.findOne({
      where: {
        serviceId: createDto.service_id,
        providerId: createDto.provider_id,
      },
    });

    if (existing) {
      throw new BadRequestException({
        type: 'error',
        message: 'Already added, please edit',
      });
    }

    const block = this.amountBlockRepository.create({
      serviceId: createDto.service_id,
      providerId: createDto.provider_id,
      amount: parseFloat(createDto.amount_block),
      status: createDto.status,
    });

    const savedBlock = await this.amountBlockRepository.save(block);

    return {
      type: 'success',
      message: 'Amount block created successfully',
      data: savedBlock,
    };
  }

  async updateAmountBlock(updateDto: UpdateAmountBlockDto) {
    const block = await this.amountBlockRepository.findOne({
      where: { id: updateDto.edit_id },
    });

    if (!block) {
      throw new BadRequestException({
        type: 'error',
        message: 'Amount block not found',
      });
    }

    block.amount = parseFloat(updateDto.amount_block);
    block.status = updateDto.status;

    const updatedBlock = await this.amountBlockRepository.save(block);

    return {
      type: 'success',
      message: 'Amount block updated successfully',
      data: updatedBlock,
    };
  }

  async deleteAmountBlock(id: number) {
    const block = await this.amountBlockRepository.findOne({
      where: { id },
    });

    if (!block) {
      throw new BadRequestException({
        type: 'error',
        message: 'Amount block not found',
      });
    }

    await this.amountBlockRepository.delete(id);

    return {
      type: 'success',
      message: 'Amount block deleted successfully',
    };
  }
}
