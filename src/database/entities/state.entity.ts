import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('states')
export class State {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'state_name' })
  stateName: string;

  @Column({ name: 'plan_api_code', type: 'varchar', nullable: true, length: 255 })
  planApiCode: string | null;

  @Column({ name: 'mplan_state_code', type: 'varchar', nullable: true, length: 255 })
  mplanStateCode: string | null;

  @Column({ default: 1 })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
