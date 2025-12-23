import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Role } from '../../../database/entities/role.entity';

@Injectable()
export class RoleManagementService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async listRoles() {
    const roles = await this.roleRepository.find({
      where: {
        slug: Not('superadmin'),
      },
      order: { id: 'DESC' },
    });

    return {
      type: 'success',
      message: 'Roles fetched successfully',
      data: roles,
    };
  }
}
