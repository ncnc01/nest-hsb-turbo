import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Inquiry, InquiryStatus, InquiryPriority } from './entities/inquiry.entity';
import * as bcrypt from 'bcrypt';

export async function seedDatabase(
  userRepository: Repository<User>,
  inquiryRepository: Repository<Inquiry>
) {
  // 기본 관리자 계정 생성
  const adminExists = await userRepository.findOne({
    where: { username: 'admin' }
  });

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = userRepository.create({
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
    });
    await userRepository.save(admin);
    console.log('✅ 기본 관리자 계정이 생성되었습니다 (admin/admin123)');
  }

  // 샘플 문의사항 생성
  const inquiryCount = await inquiryRepository.count();
  if (inquiryCount === 0) {
    const sampleInquiries = [
      {
        title: '웹사이트 접속 문제',
        content: '웹사이트에 접속이 되지 않습니다. 어떻게 해야 하나요?',
        customerEmail: 'customer1@example.com',
        customerPhone: '010-1234-5678',
        category: 'technical',
        status: InquiryStatus.PENDING,
        priority: InquiryPriority.HIGH,
      },
      {
        title: '결제 관련 문의',
        content: '결제가 완료되었는데 제품이 배송되지 않았습니다.',
        customerEmail: 'customer2@example.com',
        customerPhone: '010-2345-6789',
        category: 'billing',
        status: InquiryStatus.IN_PROGRESS,
        priority: InquiryPriority.MEDIUM,
      },
      {
        title: '계정 복구 요청',
        content: '계정 비밀번호를 잊어버렸습니다. 복구 도와주세요.',
        customerEmail: 'customer3@example.com',
        category: 'account',
        status: InquiryStatus.COMPLETED,
        priority: InquiryPriority.LOW,
        response: '비밀번호 재설정 링크를 이메일로 발송해드렸습니다.',
        respondedAt: new Date(),
      },
      {
        title: '서비스 이용 방법',
        content: '서비스 이용 방법에 대해 자세히 알고 싶습니다.',
        customerEmail: 'customer4@example.com',
        category: 'general',
        status: InquiryStatus.PENDING,
        priority: InquiryPriority.MEDIUM,
      },
      {
        title: '환불 요청',
        content: '구매한 상품에 문제가 있어 환불을 요청합니다.',
        customerEmail: 'customer5@example.com',
        customerPhone: '010-3456-7890',
        category: 'billing',
        status: InquiryStatus.PENDING,
        priority: InquiryPriority.URGENT,
      },
    ];

    for (const inquiryData of sampleInquiries) {
      const inquiry = inquiryRepository.create(inquiryData);
      await inquiryRepository.save(inquiry);
    }
    
    console.log('✅ 샘플 문의사항이 생성되었습니다.');
  }
}