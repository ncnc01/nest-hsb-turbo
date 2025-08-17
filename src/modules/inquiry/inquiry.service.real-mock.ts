import { Injectable } from '@nestjs/common';
import { MockInquiry, CreateInquiryDto, UpdateInquiryDto } from './inquiry.service.mock';

/**
 * "Real" 모드를 시뮬레이션하는 Mock 서비스
 * 실제 데이터베이스 대신 다른 데이터셋을 사용하여 차이를 보여줌
 */
@Injectable()
export class InquiryServiceRealMock {
  
  private realMockInquiries: MockInquiry[] = [
    {
      id: 'real-1',
      title: '[REAL] 서버 다운 이슈',
      content: '메인 서버가 다운되어 서비스에 접속할 수 없습니다. 긴급 복구가 필요합니다.',
      customerName: '김데이터',
      customerEmail: 'real1@company.com',
      customerPhone: '010-9876-5432',
      category: 'technical',
      status: 'pending',
      priority: 'urgent',
      createdAt: new Date(Date.now() - 5 * 60 * 1000),
      updatedAt: new Date(),
    },
    {
      id: 'real-2',
      title: '[REAL] 대량 주문 처리',
      content: '기업 대량 주문에 대한 특별 할인 적용 및 처리 절차를 문의드립니다.',
      customerName: '박기업',
      customerEmail: 'real2@business.com',
      customerPhone: '02-1234-5678',
      category: 'billing',
      status: 'in_progress',
      priority: 'high',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      updatedAt: new Date(),
      assignedTo: 'B2B팀',
    },
    {
      id: 'real-3',
      title: '[REAL] 관리자 권한 요청',
      content: '프로젝트 관리를 위해 관리자 권한이 필요합니다. 승인 절차를 알려주세요.',
      customerName: '이관리',
      customerEmail: 'real3@project.com',
      category: 'account',
      status: 'completed',
      priority: 'medium',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      assignedTo: '보안팀',
      response: '권한 승인이 완료되었습니다. 관리자 도구에 접근하실 수 있습니다.',
      responseAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    },
    {
      id: 'real-4',
      title: '[REAL] 신제품 출시 공지',
      content: '신제품 출시 일정과 베타 테스트 참여 방법을 알고 싶습니다.',
      customerName: '정베타',
      customerEmail: 'real4@beta.com',
      category: 'general',
      status: 'pending',
      priority: 'low',
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
      updatedAt: new Date(),
    },
    {
      id: 'real-5',
      title: '[REAL] 엔터프라이즈 계약',
      content: '엔터프라이즈 패키지 도입을 검토하고 있습니다. 상세 견적서를 요청드립니다.',
      customerName: '최기업',
      customerEmail: 'real5@enterprise.com',
      customerPhone: '02-9876-5432',
      category: 'billing',
      status: 'in_progress',
      priority: 'high',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
      assignedTo: '영업팀',
    }
  ];

  // 전체 문의사항 목록 조회 (페이지네이션 지원)
  async findAll(page = 1, limit = 10, filters?: {
    status?: string;
    category?: string;
    priority?: string;
    search?: string;
  }): Promise<{
    inquiries: MockInquiry[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    let filteredInquiries = [...this.realMockInquiries];

    // 필터 적용
    if (filters?.status) {
      filteredInquiries = filteredInquiries.filter(i => i.status === filters.status);
    }
    if (filters?.category) {
      filteredInquiries = filteredInquiries.filter(i => i.category === filters.category);
    }
    if (filters?.priority) {
      filteredInquiries = filteredInquiries.filter(i => i.priority === filters.priority);
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filteredInquiries = filteredInquiries.filter(i => 
        i.title.toLowerCase().includes(search) ||
        i.content.toLowerCase().includes(search) ||
        i.customerName.toLowerCase().includes(search) ||
        i.customerEmail.toLowerCase().includes(search)
      );
    }

    // 정렬: 최신순
    filteredInquiries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // 페이지네이션
    const total = filteredInquiries.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const inquiries = filteredInquiries.slice(startIndex, startIndex + limit);

    return {
      inquiries,
      total,
      page,
      limit,
      totalPages,
    };
  }

  // 단일 문의사항 조회
  async findOne(id: string): Promise<MockInquiry | null> {
    return this.realMockInquiries.find(i => i.id === id) || null;
  }

  // 새 문의사항 생성
  async create(createInquiryDto: CreateInquiryDto): Promise<MockInquiry> {
    const newInquiry: MockInquiry = {
      id: `real-${this.realMockInquiries.length + 1}`,
      ...createInquiryDto,
      title: `[REAL] ${createInquiryDto.title}`,
      category: createInquiryDto.category as any,
      status: 'pending',
      priority: 'medium',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.realMockInquiries.unshift(newInquiry);
    return newInquiry;
  }

  // 문의사항 수정
  async update(id: string, updateInquiryDto: UpdateInquiryDto): Promise<MockInquiry | null> {
    const inquiryIndex = this.realMockInquiries.findIndex(i => i.id === id);
    
    if (inquiryIndex === -1) {
      return null;
    }

    const inquiry = this.realMockInquiries[inquiryIndex];
    this.realMockInquiries[inquiryIndex] = {
      ...inquiry,
      ...updateInquiryDto,
      updatedAt: new Date(),
      ...(updateInquiryDto.response && { responseAt: new Date() }),
    } as MockInquiry;

    return this.realMockInquiries[inquiryIndex];
  }

  // 문의사항 삭제
  async remove(id: string): Promise<boolean> {
    const inquiryIndex = this.realMockInquiries.findIndex(i => i.id === id);
    
    if (inquiryIndex === -1) {
      return false;
    }

    this.realMockInquiries.splice(inquiryIndex, 1);
    return true;
  }

  // 통계 정보 (Real 모드는 다른 수치)
  async getStats() {
    const total = this.realMockInquiries.length;
    const pending = this.realMockInquiries.filter(i => i.status === 'pending').length;
    const inProgress = this.realMockInquiries.filter(i => i.status === 'in_progress').length;
    const completed = this.realMockInquiries.filter(i => i.status === 'completed').length;

    return {
      total,
      pending,
      inProgress,
      completed,
      byCategory: {
        technical: this.realMockInquiries.filter(i => i.category === 'technical').length,
        billing: this.realMockInquiries.filter(i => i.category === 'billing').length,
        account: this.realMockInquiries.filter(i => i.category === 'account').length,
        general: this.realMockInquiries.filter(i => i.category === 'general').length,
      },
      byPriority: {
        urgent: this.realMockInquiries.filter(i => i.priority === 'urgent').length,
        high: this.realMockInquiries.filter(i => i.priority === 'high').length,
        medium: this.realMockInquiries.filter(i => i.priority === 'medium').length,
        low: this.realMockInquiries.filter(i => i.priority === 'low').length,
      }
    };
  }

  // 카테고리 목록
  getCategories() {
    return [
      { value: 'technical', label: '기술 지원' },
      { value: 'billing', label: '결제/청구' },
      { value: 'account', label: '계정 관리' },
      { value: 'general', label: '일반 문의' },
    ];
  }

  // 상태 목록
  getStatuses() {
    return [
      { value: 'pending', label: '대기', color: 'orange' },
      { value: 'in_progress', label: '진행중', color: 'blue' },
      { value: 'completed', label: '완료', color: 'green' },
      { value: 'closed', label: '종료', color: 'gray' },
    ];
  }

  // 우선순위 목록
  getPriorities() {
    return [
      { value: 'low', label: '낮음', color: 'green' },
      { value: 'medium', label: '보통', color: 'blue' },
      { value: 'high', label: '높음', color: 'orange' },
      { value: 'urgent', label: '긴급', color: 'red' },
    ];
  }
}