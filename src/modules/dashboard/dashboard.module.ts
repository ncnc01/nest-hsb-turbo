import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DashboardServiceMock } from './dashboard.service.mock';
import { Inquiry } from '../../database/entities/inquiry.entity';
import { User } from '../../database/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Inquiry, User])],
  controllers: [DashboardController],
  providers: [DashboardService, DashboardServiceMock],
})
export class DashboardModule {}