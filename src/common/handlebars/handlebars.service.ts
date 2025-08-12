import { Injectable, Logger } from '@nestjs/common';
import * as Handlebars from 'handlebars';
import { allHelpers } from './helpers';

@Injectable()
export class HandlebarsService {
  private readonly logger = new Logger(HandlebarsService.name);
  private readonly handlebars: typeof Handlebars;

  constructor() {
    this.handlebars = Handlebars.create();
    this.registerAllHelpers();
  }

  /**
   * 모든 헬퍼 등록
   */
  private registerAllHelpers(): void {
    this.logger.log('Registering Handlebars helpers...');

    Object.entries(allHelpers).forEach(([name, helper]) => {
      this.registerHelper(name, helper as any);
    });

    this.logger.log(`Registered ${Object.keys(allHelpers).length} helpers`);
  }

  /**
   * 개별 헬퍼 등록
   */
  public registerHelper(name: string, helper: Handlebars.HelperDelegate): void {
    this.handlebars.registerHelper(name, helper);
    this.logger.debug(`Registered helper: ${name}`);
  }

  /**
   * 여러 헬퍼 한 번에 등록
   */
  public registerHelpers(helpers: Record<string, Handlebars.HelperDelegate>): void {
    Object.entries(helpers).forEach(([name, helper]) => {
      this.registerHelper(name, helper);
    });
  }

  /**
   * 파셜 등록
   */
  public registerPartial(name: string, template: string): void {
    this.handlebars.registerPartial(name, template);
    this.logger.debug(`Registered partial: ${name}`);
  }

  /**
   * 여러 파셜 한 번에 등록
   */
  public registerPartials(partials: Record<string, string>): void {
    Object.entries(partials).forEach(([name, template]) => {
      this.registerPartial(name, template);
    });
  }

  /**
   * 커스텀 헬퍼 등록 (런타임에 추가 헬퍼 등록 가능)
   */
  public registerCustomHelper(name: string, fn: (...args: any[]) => any): void {
    this.registerHelper(name, fn as Handlebars.HelperDelegate);
  }

  /**
   * 헬퍼 제거
   */
  public unregisterHelper(name: string): void {
    this.handlebars.unregisterHelper(name);
    this.logger.debug(`Unregistered helper: ${name}`);
  }

  /**
   * 파셜 제거
   */
  public unregisterPartial(name: string): void {
    this.handlebars.unregisterPartial(name);
    this.logger.debug(`Unregistered partial: ${name}`);
  }

  /**
   * Handlebars 인스턴스 반환 (Express 설정 시 필요)
   */
  public getHandlebars(): typeof Handlebars {
    return this.handlebars;
  }

  /**
   * 템플릿 컴파일 (캐싱용)
   */
  public compile(template: string): Handlebars.TemplateDelegate {
    return this.handlebars.compile(template);
  }

  /**
   * 템플릿 프리컴파일 (클라이언트 전송용)
   */
  public precompile(template: string): string {
    return this.handlebars.precompile(template) as string;
  }

  /**
   * Safe String 생성 (HTML 이스케이프 방지)
   */
  public safeString(str: string): Handlebars.SafeString {
    return new this.handlebars.SafeString(str);
  }

  /**
   * 헬퍼 존재 여부 확인
   */
  public hasHelper(name: string): boolean {
    return this.handlebars.helpers.hasOwnProperty(name);
  }

  /**
   * 파셜 존재 여부 확인
   */
  public hasPartial(name: string): boolean {
    return this.handlebars.partials.hasOwnProperty(name);
  }

  /**
   * 등록된 모든 헬퍼 이름 반환
   */
  public getHelperNames(): string[] {
    return Object.keys(this.handlebars.helpers);
  }

  /**
   * 등록된 모든 파셜 이름 반환
   */
  public getPartialNames(): string[] {
    return Object.keys(this.handlebars.partials);
  }
}