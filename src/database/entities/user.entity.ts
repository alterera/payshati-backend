import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Report } from './report.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'parent_id', default: 0 })
  parentId: number;

  @Column({ name: 'role_id' })
  roleId: number;

  @Column({ name: 'scheme_id', default: 1 })
  schemeId: number;

  @Column({ name: 'outlet_name', nullable: true })
  outletName: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'middle_name', nullable: true })
  middleName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ name: 'date_of_birth', nullable: true })
  dateOfBirth: string;

  @Column({ name: 'mobile_number', unique: true })
  mobileNumber: string;

  @Column({ name: 'email_address', unique: true })
  emailAddress: string;

  @Column()
  password: string;

  @Column({ name: 't_pin', nullable: true })
  tPin: string;

  @Column({ name: 'login_key', nullable: true })
  loginKey: string;

  @Column({ name: 'api_key', nullable: true })
  apiKey: string;

  @Column({ name: 'login_type', default: 'Password' })
  loginType: string;

  @Column({ name: 'otp', nullable: true })
  otp: string;

  @Column({ name: 'otp_limit', default: 0 })
  otpLimit: number;

  @Column({ name: 'otp_created_at', nullable: true })
  otpCreatedAt: Date;

  @Column({ name: 'wallet_balance', type: 'decimal', precision: 10, scale: 2, default: 0 })
  walletBalance: number;

  @Column({ name: 'minium_balance', type: 'decimal', precision: 10, scale: 2, default: 0 })
  miniumBalance: number;

  @Column({ default: 'Male' })
  gender: string;

  @Column({ name: 'flat_door_no', nullable: true })
  flatDoorNo: string;

  @Column({ name: 'road_street', nullable: true })
  roadStreet: string;

  @Column({ name: 'area_locality', nullable: true })
  areaLocality: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  district: string;

  @Column({ name: 'register_by', default: 'Website' })
  registerBy: string;

  @Column({ name: 'kyc_status', default: 'Pending' })
  kycStatus: string;

  @Column({ name: 'bank_account_number', nullable: true })
  bankAccountNumber: string;

  @Column({ name: 'branch_name', nullable: true })
  branchName: string;

  @Column({ name: 'ifsc_code', nullable: true })
  ifscCode: string;

  @Column({ name: 'bank_account_type', default: 'Savings' })
  bankAccountType: string;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ name: 'callback_url', nullable: true })
  callbackUrl: string;

  @Column({ name: 'complaint_callback_url', nullable: true })
  complaintCallbackUrl: string;

  @Column({ name: 'profile_pic', default: 'avatar-2.png' })
  profilePic: string;

  @Column({ name: 'deleted_at', nullable: true })
  deletedAt: Date;

  @Column({ default: 1 })
  status: number;

  @OneToMany(() => Report, (report) => report.user)
  reports: Report[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
