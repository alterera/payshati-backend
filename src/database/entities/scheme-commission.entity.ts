import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('scheme_commissions')
export class SchemeCommission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'scheme_id' })
  schemeId: number;

  @Column({ name: 'provider_id' })
  providerId: number;

  @Column({ name: 'rt_amount_type', nullable: true })
  rtAmountType: string;

  @Column({ name: 'rt_amount_value', type: 'decimal', precision: 10, scale: 2, nullable: true })
  rtAmountValue: number;

  @Column({ name: 'dt_amount_type', nullable: true })
  dtAmountType: string;

  @Column({ name: 'dt_amount_value', type: 'decimal', precision: 10, scale: 2, nullable: true })
  dtAmountValue: number;

  @Column({ name: 'md_amount_type', nullable: true })
  mdAmountType: string;

  @Column({ name: 'md_amount_value', type: 'decimal', precision: 10, scale: 2, nullable: true })
  mdAmountValue: number;

  @Column({ name: 'wt_amount_type', nullable: true })
  wtAmountType: string;

  @Column({ name: 'wt_amount_value', type: 'decimal', precision: 10, scale: 2, nullable: true })
  wtAmountValue: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
