import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('api_state_codes')
export class ApiStateCode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'api_id' })
  apiId: number;

  @Column({ name: 'state_id' })
  stateId: number;

  @Column({ name: 'state_code' })
  stateCode: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
