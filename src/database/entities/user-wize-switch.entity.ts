import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user_wize_switch')
export class UserWizeSwitch {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'provider_id' })
  providerId: number;

  @Column({ name: 'service_id' })
  serviceId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'state_id' })
  stateId: number;

  @Column({ name: 'api_id' })
  apiId: number;

  @Column({ nullable: true })
  amount: string;

  @Column({ default: 1 })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
