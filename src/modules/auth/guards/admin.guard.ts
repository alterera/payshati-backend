import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../database/entities/user.entity';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    // Admin authentication - check request body (POST) or headers
    const userId = request.body?.user_id || request.headers['x-user-id'] || request.session?.user_id;
    const loginKey = request.body?.login_key || request.headers['x-login-key'] || request.session?.login_key;

    if (!userId || !loginKey) {
      throw new UnauthorizedException({
        type: 'error',
        message: 'Authentication required',
      });
    }

    const user = await this.userRepository.findOne({
      where: {
        id: parseInt(String(userId), 10),
        loginKey,
        roleId: 1, // Admin role
      },
    });

    if (!user) {
      throw new UnauthorizedException({
        type: 'error',
        message: 'Unauthorized access',
      });
    }

    if (user.status !== 1) {
      throw new UnauthorizedException({
        type: 'error',
        message: 'Account not active',
      });
    }

    request.user = user;
    return true;
  }
}
