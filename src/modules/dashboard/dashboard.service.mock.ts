import { Injectable } from '@nestjs/common';

// 더미 데이터 타입 정의
interface MockStats {
  totalInquiries: number;
  pendingInquiries: number;
  completedInquiries: number;
  totalUsers: number;
  completionRate: number;
  avgResponseTime: number;
}

interface MockInquiry {
  id: string;
  title: string;
  content: string;
  customerEmail: string;
  customerPhone?: string;
  category: string;
  status: 'pending' | 'in_progress' | 'completed' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class DashboardServiceMock {
  
  private mockInquiries: MockInquiry[] = [
    {
      id: '1',
      title: '웹사이트 접속 문제',
      content: '웹사이트에 접속이 되지 않습니다. 로그인 페이지에서 계속 오류가 발생하고 있습니다.',
      customerEmail: 'customer1@example.com',
      customerPhone: '010-1234-5678',
      category: 'technical',
      status: 'pending',
      priority: 'high',
      createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15분 전
      updatedAt: new Date(),
    },
    {
      id: '2',
      title: '결제 관련 문의',
      content: '결제가 완료되었는데 제품이 배송되지 않았습니다. 확인 부탁드립니다.',
      customerEmail: 'customer2@example.com',
      customerPhone: '010-2345-6789',
      category: 'billing',
      status: 'in_progress',
      priority: 'medium',
      createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1시간 전
      updatedAt: new Date(),
    },
    {
      id: '3',
      title: '계정 복구 요청',
      content: '계정 비밀번호를 잊어버렸습니다. 복구 도와주세요.',
      customerEmail: 'customer3@example.com',
      category: 'account',
      status: 'completed',
      priority: 'low',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3시간 전
      updatedAt: new Date(),
    },
    {
      id: '4',
      title: '서비스 이용 방법',
      content: '서비스 이용 방법에 대해 자세히 알고 싶습니다.',
      customerEmail: 'customer4@example.com',
      category: 'general',
      status: 'pending',
      priority: 'medium',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6시간 전
      updatedAt: new Date(),
    },
    {
      id: '5',
      title: '환불 요청',
      content: '구매한 상품에 문제가 있어 환불을 요청합니다.',
      customerEmail: 'customer5@example.com',
      customerPhone: '010-3456-7890',
      category: 'billing',
      status: 'pending',
      priority: 'urgent',
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12시간 전
      updatedAt: new Date(),
    },
  ];

  async getDashboardStats(): Promise<MockStats> {
    const totalInquiries = this.mockInquiries.length;
    const pendingInquiries = this.mockInquiries.filter(i => i.status === 'pending').length;
    const completedInquiries = this.mockInquiries.filter(i => i.status === 'completed').length;
    const totalUsers = 156; // 더미 데이터
    const completionRate = totalInquiries > 0 
      ? Math.round((completedInquiries / totalInquiries) * 100) 
      : 0;

    return {
      totalInquiries: 1247, // 더 큰 숫자로 표시
      pendingInquiries,
      completedInquiries: 1172, // 더 큰 숫자로 표시
      totalUsers,
      completionRate: 94,
      avgResponseTime: 2.4,
    };
  }

  async getRecentInquiries(limit: number = 5): Promise<MockInquiry[]> {
    return this.mockInquiries
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async getInquiryTrends(days: number = 30) {
    // 더미 트렌드 데이터 생성
    const dates = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
    });

    return {
      labels: dates.slice(-7), // 최근 7일만 표시
      datasets: [
        {
          label: '새 문의',
          data: [12, 19, 15, 25, 22, 18, 24],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.3
        },
        {
          label: '완료',
          data: [8, 15, 12, 20, 18, 15, 22],
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.3
        }
      ]
    };
  }

  async getInquiryStatusDistribution() {
    return [
      {
        status: 'pending',
        count: 23,
        label: '대기',
        color: '#f59e0b',
      },
      {
        status: 'in_progress',
        count: 45,
        label: '진행중',
        color: '#3b82f6',
      },
      {
        status: 'completed',
        count: 1172,
        label: '완료',
        color: '#22c55e',
      },
      {
        status: 'closed',
        count: 7,
        label: '종료',
        color: '#6b7280',
      }
    ];
  }

  async getInquiryPriorityDistribution() {
    return [
      {
        priority: 'low',
        count: 234,
        label: '낮음',
        color: '#22c55e',
      },
      {
        priority: 'medium',
        count: 567,
        label: '보통',
        color: '#3b82f6',
      },
      {
        priority: 'high',
        count: 123,
        label: '높음',
        color: '#f59e0b',
      },
      {
        priority: 'urgent',
        count: 45,
        label: '긴급',
        color: '#ef4444',
      }
    ];
  }

  // 더미 실시간 데이터 생성
  async getLiveMetrics() {
    return {
      onlineUsers: Math.floor(Math.random() * 50) + 10,
      newInquiriesToday: Math.floor(Math.random() * 20) + 5,
      responseTimeToday: (Math.random() * 2 + 1).toFixed(1) + 'h',
      serverUptime: '2일 14시간 23분',
      lastUpdate: new Date().toLocaleTimeString('ko-KR'),
    };
  }

  // 카테고리별 통계
  async getCategoryStats() {
    const categories = ['technical', 'billing', 'account', 'general'];
    return categories.map(category => {
      const count = this.mockInquiries.filter(i => i.category === category).length;
      return {
        category,
        count: count * 50, // 더 큰 숫자로 표시
        label: this.getCategoryLabel(category),
        percentage: Math.floor(Math.random() * 30) + 10,
      };
    });
  }

  private getCategoryLabel(category: string): string {
    const labels = {
      technical: '기술 지원',
      billing: '결제/청구',
      account: '계정 관리',
      general: '일반 문의'
    };
    return labels[category] || category;
  }

  // 시간대별 문의 분포
  async getHourlyDistribution() {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    return hours.map(hour => ({
      hour,
      count: Math.floor(Math.random() * 30) + 5,
      label: `${hour}:00`
    }));
  }
}