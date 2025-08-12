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
import { InquiryServiceMock, CreateInquiryDto, UpdateInquiryDto } from './inquiry.service.mock';

@Controller('inquiry')
export class InquiryController {
  constructor(private readonly inquiryService: InquiryServiceMock) {}

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

    const result = await this.inquiryService.findAll(page, limit, filters);
    const stats = await this.inquiryService.getStats();
    
    // Turbo Frame 요청인지 확인
    const isTurboFrame = req.headers['turbo-frame'] === 'main-content';

    return {
      title: '문의사항 관리',
      subtitle: '고객 문의사항 목록 및 관리',
      layout: isTurboFrame ? false : 'layouts/main',
      ...result,
      stats,
      categories: this.inquiryService.getCategories(),
      statuses: this.inquiryService.getStatuses(),
      priorities: this.inquiryService.getPriorities(),
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
      categories: this.inquiryService.getCategories(),
      user: { name: 'Admin User' },
    };
  }

  @Post('api')
  async createInquiry(
    @Body() createInquiryDto: CreateInquiryDto, 
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const inquiry = await this.inquiryService.create(createInquiryDto);
      
      if (req.headers.accept?.includes('text/vnd.turbo-stream.html')) {
        res.setHeader('Content-Type', 'text/vnd.turbo-stream.html');
        res.send(`
          <turbo-stream action="replace" target="main-content">
            <template>
              <div class="p-6">
                <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                  문의사항이 성공적으로 등록되었습니다.
                </div>
                <script>
                  setTimeout(() => {
                    Turbo.visit('/inquiry');
                  }, 1000);
                </script>
              </div>
            </template>
          </turbo-stream>
        `);
      } else {
        res.redirect('/inquiry');
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }



  // 통계 API
  @Get('api/stats')
  async getStats() {
    return await this.inquiryService.getStats();
  }
}