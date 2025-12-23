import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  domain: string;

  @Column({ name: 'company_name', nullable: true })
  companyName: string;

  @Column({ name: 'support_number', nullable: true })
  supportNumber: string;

  @Column({ name: 'support_number_2', nullable: true })
  supportNumber2: string;

  @Column({ name: 'support_email', nullable: true })
  supportEmail: string;

  @Column({ name: 'refund_policy', type: 'text', nullable: true })
  refundPolicy: string;

  @Column({ name: 'terms_and_conditions', type: 'text', nullable: true })
  termsAndConditions: string;

  @Column({ name: 'privacy_policy', type: 'text', nullable: true })
  privacyPolicy: string;

  @Column({ name: 'company_address', nullable: true })
  companyAddress: string;

  @Column({ name: 'email_message', default: 1 })
  emailMessage: number;

  @Column({ name: 'whatsapp_request_url', nullable: true })
  whatsappRequestUrl: string;

  @Column({ name: 'whatsapp_api_method', nullable: true })
  whatsappApiMethod: string;

  @Column({ default: 1 })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
