import { IsEmail, IsNotEmpty, IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { InquiryPriority } from '../../../database/entities/inquiry.entity';

export class CreateInquiryDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsEmail()
  customerEmail: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;

  @IsOptional()
  @IsEnum(InquiryPriority)
  priority?: InquiryPriority;
}