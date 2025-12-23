import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user_register_otp')
export class UserRegisterOtp {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'mobile_number' })
  mobileNumber: string;

  @Column({ name: 'email_address' })
  emailAddress: string;

  @Column({ name: 'outlet_name', nullable: true })
  outletName: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ nullable: true })
  city: string;

  @Column()
  otp: string;

  @Column()
  token: string;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
