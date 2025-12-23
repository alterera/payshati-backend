import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('api_provider_codes')
export class ApiProviderCode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'api_id' })
  apiId: number;

  @Column({ name: 'provider_id' })
  providerId: number;

  @Column({ name: 'provider_code' })
  providerCode: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
