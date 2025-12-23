import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Scheme } from '../../../database/entities/scheme.entity';
import { SchemeCommission } from '../../../database/entities/scheme-commission.entity';
import { Provider } from '../../../database/entities/provider.entity';
import {
  CreateSchemeDto,
  UpdateSchemeDto,
  GetCommissionDataDto,
  SingleUpdateCommissionDto,
  BulkUpdateCommissionDto,
} from '../dto/scheme-management.dto';

@Injectable()
export class SchemeManagementService {
  constructor(
    @InjectRepository(Scheme)
    private schemeRepository: Repository<Scheme>,
    @InjectRepository(SchemeCommission)
    private schemeCommissionRepository: Repository<SchemeCommission>,
    @InjectRepository(Provider)
    private providerRepository: Repository<Provider>,
  ) {}

  async listSchemes(page: number, limit: number) {
    const skip = (page - 1) * limit;
    // Laravel uses deleted_at != 1 (numeric flag), TypeORM uses Date | null
    // For compatibility, check if deletedAt is null (not deleted)
    const [schemes, total] = await this.schemeRepository.findAndCount({
      where: { deletedAt: IsNull() },
      order: { id: 'DESC' },
      skip,
      take: limit,
    });

    return {
      type: 'success',
      message: 'Schemes fetched successfully',
      data: {
      data: schemes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  async getScheme(id: number) {
    const scheme = await this.schemeRepository.findOne({
      where: { id },
    });

    if (!scheme) {
      throw new BadRequestException({
        type: 'error',
        message: 'Scheme not found',
      });
    }

    return {
      type: 'success',
      message: 'Scheme fetched successfully',
      data: scheme,
    };
  }

  async createScheme(createSchemeDto: CreateSchemeDto) {
    const scheme = this.schemeRepository.create({
      schemeName: createSchemeDto.schemeName,
      status: createSchemeDto.status,
    });

    const savedScheme = await this.schemeRepository.save(scheme);

    return {
      type: 'success',
      message: 'Scheme created successfully',
      data: savedScheme,
    };
  }

  async updateScheme(updateSchemeDto: UpdateSchemeDto) {
    const scheme = await this.schemeRepository.findOne({
      where: { id: updateSchemeDto.edit_id },
    });

    if (!scheme) {
      throw new BadRequestException({
        type: 'error',
        message: 'Scheme not found',
      });
    }

    scheme.schemeName = updateSchemeDto.schemeName;
    scheme.status = updateSchemeDto.status;

    const updatedScheme = await this.schemeRepository.save(scheme);

    return {
      type: 'success',
      message: 'Scheme updated successfully',
      data: updatedScheme,
    };
  }

  async deleteScheme(id: number) {
    const scheme = await this.schemeRepository.findOne({
      where: { id },
    });

    if (!scheme) {
      throw new BadRequestException({
        type: 'error',
        message: 'Scheme not found',
      });
    }

    // Laravel uses deleted_at = 1 for soft delete
    // We'll use Date timestamp for TypeORM compatibility
    await this.schemeRepository.update(id, {
      deletedAt: new Date(),
    });

    return {
      type: 'success',
      message: 'Scheme deleted successfully',
    };
  }

  async getCommissionData(getCommissionDataDto: GetCommissionDataDto) {
    const providers = await this.providerRepository.find({
      where: {
        serviceId: getCommissionDataDto.service,
        status: 1,
        deletedAt: IsNull(),
      },
    });

    const providersWithCommissions = await Promise.all(
      providers.map(async (provider) => {
        const commission = await this.schemeCommissionRepository.findOne({
          where: {
            providerId: provider.id,
            schemeId: getCommissionDataDto.id,
          },
        });

        return {
          id: provider.id,
          provider_name: provider.providerName,
          wt_amount_type: commission?.wtAmountType || '',
          wt_amount_value: commission?.wtAmountValue || 0,
          md_amount_type: commission?.mdAmountType || '',
          md_amount_value: commission?.mdAmountValue || 0,
          dt_amount_type: commission?.dtAmountType || '',
          dt_amount_value: commission?.dtAmountValue || 0,
          rt_amount_type: commission?.rtAmountType || '',
          rt_amount_value: commission?.rtAmountValue || 0,
        };
      }),
    );

    return {
      type: 'success',
      message: 'Commission data fetched successfully',
      data: providersWithCommissions,
    };
  }

  async singleUpdateCommission(dto: SingleUpdateCommissionDto) {
    await this.schemeCommissionRepository.upsert(
      {
        schemeId: dto.scheme_id,
        providerId: dto.provider_id,
        wtAmountType: dto.wt_comtype,
        wtAmountValue: parseFloat(dto.wt_value),
        mdAmountType: dto.md_comtype,
        mdAmountValue: parseFloat(dto.md_value),
        dtAmountType: dto.dt_comtype,
        dtAmountValue: parseFloat(dto.dt_value),
        rtAmountType: dto.rt_comtype,
        rtAmountValue: parseFloat(dto.rt_value),
      },
      ['schemeId', 'providerId'],
    );

    return {
      type: 'success',
      message: 'Commission updated successfully',
    };
  }

  async bulkUpdateCommission(dto: BulkUpdateCommissionDto) {
    for (let i = 0; i < dto.provider_id.length; i++) {
      await this.schemeCommissionRepository.upsert(
        {
          schemeId: dto.scheme_id,
          providerId: dto.provider_id[i],
          wtAmountType: dto.wt_comtype[i],
          wtAmountValue: parseFloat(dto.wt_value[i]),
          mdAmountType: dto.md_comtype[i],
          mdAmountValue: parseFloat(dto.md_value[i]),
          dtAmountType: dto.dt_comtype[i],
          dtAmountValue: parseFloat(dto.dt_value[i]),
          rtAmountType: dto.rt_comtype[i],
          rtAmountValue: parseFloat(dto.rt_value[i]),
        },
        ['schemeId', 'providerId'],
      );
    }

    return {
      type: 'success',
      message: 'Commissions updated successfully',
    };
  }
}
