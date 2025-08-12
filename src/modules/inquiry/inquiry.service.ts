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
    const inquiry = this.inquiryRepository.create({
      ...createInquiryDto,
      status: InquiryStatus.PENDING,
      priority: createInquiryDto.priority || InquiryPriority.MEDIUM,
    });

    return await this.inquiryRepository.save(inquiry);
  }

  async findAll(query: any = {}): Promise<Inquiry[]> {
    const { status, priority, category, page = 1, limit = 10, search } = query;
    
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
    queryBuilder
      .orderBy('inquiry.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return await queryBuilder.getMany();
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
}