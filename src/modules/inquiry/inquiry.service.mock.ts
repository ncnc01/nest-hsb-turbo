import { Injectable } from '@nestjs/common';

// 더미 데이터 타입 정의
export interface MockInquiry {
  id: string;
  title: string;
  content: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  category: 'technical' | 'billing' | 'account' | 'general';
  status: 'pending' | 'in_progress' | 'completed' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
  response?: string;
  responseAt?: Date;
}

export interface CreateInquiryDto {
  title: string;
  content: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  category: string;
}

export interface UpdateInquiryDto {
  title?: string;
  content?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  response?: string;
}

@Injectable()
export class InquiryServiceMock {
  
  private mockInquiries: MockInquiry[] = [
    {
      id: '1',
      title: '웹사이트 접속 문제',
      content: '웹사이트에 접속이 되지 않습니다. 로그인 페이지에서 계속 오류가 발생하고 있습니다. 크롬, 파이어폭스 모두에서 동일한 문제가 발생합니다. 캐시를 삭제해도 해결되지 않습니다.',
      customerName: '김철수',
      customerEmail: 'customer1@example.com',
      customerPhone: '010-1234-5678',
      category: 'technical',
      status: 'pending',
      priority: 'high',
      createdAt: new Date(Date.now() - 15 * 60 * 1000),
      updatedAt: new Date(),
    },
    {
      id: '2',
      title: '결제 관련 문의',
      content: '결제가 완료되었는데 제품이 배송되지 않았습니다. 확인 부탁드립니다. 결제 내역서도 첨부드립니다.',
      customerName: '이영희',
      customerEmail: 'customer2@example.com',
      customerPhone: '010-2345-6789',
      category: 'billing',
      status: 'in_progress',
      priority: 'medium',
      createdAt: new Date(Date.now() - 60 * 60 * 1000),
      updatedAt: new Date(),
      assignedTo: '관리자 A',
    },
    {
      id: '3',
      title: '계정 복구 요청',
      content: '계정 비밀번호를 잊어버렸습니다. 복구 도와주세요. 등록한 이메일과 휴대폰 번호를 통해 인증 가능합니다.',
      customerName: '박민수',
      customerEmail: 'customer3@example.com',
      category: 'account',
      status: 'completed',
      priority: 'low',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 30 * 60 * 1000),
      assignedTo: '관리자 B',
      response: '비밀번호 재설정 링크를 고객님 이메일로 발송했습니다. 확인 후 새로운 비밀번호를 설정해주세요.',
      responseAt: new Date(Date.now() - 30 * 60 * 1000),
    },
    {
      id: '4',
      title: '서비스 이용 방법',
      content: '서비스 이용 방법에 대해 자세히 알고 싶습니다. 특히 프리미엄 플랜의 기능들에 대해서요.',
      customerName: '정수진',
      customerEmail: 'customer4@example.com',
      category: 'general',
      status: 'pending',
      priority: 'medium',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      updatedAt: new Date(),
    },
    {
      id: '5',
      title: '환불 요청',
      content: '구매한 상품에 문제가 있어 환불을 요청합니다. 상품 포장이 훼손되어 있었고, 기능도 정상적으로 작동하지 않습니다.',
      customerName: '송현우',
      customerEmail: 'customer5@example.com',
      customerPhone: '010-3456-7890',
      category: 'billing',
      status: 'pending',
      priority: 'urgent',
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      updatedAt: new Date(),
    },
    {
      id: '6',
      title: '기능 개선 제안',
      content: '모바일 앱에 다크 모드 기능을 추가해주시면 좋겠습니다. 야간에 사용할 때 눈이 피로합니다.',
      customerName: '한지민',
      customerEmail: 'customer6@example.com',
      category: 'general',
      status: 'pending',
      priority: 'low',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    },
    {
      id: '7',
      title: '보안 문제 신고',
      content: '계정에 의심스러운 접속 기록이 있습니다. 보안 점검을 요청드립니다.',
      customerName: '조영준',
      customerEmail: 'customer7@example.com',
      customerPhone: '010-4567-8901',
      category: 'technical',
      status: 'in_progress',
      priority: 'high',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
      assignedTo: '보안팀',
    },
    {
      id: '8',
      title: '데이터 내보내기 요청',
      content: 'GDPR에 따라 내 개인정보를 내보내고 싶습니다. 절차를 알려주세요.',
      customerName: '최민영',
      customerEmail: 'customer8@example.com',
      category: 'account',
      status: 'completed',
      priority: 'medium',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      assignedTo: '개인정보팀',
      response: '개인정보 내보내기 파일을 준비했습니다. 이메일로 다운로드 링크를 보내드렸습니다.',
      responseAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      id: '9',
      title: 'API 연동 문의',
      content: '서드파티 API 연동 시 인증 오류가 발생합니다. 개발 문서를 확인했지만 해결되지 않습니다.',
      customerName: '김개발',
      customerEmail: 'dev@example.com',
      customerPhone: '010-5678-9012',
      category: 'technical',
      status: 'in_progress',
      priority: 'medium',
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
      assignedTo: '개발팀',
    },
    {
      id: '10',
      title: '구독 취소 문의',
      content: '구독을 취소하고 싶습니다. 자동 갱신을 중단해주세요.',
      customerName: '이구독',
      customerEmail: 'subscriber@example.com',
      category: 'billing',
      status: 'completed',
      priority: 'low',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      assignedTo: '결제팀',
      response: '구독이 정상적으로 취소되었습니다. 다음 결제일부터 요금이 청구되지 않습니다.',
      responseAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
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
    let filteredInquiries = [...this.mockInquiries];

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
    return this.mockInquiries.find(i => i.id === id) || null;
  }

  // 새 문의사항 생성
  async create(createInquiryDto: CreateInquiryDto): Promise<MockInquiry> {
    const newInquiry: MockInquiry = {
      id: String(this.mockInquiries.length + 1),
      ...createInquiryDto,
      category: createInquiryDto.category as any,
      status: 'pending',
      priority: 'medium',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.mockInquiries.unshift(newInquiry);
    return newInquiry;
  }

  // 문의사항 수정
  async update(id: string, updateInquiryDto: UpdateInquiryDto): Promise<MockInquiry | null> {
    const inquiryIndex = this.mockInquiries.findIndex(i => i.id === id);
    
    if (inquiryIndex === -1) {
      return null;
    }

    const inquiry = this.mockInquiries[inquiryIndex];
    this.mockInquiries[inquiryIndex] = {
      ...inquiry,
      ...updateInquiryDto,
      updatedAt: new Date(),
      ...(updateInquiryDto.response && { responseAt: new Date() }),
    } as MockInquiry;

    return this.mockInquiries[inquiryIndex];
  }

  // 문의사항 삭제
  async remove(id: string): Promise<boolean> {
    const inquiryIndex = this.mockInquiries.findIndex(i => i.id === id);
    
    if (inquiryIndex === -1) {
      return false;
    }

    this.mockInquiries.splice(inquiryIndex, 1);
    return true;
  }

  // 통계 정보
  async getStats() {
    console.log('🎭 [MOCK] InquiryServiceMock.getStats() called - Mock 데이터 조회 중');
    const total = this.mockInquiries.length;
    const pending = this.mockInquiries.filter(i => i.status === 'pending').length;
    const inProgress = this.mockInquiries.filter(i => i.status === 'in_progress').length;
    const completed = this.mockInquiries.filter(i => i.status === 'completed').length;

    return {
      total,
      pending,
      inProgress,
      completed,
      byCategory: {
        technical: this.mockInquiries.filter(i => i.category === 'technical').length,
        billing: this.mockInquiries.filter(i => i.category === 'billing').length,
        account: this.mockInquiries.filter(i => i.category === 'account').length,
        general: this.mockInquiries.filter(i => i.category === 'general').length,
      },
      byPriority: {
        urgent: this.mockInquiries.filter(i => i.priority === 'urgent').length,
        high: this.mockInquiries.filter(i => i.priority === 'high').length,
        medium: this.mockInquiries.filter(i => i.priority === 'medium').length,
        low: this.mockInquiries.filter(i => i.priority === 'low').length,
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