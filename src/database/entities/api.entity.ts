import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('apis')
export class Api {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'api_name' })
  apiName: string;

  @Column({ name: 'api_username' })
  apiUsername: string;

  @Column({ name: 'api_password' })
  apiPassword: string;

  @Column({ name: 'api_key' })
  apiKey: string;

  @Column({ name: 'api_url' })
  apiUrl: string;

  @Column({ name: 'balance_check_url', nullable: true })
  balanceCheckUrl: string;

  @Column({ name: 'complaint_api_url', nullable: true })
  complaintApiUrl: string;

  @Column({ name: 'complaint_api_method', nullable: true })
  complaintApiMethod: string;

  @Column({ name: 'complaint_status_value', nullable: true })
  complaintStatusValue: string;

  @Column({ name: 'refund_value', nullable: true })
  refundValue: string;

  @Column({ name: 'complaint_success_value', nullable: true })
  complaintSuccessValue: string;

  @Column({ name: 'complaint_failed_value', nullable: true })
  complaintFailedValue: string;

  @Column({ name: 'complaint_callback_status_value', nullable: true })
  complaintCallbackStatusValue: string;

  @Column({ name: 'complaint_callback_success_value', nullable: true })
  complaintCallbackSuccessValue: string;

  @Column({ name: 'complaint_callback_failed_value', nullable: true })
  complaintCallbackFailedValue: string;

  @Column({ name: 'complaint_callback_remark', nullable: true })
  complaintCallbackRemark: string;

  @Column({ name: 'complaint_callback_api_method', nullable: true })
  complaintCallbackApiMethod: string;

  @Column({ name: 'callback_refund_value', nullable: true })
  callbackRefundValue: string;

  @Column({ name: 'status_value' })
  statusValue: string;

  @Column({ name: 'success_value' })
  successValue: string;

  @Column({ name: 'failed_value' })
  failedValue: string;

  @Column({ name: 'pending_value', nullable: true })
  pendingValue: string;

  @Column({ name: 'error_value', nullable: true })
  errorValue: string;

  @Column({ name: 'error_value_response', nullable: true })
  errorValueResponse: string;

  @Column({ name: 'order_id_value' })
  orderIdValue: string;

  @Column({ name: 'operator_id_value' })
  operatorIdValue: string;

  @Column({ name: 'api_method' })
  apiMethod: string;

  @Column({ name: 'api_format' })
  apiFormat: string;

  @Column({ name: 'callback_status_value' })
  callbackStatusValue: string;

  @Column({ name: 'callback_success_value' })
  callbackSuccessValue: string;

  @Column({ name: 'callback_failed_value' })
  callbackFailedValue: string;

  @Column({ name: 'callback_order_id_value' })
  callbackOrderIdValue: string;

  @Column({ name: 'callback_operator_id_value' })
  callbackOperatorIdValue: string;

  @Column({ name: 'callback_remark' })
  callbackRemark: string;

  @Column({ name: 'callback_api_method' })
  callbackApiMethod: string;

  @Column({ name: 'api_type' })
  apiType: string;

  @Column({ default: 1 })
  status: number;

  @Column({ name: 'deleted_at', nullable: true })
  deletedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
