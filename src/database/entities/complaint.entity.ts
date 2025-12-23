import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('complaints')
export class Complaint {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'service_id', nullable: true })
  serviceId: number;

  @Column({ name: 'order_id' })
  orderId: string;

  @Column({ name: 'report_id', nullable: true })
  reportId: number;

  @Column({ name: 'request_id', nullable: true })
  requestId: string;

  @Column({ nullable: true })
  subject: string;

  @Column({ nullable: true })
  remark: string;

  @Column({ default: 'Open' })
  status: string;

  @Column({ nullable: true })
  path: string;

  @Column({ name: 'callback_status', nullable: true })
  callbackStatus: number;

  @Column({ name: 'decision_by', nullable: true })
  decisionBy: number;

  @Column({ name: 'decision_remark', nullable: true })
  decisionRemark: string;

  @Column({ name: 'decision_date', nullable: true })
  decisionDate: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
