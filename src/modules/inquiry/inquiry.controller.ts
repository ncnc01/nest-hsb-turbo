import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  Render, 
  Redirect,
  Res,
  Req,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { InquiryService } from './inquiry.service';
import { InquiryServiceMock, CreateInquiryDto, UpdateInquiryDto } from './inquiry.service.mock';
import { DevToolsController } from '../../dev-tools/dev-tools.controller';

@Controller('inquiry')
export class InquiryController {
  constructor(
    private readonly inquiryService: InquiryService,
    private readonly inquiryServiceMock: InquiryServiceMock,
  ) {}

  private getActiveService() {
    const mode = DevToolsController.getCurrentDataMode();
    console.log(`🎯 InquiryController using ${mode} mode`);
    return mode === 'real' ? this.inquiryService : this.inquiryServiceMock;
  }

  @Get()
  @Render('pages/inquiry/list')
  async inquiryList(@Query() query: any, @Req() req: Request) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const filters = {
      status: query.status,
      category: query.category,
      priority: query.priority,
      search: query.search,
    };

    const activeService = this.getActiveService();
    const result = await activeService.findAll(page, limit, filters);
    const stats = await activeService.getStats();
    
    // Turbo Frame 요청인지 확인
    const isTurboFrame = req.headers['turbo-frame'] === 'main-content';

    return {
      title: '문의사항 관리',
      subtitle: '고객 문의사항 목록 및 관리',
      layout: isTurboFrame ? false : 'layouts/main',
      ...result,
      stats,
      categories: this.getActiveService().getCategories(),
      statuses: this.getActiveService().getStatuses(),
      priorities: this.getActiveService().getPriorities(),
      currentFilters: filters,
      user: { name: 'Admin User' },
    };
  }

  @Get('new/create')
  @Render('pages/inquiry/create')
  async inquiryCreate(@Req() req: Request) {
    const isTurboFrame = req.headers['turbo-frame'] === 'main-content';
    
    return {
      title: '새 문의사항 등록',
      subtitle: '고객 문의사항을 등록합니다',
      layout: isTurboFrame ? false : 'layouts/main',
      categories: this.getActiveService().getCategories(),
      user: { name: 'Admin User' },
    };
  }

  @Post()
  async createInquiry(
    @Body() createInquiryDto: CreateInquiryDto, 
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const activeService = this.getActiveService();
      const inquiry = await activeService.create(createInquiryDto);
      
      // Turbo Frame 요청인지 확인
      const isTurboFrame = req.headers['turbo-frame'] === 'main-content';
      
      if (isTurboFrame) {
        // Turbo Frame 응답으로 성공 메시지와 함께 목록 페이지로 이동
        return res.render('pages/inquiry/list', {
          title: '문의사항 관리',
          subtitle: '고객 문의사항 목록 및 관리',
          layout: false,
          successMessage: '문의사항이 성공적으로 등록되었습니다.',
          ...(await activeService.findAll(1, 10, {})),
          categories: activeService.getCategories(),
          statuses: activeService.getStatuses(),
          priorities: activeService.getPriorities(),
          currentFilters: {},
          user: { name: 'Admin User' },
        });
      } else {
        // 일반 POST 요청일 경우 리다이렉트
        return res.redirect('/inquiry');
      }
    } catch (error) {
      console.error('문의사항 등록 오류:', error);
      
      const isTurboFrame = req.headers['turbo-frame'] === 'main-content';
      
      if (isTurboFrame) {
        // Turbo Frame 응답으로 에러와 함께 폼 페이지 다시 렌더링
        return res.status(400).render('pages/inquiry/create', {
          title: '새 문의사항 등록',
          subtitle: '고객 문의사항을 등록합니다',
          layout: false,
          errorMessage: error.message || '문의사항 등록 중 오류가 발생했습니다.',
          categories: this.getActiveService().getCategories(),
          user: { name: 'Admin User' },
          formData: createInquiryDto, // 입력했던 데이터 유지
        });
      } else {
        return res.status(400).redirect('/inquiry/new/create?error=' + encodeURIComponent(error.message));
      }
    }
  }



  // 통계 API
  @Get('api/stats')
  async getStats() {
    return await this.getActiveService().getStats();
  }
}