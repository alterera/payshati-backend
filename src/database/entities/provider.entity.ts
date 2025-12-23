import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('providers')
export class Provider {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'provider_name' })
  providerName: string;

  @Column({ name: 'provider_logo', nullable: true })
  providerLogo: string;

  @Column({ name: 'service_id' })
  serviceId: number;

  @Column({ name: 'api_id', nullable: true })
  apiId: number;

  @Column({ name: 'backup_api_id', nullable: true, default: 0 })
  backupApiId: number;

  @Column({ name: 'backup_api2_id', nullable: true, default: 0 })
  backupApi2Id: number;

  @Column({ name: 'backup_api3_id', nullable: true, default: 0 })
  backupApi3Id: number;

  @Column({ default: 1 })
  status: number;

  @Column({ name: 'deleted_at', nullable: true })
  deletedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
