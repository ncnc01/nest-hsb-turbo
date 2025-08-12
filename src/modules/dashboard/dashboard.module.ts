import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardServiceMock } from './dashboard.service.mock';

@Module({
  controllers: [DashboardController],
  providers: [DashboardServiceMock],
})
export class DashboardModule {}