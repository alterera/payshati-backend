import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { User } from '../../../database/entities/user.entity';
import { Company } from '../../../database/entities/company.entity';
import { ConfigService } from '@nestjs/config';
import { HttpHelper } from '../../../common/helpers/http.helper';
import { SendMessageDto } from '../dto/send-message.dto';

@Injectable()
export class SendMessageService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    private configService: ConfigService,
    private httpHelper: HttpHelper,
  ) {}

  async sendMessage(sendMessageDto: SendMessageDto) {
    let users: User[];

    if (sendMessageDto.user_id && sendMessageDto.user_id !== 0) {
      users = await this.userRepository.find({
        where: {
          id: sendMessageDto.user_id,
          status: 1,
          deletedAt: IsNull(),
        },
        select: ['id', 'firstName', 'emailAddress', 'mobileNumber'],
      });
    } else if (sendMessageDto.role_id) {
      users = await this.userRepository.find({
        where: {
          roleId: sendMessageDto.role_id,
          status: 1,
          deletedAt: IsNull(),
        },
        select: ['id', 'firstName', 'emailAddress', 'mobileNumber'],
      });
    } else {
      users = await this.userRepository.find({
        where: {
          status: 1,
          deletedAt: IsNull(),
        },
        select: ['id', 'firstName', 'emailAddress', 'mobileNumber'],
      });
    }

    if (sendMessageDto.msg_source === 'SMS') {
      const mobiles = users.map((u) => u.mobileNumber).join('|');
      return {
        type: 'success',
        message: 'Mobile numbers prepared',
        data: mobiles,
      };
    } else if (sendMessageDto.msg_source === 'WHATSAPP') {
      const company = await this.companyRepository.findOne({ where: { id: 1 } });
      if (!company || !company.whatsappRequestUrl) {
        return {
          type: 'error',
          message: 'WhatsApp API not configured',
        };
      }

      const mobiles = users.map((u) => {
        let num = u.mobileNumber.replace(/^0+/, '');
        if (!num.startsWith('91')) {
          num = `91${num}`;
        }
        return num;
      }).join('|');

      let url = company.whatsappRequestUrl;
      url = url.replace(/{MOB}/g, mobiles);
      url = url.replace(/{MSG}/g, encodeURIComponent(sendMessageDto.message_text));
      if (sendMessageDto.tmp_id) {
        url = url.replace(/{TMP_ID}/g, sendMessageDto.tmp_id);
      }

      const method = company.whatsappApiMethod || 'GET';

      try {
        await this.httpHelper.curl(
          url,
          method,
          method === 'POST' ? JSON.stringify({ message: sendMessageDto.message_text }) : '',
          {},
          'no',
          'WHATSAPP_BULK',
          `BULK-${Date.now()}`,
        );

        return {
          type: 'success',
          message: 'WhatsApp messages sent successfully',
          data: { count: users.length },
        };
      } catch (error) {
        return {
          type: 'error',
          message: 'Failed to send WhatsApp messages',
        };
      }
    } else if (sendMessageDto.msg_source === 'EMAIL') {
      // Email sending logic would go here
      // For now, return success with email addresses
      const emails = users.map((u) => u.emailAddress);
      return {
        type: 'success',
        message: 'Email addresses prepared',
        data: emails,
      };
    }

    return {
      type: 'error',
      message: 'Invalid message source',
    };
  }
}
