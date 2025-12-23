import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('routes_settings')
export class RouteSetting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'route_code' })
  routeCode: string;

  @Column()
  priority: number;

  @Column({ default: 1 })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
