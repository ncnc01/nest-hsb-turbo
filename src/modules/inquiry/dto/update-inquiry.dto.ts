import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { CreateInquiryDto } from './create-inquiry.dto';
import { InquiryStatus, InquiryPriority } from '../../../database/entities/inquiry.entity';

export class UpdateInquiryDto extends PartialType(CreateInquiryDto) {
  @IsOptional()
  @IsString()
  response?: string;

  @IsOptional()
  @IsEnum(InquiryStatus)
  status?: InquiryStatus;

  @IsOptional()
  @IsEnum(InquiryPriority)
  priority?: InquiryPriority;

  @IsOptional()
  @IsString()
  assigned_to?: string;

  @IsOptional()
  respondedAt?: Date;
}