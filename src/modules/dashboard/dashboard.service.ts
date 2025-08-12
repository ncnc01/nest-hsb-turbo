import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inquiry, InquiryStatus } from '../../database/entities/inquiry.entity';
import { User } from '../../database/entities/user.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Inquiry)
    private inquiryRepository: Repository<Inquiry>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getDashboardStats() {
    const [
      totalInquiries,
      pendingInquiries,
      completedInquiries,
      totalUsers,
    ] = await Promise.all([
      this.inquiryRepository.count(),
      this.inquiryRepository.count({ where: { status: InquiryStatus.PENDING } }),
      this.inquiryRepository.count({ where: { status: InquiryStatus.COMPLETED } }),
      this.userRepository.count(),
    ]);

    const completionRate = totalInquiries > 0 
      ? Math.round((completedInquiries / totalInquiries) * 100) 
      : 0;

    return {
      totalInquiries,
      pendingInquiries,
      completedInquiries,
      totalUsers,
      completionRate,
    };
  }

  async getRecentInquiries(limit: number = 5) {
    return await this.inquiryRepository.find({
      where: { status: InquiryStatus.PENDING },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getInquiryTrends(days: number = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const inquiries = await this.inquiryRepository
      .createQueryBuilder('inquiry')
      .select([
        'DATE(inquiry.createdAt) as date',
        'COUNT(*) as count',
        'inquiry.status as status'
      ])
      .where('inquiry.createdAt >= :startDate', { startDate })
      .andWhere('inquiry.createdAt <= :endDate', { endDate })
      .groupBy('DATE(inquiry.createdAt), inquiry.status')
      .orderBy('date', 'ASC')
      .getRawMany();

    // 데이터를 차트에 맞게 변환
    const chartData = this.transformTrendData(inquiries, days);
    
    return chartData;
  }

  async getInquiryStatusDistribution() {
    const statusCounts = await this.inquiryRepository
      .createQueryBuilder('inquiry')
      .select('inquiry.status, COUNT(*) as count')
      .groupBy('inquiry.status')
      .getRawMany();

    return statusCounts.map(item => ({
      status: item.inquiry_status,
      count: parseInt(item.count),
      label: this.getStatusLabel(item.inquiry_status),
      color: this.getStatusColor(item.inquiry_status),
    }));
  }

  async getInquiryPriorityDistribution() {
    const priorityCounts = await this.inquiryRepository
      .createQueryBuilder('inquiry')
      .select('inquiry.priority, COUNT(*) as count')
      .groupBy('inquiry.priority')
      .getRawMany();

    return priorityCounts.map(item => ({
      priority: item.inquiry_priority,
      count: parseInt(item.count),
      label: this.getPriorityLabel(item.inquiry_priority),
      color: this.getPriorityColor(item.inquiry_priority),
    }));
  }

  private transformTrendData(rawData: any[], days: number) {
    // 지난 N일의 모든 날짜 생성
    const dates = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }

    // 각 날짜별 데이터 초기화
    const chartData = {
      labels: dates.map(date => new Date(date).toLocaleDateString('ko-KR', { 
        month: 'short', 
        day: 'numeric' 
      })),
      datasets: [
        {
          label: '새 문의',
          data: new Array(days).fill(0),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
        },
        {
          label: '완료',
          data: new Array(days).fill(0),
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
        }
      ]
    };

    // 실제 데이터로 채우기
    rawData.forEach(item => {
      const dateIndex = dates.indexOf(item.date);
      if (dateIndex !== -1) {
        if (item.status === InquiryStatus.PENDING) {
          chartData.datasets[0].data[dateIndex] = parseInt(item.count);
        } else if (item.status === InquiryStatus.COMPLETED) {
          chartData.datasets[1].data[dateIndex] = parseInt(item.count);
        }
      }
    });

    return chartData;
  }

  private getStatusLabel(status: string): string {
    const labels = {
      pending: '대기',
      in_progress: '진행중',
      completed: '완료',
      closed: '종료'
    };
    return labels[status] || status;
  }

  private getStatusColor(status: string): string {
    const colors = {
      pending: '#f59e0b',
      in_progress: '#3b82f6',
      completed: '#22c55e',
      closed: '#6b7280'
    };
    return colors[status] || '#6b7280';
  }

  private getPriorityLabel(priority: string): string {
    const labels = {
      low: '낮음',
      medium: '보통',
      high: '높음',
      urgent: '긴급'
    };
    return labels[priority] || priority;
  }

  private getPriorityColor(priority: string): string {
    const colors = {
      low: '#22c55e',
      medium: '#3b82f6',
      high: '#f59e0b',
      urgent: '#ef4444'
    };
    return colors[priority] || '#6b7280';
  }
}