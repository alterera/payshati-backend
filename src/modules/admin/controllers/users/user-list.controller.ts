import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AdminGuard } from '../../../auth/guards/admin.guard';
import { UserManagementService } from '../../services/user-management.service';
import {
  ListUserDto,
  GetUserDto,
  ParentListSearchDto,
  CreateUserDto,
  UpdateUserDto,
  DeleteUserDto,
  FundUpdateDto,
  ResetPasswordDto,
  ResetPinDto,
} from '../../dto/user-management.dto';

@Controller('v1/admin/users/userlist')
export class UserListController {
  constructor(
    private readonly userManagementService: UserManagementService,
  ) {}

  @Post('list')
  @UseGuards(AdminGuard)
  async listUsers(@Body() dto: ListUserDto) {
    return this.userManagementService.listUsers(
      dto.page,
      dto.limit,
      dto.role_id,
      dto.parent_id,
      dto.status,
      dto.kyc_status,
      dto.search,
    );
  }

  @Post('get')
  @UseGuards(AdminGuard)
  async getUser(@Body() dto: GetUserDto) {
    return this.userManagementService.getUser(dto.id);
  }

  @Post('parent-list')
  @UseGuards(AdminGuard)
  async parentListSearch(@Body() dto: ParentListSearchDto) {
    return this.userManagementService.parentListSearch(dto.search);
  }

  @Post('create')
  @UseGuards(AdminGuard)
  async createUser(@Body() dto: CreateUserDto) {
    return this.userManagementService.createUser(dto);
  }

  @Post('update')
  @UseGuards(AdminGuard)
  async updateUser(@Body() dto: UpdateUserDto) {
    return this.userManagementService.updateUser(dto);
  }

  @Post('delete')
  @UseGuards(AdminGuard)
  async deleteUser(@Body() dto: DeleteUserDto) {
    return this.userManagementService.deleteUser(dto.id);
  }

  @Post('fundupdate')
  @UseGuards(AdminGuard)
  async fundUpdate(@Body() dto: FundUpdateDto, @Request() req: any) {
    const adminUserId = req.user?.id;
    return this.userManagementService.fundUpdate(dto, adminUserId);
  }

  @Post('resetpassword')
  @UseGuards(AdminGuard)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.userManagementService.resetPassword(dto.id);
  }

  @Post('resetPIN')
  @UseGuards(AdminGuard)
  async resetPin(@Body() dto: ResetPinDto) {
    return this.userManagementService.resetPin(dto.id);
  }
}
