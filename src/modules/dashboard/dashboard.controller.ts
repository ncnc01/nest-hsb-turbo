import { Controller, Get, Render, Req } from '@nestjs/common';
import { Request } from 'express';
import { DashboardServiceMock } from './dashboard.service.mock';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardServiceMock) {}

  @Get()
  @Render('pages/dashboard/index')
  async dashboard(@Req() req: Request) {
    const stats = await this.dashboardService.getDashboardStats();
    const recentInquiries = await this.dashboardService.getRecentInquiries();
    const inquiryTrends = await this.dashboardService.getInquiryTrends();
    const statusDistribution = await this.dashboardService.getInquiryStatusDistribution();

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
    };
  }

  @Get('api/stats')
  async getStats() {
    return await this.dashboardService.getDashboardStats();
  }

  @Get('api/trends')
  async getTrends() {
    return await this.dashboardService.getInquiryTrends();
  }

  @Get('api/status-distribution')
  async getStatusDistribution() {
    return await this.dashboardService.getInquiryStatusDistribution();
  }
}