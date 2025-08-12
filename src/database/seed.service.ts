import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Inquiry } from './entities/inquiry.entity';
import { seedDatabase } from './seed-data';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Inquiry)
    private inquiryRepository: Repository<Inquiry>,
  ) {}

  async run() {
    try {
      await seedDatabase(this.userRepository, this.inquiryRepository);
    } catch (error) {
      console.log('🔄 시드 데이터를 건너뜁니다:', error.message);
    }
  }
}