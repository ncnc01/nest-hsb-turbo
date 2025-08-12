import { Module } from '@nestjs/common';
import { InquiryController } from './inquiry.controller';
import { InquiryServiceMock } from './inquiry.service.mock';

@Module({
  controllers: [InquiryController],
  providers: [InquiryServiceMock],
  exports: [InquiryServiceMock],
})
export class InquiryModule {}