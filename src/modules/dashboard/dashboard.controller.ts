import { Controller, Get, Render, Req } from '@nestjs/common';
import { Request } from 'express';
import { DashboardService } from './dashboard.service';
import { DashboardServiceMock } from './dashboard.service.mock';
import { DevToolsController } from '../../dev-tools/dev-tools.controller';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly dashboardServiceMock: DashboardServiceMock,
  ) {}

  private getActiveService() {
    const mode = DevToolsController.getCurrentDataMode();
    console.log(`🎯 Dashboard using ${mode} mode`);
    return mode === 'real' ? this.dashboardService : this.dashboardServiceMock;
  }

  @Get()
  @Render('pages/dashboard/index')
  async dashboard(@Req() req: Request) {
    const service = this.getActiveService();
    const stats = await service.getDashboardStats();
    const recentInquiries = await service.getRecentInquiries();
    const inquiryTrends = await service.getInquiryTrends();
    const statusDistribution = await service.getInquiryStatusDistribution();

    // Turbo Frame 요청인지 확인
    const isTurboFrame = req.headers['turbo-frame'] === 'main-content';

    return {
      title: 'Dashboard',
      subtitle: '관리자 대시보드',
      layout: isTurboFrame ? false : 'layouts/main',
      stats,
      recentInquiries,
      inquiryTrends: JSON.stringify(inquiryTrends),
      statusDistribution: JSON.stringify(statusDistribution),
      user: { name: 'Admin User' },
      isDevelopment: process.env.NODE_ENV === 'development',
      dataMode: DevToolsController.getCurrentDataMode(),
    };
  }

  @Get('api/stats')
  async getStats() {
    const service = this.getActiveService();
    return await service.getDashboardStats();
  }

  @Get('api/trends')
  async getTrends() {
    const service = this.getActiveService();
    return await service.getInquiryTrends();
  }

  @Get('api/status-distribution')
  async getStatusDistribution() {
    const service = this.getActiveService();
    return await service.getInquiryStatusDistribution();
  }
}