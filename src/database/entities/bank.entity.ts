import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('banks')
export class Bank {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'bank_name' })
  bankName: string;

  @Column({ name: 'account_name' })
  accountName: string;

  @Column({ name: 'account_number' })
  accountNumber: string;

  @Column({ name: 'bank_branch' })
  bankBranch: string;

  @Column({ name: 'ifsc_code' })
  ifscCode: string;

  @Column({ name: 'account_type' })
  accountType: string;

  @Column({ name: 'bank_logo', nullable: true })
  bankLogo: string;

  @Column({ default: 1 })
  status: number;

  @Column({ name: 'deleted_at', nullable: true })
  deletedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
