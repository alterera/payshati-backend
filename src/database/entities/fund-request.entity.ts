import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('fund_requests')
export class FundRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'request_to', default: 1 })
  requestTo: number;

  @Column({ name: 'order_id', nullable: true })
  orderId: string;

  @Column({ name: 'request_date', nullable: true })
  requestDate: string;

  @Column({ name: 'bank_id', nullable: true })
  bankId: number;

  @Column({ name: 'amount', type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ name: 'transfer_mode', nullable: true })
  transferMode: string;

  @Column({ name: 'transaction_number', nullable: true })
  transactionNumber: string;

  @Column({ name: 'slip_image', nullable: true })
  slipImage: string;

  @Column({ nullable: true })
  remark: string;

  @Column({ name: 'decision_by', nullable: true })
  decisionBy: number;

  @Column({ name: 'decision_remark', nullable: true })
  decisionRemark: string;

  @Column({ name: 'decision_date', nullable: true })
  decisionDate: string;

  @Column({ nullable: true })
  status: string;

  @Column({ nullable: true })
  upi: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
