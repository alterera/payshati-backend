import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Provider } from './provider.entity';
import { Api } from './api.entity';
import { Service } from './service.entity';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'parent__Id', nullable: true })
  parentId: number;

  @Column({ name: 'credit_user_id', nullable: true })
  creditUserId: number;

  @Column({ name: 'debit_user_id', nullable: true })
  debitUserId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ name: 'admin_commission', type: 'decimal', precision: 10, scale: 2, nullable: true })
  adminCommission: number;

  @Column({ name: 'api_commission', type: 'decimal', precision: 10, scale: 2, nullable: true })
  apiCommission: number;

  @Column({ name: 'commission', type: 'decimal', precision: 10, scale: 2, nullable: true, default: 0 })
  commission: number;

  @Column({ name: 'dt_commission', type: 'decimal', precision: 10, scale: 2, nullable: true })
  dtCommission: number;

  @Column({ name: 'md_commission', type: 'decimal', precision: 10, scale: 2, nullable: true })
  mdCommission: number;

  @Column({ name: 'wt_commission', type: 'decimal', precision: 10, scale: 2, nullable: true })
  wtCommission: number;

  @Column({ name: 'fund_type', nullable: true })
  fundType: string;

  @Column({ name: 'transaction_type' })
  transactionType: string;

  @Column({ name: 'provider_id', nullable: true })
  providerId: number;

  @ManyToOne(() => Provider, { nullable: true })
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;

  @Column({ name: 'service_id', nullable: true })
  serviceId: number;

  @ManyToOne(() => Service, { nullable: true })
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @Column({ name: 'api_id', nullable: true })
  apiId: number;

  @ManyToOne(() => Api, { nullable: true })
  @JoinColumn({ name: 'api_id' })
  api: Api;

  @Column({ name: 'state_id', nullable: true })
  stateId: number;

  @Column({ nullable: true })
  number: string;

  @Column({ nullable: true })
  remark: string;

  @Column()
  status: string;

  @Column({ name: 'callback_status', nullable: true })
  callbackStatus: number;

  @Column({ name: 'operator_id', nullable: true })
  operatorId: string;

  @Column({ name: 'api_operator_id', nullable: true })
  apiOperatorId: string;

  @Column({ name: 'api_partner_order_id', nullable: true })
  apiPartnerOrderId: string;

  @Column({ name: 'order_id' })
  orderId: string;

  @Column({ nullable: true })
  path: string;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ name: 'opening_balance', type: 'decimal', precision: 10, scale: 2, nullable: true })
  openingBalance: number;

  @Column({ name: 'closing_balance', type: 'decimal', precision: 10, scale: 2, nullable: true })
  closingBalance: number;

  @Column({ name: 'transaction_date', nullable: true })
  transactionDate: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
