import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inquiry, InquiryStatus, InquiryPriority } from '../../database/entities/inquiry.entity';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { UpdateInquiryDto } from './dto/update-inquiry.dto';

@Injectable()
export class InquiryService {
  constructor(
    @InjectRepository(Inquiry)
    private inquiryRepository: Repository<Inquiry>,
  ) {}

  async create(createInquiryDto: CreateInquiryDto): Promise<Inquiry> {
    console.log('🔥 [REAL] InquiryService.create() - DB에 저장 중:', createInquiryDto);
    const inquiry = this.inquiryRepository.create({
      ...createInquiryDto,
      status: InquiryStatus.PENDING,
      priority: createInquiryDto.priority || InquiryPriority.MEDIUM,
    });

    const savedInquiry = await this.inquiryRepository.save(inquiry);
    console.log('🔥 [REAL] DB 저장 완료. ID:', savedInquiry.id);
    return savedInquiry;
  }

  async findAll(page: number = 1, limit: number = 10, filters: any = {}): Promise<{
    inquiries: Inquiry[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { status, priority, category, search } = filters;
    
    const queryBuilder = this.inquiryRepository
      .createQueryBuilder('inquiry')
      .leftJoinAndSelect('inquiry.assignedTo', 'assignedTo');

    // 필터링
    if (status) {
      queryBuilder.andWhere('inquiry.status = :status', { status });
    }

    if (priority) {
      queryBuilder.andWhere('inquiry.priority = :priority', { priority });
    }

    if (category) {
      queryBuilder.andWhere('inquiry.category = :category', { category });
    }

    // 검색
    if (search) {
      queryBuilder.andWhere(
        '(inquiry.title ILIKE :search OR inquiry.content ILIKE :search OR inquiry.customerEmail ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // 정렬 및 페이지네이션
    queryBuilder.orderBy('inquiry.createdAt', 'DESC');

    // 총 개수와 페이지된 결과를 함께 가져오기
    const [inquiries, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      inquiries,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: string): Promise<Inquiry> {
    const inquiry = await this.inquiryRepository.findOne({
      where: { id },
      relations: ['assignedTo'],
    });

    if (!inquiry) {
      throw new NotFoundException(`문의사항을 찾을 수 없습니다. ID: ${id}`);
    }

    return inquiry;
  }

  async update(id: string, updateInquiryDto: UpdateInquiryDto): Promise<Inquiry> {
    const inquiry = await this.findOne(id);
    
    // 상태가 완료로 변경되면 완료 시간 기록
    if (updateInquiryDto.status === InquiryStatus.COMPLETED && inquiry.status !== InquiryStatus.COMPLETED) {
      updateInquiryDto.respondedAt = new Date();
    }

    Object.assign(inquiry, updateInquiryDto);
    return await this.inquiryRepository.save(inquiry);
  }

  async remove(id: string): Promise<void> {
    const inquiry = await this.findOne(id);
    await this.inquiryRepository.remove(inquiry);
  }

  async getInquiryStats() {
    const [
      total,
      pending,
      inProgress,
      completed,
      closed,
    ] = await Promise.all([
      this.inquiryRepository.count(),
      this.inquiryRepository.count({ where: { status: InquiryStatus.PENDING } }),
      this.inquiryRepository.count({ where: { status: InquiryStatus.IN_PROGRESS } }),
      this.inquiryRepository.count({ where: { status: InquiryStatus.COMPLETED } }),
      this.inquiryRepository.count({ where: { status: InquiryStatus.CLOSED } }),
    ]);

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const responseTime = await this.getAverageResponseTime();

    return {
      total,
      pending,
      inProgress,
      completed,
      closed,
      completionRate,
      responseTime,
    };
  }

  private async getAverageResponseTime(): Promise<number> {
    const result = await this.inquiryRepository
      .createQueryBuilder('inquiry')
      .select('AVG(EXTRACT(EPOCH FROM (inquiry.respondedAt - inquiry.createdAt))/3600)', 'avgHours')
      .where('inquiry.respondedAt IS NOT NULL')
      .getRawOne();

    return result?.avgHours ? Math.round(parseFloat(result.avgHours)) : 0;
  }

  async findByStatus(status: InquiryStatus, limit?: number): Promise<Inquiry[]> {
    const queryBuilder = this.inquiryRepository
      .createQueryBuilder('inquiry')
      .where('inquiry.status = :status', { status })
      .orderBy('inquiry.createdAt', 'DESC');

    if (limit) {
      queryBuilder.take(limit);
    }

    return await queryBuilder.getMany();
  }

  async assignToUser(inquiryId: string, userId: string): Promise<Inquiry> {
    const inquiry = await this.findOne(inquiryId);
    inquiry.assigned_to = userId;
    inquiry.status = InquiryStatus.IN_PROGRESS;
    
    return await this.inquiryRepository.save(inquiry);
  }

  // 카테고리 목록
  getCategories() {
    return [
      { value: 'technical', label: '기술 지원' },
      { value: 'billing', label: '결제/청구' },
      { value: 'general', label: '일반 문의' },
      { value: 'bug_report', label: '버그 신고' },
      { value: 'feature_request', label: '기능 요청' },
      { value: 'account', label: '계정 관련' },
      { value: 'other', label: '기타' },
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

  // Mock 서비스와 호환성을 위한 getStats 메서드 (기존 getInquiryStats 래핑)
  async getStats() {
    console.log('🔥 [REAL] InquiryService.getStats() called - DB 데이터 조회 중');
    const stats = await this.getInquiryStats();
    console.log('🔥 [REAL] DB 통계 결과:', stats);
    return stats;
  }
}