import { Controller, Get, Render, Req } from '@nestjs/common';
import { Request } from 'express';
import { StackComparisonService } from './stack-comparison.service';

@Controller('stack-comparison')
export class StackComparisonController {
  constructor(private readonly stackComparisonService: StackComparisonService) {}

  @Get()
  @Render('pages/stack-comparison/index')
  async stackComparison(@Req() req: Request) {
    const isTurboFrame = req.headers['turbo-frame'] === 'main-content';

    const comparisonData = this.stackComparisonService.getComparisonData();
    
    return {
      title: '웹 개발 스택 비교',
      subtitle: 'NestJS + Handlebars vs 다른 기술 스택들',
      layout: isTurboFrame ? false : 'layouts/main',
      ...comparisonData,
      user: { name: 'Admin User' },
    };
  }

  @Get('api/comparison-data')
  getComparisonData() {
    return this.stackComparisonService.getComparisonData();
  }
}