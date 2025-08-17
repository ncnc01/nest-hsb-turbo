import { Module } from '@nestjs/common';
import { StackComparisonController } from './stack-comparison.controller';
import { StackComparisonService } from './stack-comparison.service';

@Module({
  controllers: [StackComparisonController],
  providers: [StackComparisonService],
  exports: [StackComparisonService],
})
export class StackComparisonModule {}