import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InquiryController } from './inquiry.controller';
import { InquiryService } from './inquiry.service';
import { InquiryServiceMock } from './inquiry.service.mock';
import { Inquiry } from '../../database/entities/inquiry.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Inquiry])],
  controllers: [InquiryController],
  providers: [InquiryService, InquiryServiceMock],
  exports: [InquiryService, InquiryServiceMock],
})
export class InquiryModule {}