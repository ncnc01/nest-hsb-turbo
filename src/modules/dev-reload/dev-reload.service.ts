import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { watch, FSWatcher } from 'chokidar';
import { join } from 'path';
import * as fs from 'fs';
import { DevReloadGateway } from './dev-reload.gateway';

@Injectable()
export class DevReloadService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DevReloadService.name);
  private watcher: FSWatcher;
  private readonly viewsPath = join(process.cwd(), 'views');
  private readonly publicPath = join(process.cwd(), 'public');

  constructor(private readonly gateway: DevReloadGateway) {}

  onModuleInit() {
    if (process.env.NODE_ENV !== 'production') {
      this.startWatching();
    }
  }

  private startWatching() {
    this.logger.log('Starting development hot reload watcher...');

    // Watch HBS files and static assets
    this.watcher = watch(
      [
        join(this.viewsPath, '**/*.hbs'),
        join(this.publicPath, '**/*.{css,js}'),
      ],
      {
        ignored: /(^|[\/\\])\../,
        persistent: true,
        ignoreInitial: true,
      }
    );

    this.watcher
      .on('change', (path) => this.handleFileChange(path))
      .on('add', (path) => this.handleFileChange(path))
      .on('unlink', (path) => this.handleFileChange(path))
      .on('error', (error) => this.logger.error(`Watcher error: ${error.message}`));

    this.logger.log('Hot reload watcher started');
  }

  private handleFileChange(filePath: string) {
    const relativePath = filePath.replace(process.cwd(), '');
    this.logger.debug(`File changed: ${relativePath}`);

    // Determine the type of change
    if (filePath.endsWith('.hbs')) {
      this.handleTemplateChange(filePath);
    } else if (filePath.endsWith('.css')) {
      this.handleStyleChange(filePath);
    } else if (filePath.endsWith('.js')) {
      this.handleScriptChange(filePath);
    }
  }

  private handleTemplateChange(filePath: string) {
    // For HBS changes, we'll trigger a Turbo reload
    const isPartial = filePath.includes('partials');
    const isLayout = filePath.includes('layouts');
    
    if (isPartial) {
      // Re-register partial and force reload
      this.reloadPartial(filePath);
      this.gateway.sendReloadCommand('full-reload');
    } else if (isLayout) {
      // Full page reload for layout changes
      this.gateway.sendReloadCommand('full-reload');
    } else {
      // Turbo frame reload for page content changes
      const frameName = this.extractFrameName(filePath);
      this.gateway.sendReloadCommand('turbo-reload', { frame: frameName });
    }
  }

  private reloadPartial(filePath: string) {
    try {
      const partialName = this.getPartialName(filePath);
      if (partialName && fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Re-register to both Express HBS and HandlebarsService
        const hbs = require('hbs');
        hbs.registerPartial(partialName, content);
        
        // Clear Express view cache
        this.clearExpressCache();
        
        this.logger.debug(`Reloaded partial: ${partialName}`);
      }
    } catch (error) {
      this.logger.error(`Failed to reload partial: ${error.message}`);
    }
  }

  private clearExpressCache() {
    try {
      // Clear Express cache - try multiple methods
      if (global['app']) {
        const app = global['app'];
        
        // Clear view cache
        if (app.cache) {
          Object.keys(app.cache).forEach(key => {
            if (key.includes('.hbs') || key.includes('handlebars')) {
              delete app.cache[key];
            }
          });
        }

        // Clear engine cache
        if (app.engines && app.engines['.hbs']) {
          app.engines['.hbs'].cache = {};
        }
      }
      
      // Clear require cache for HBS files
      Object.keys(require.cache).forEach(key => {
        if (key.includes('.hbs')) {
          delete require.cache[key];
        }
      });
      
      this.logger.debug('Cleared Express cache');
    } catch (error) {
      this.logger.warn(`Failed to clear Express cache: ${error.message}`);
    }
  }

  private getPartialName(filePath: string): string | null {
    const match = filePath.match(/partials[\/\\](.+)\.hbs$/);
    if (match) {
      return match[1].replace(/[\/\\]/g, '/');
    }
    return null;
  }

  private handleStyleChange(filePath: string) {
    // For CSS changes, we can update styles without page reload
    this.gateway.sendReloadCommand('style-reload', { 
      path: filePath.replace(this.publicPath, '/public') 
    });
  }

  private handleScriptChange(filePath: string) {
    // For JS changes, use Turbo to reload
    this.gateway.sendReloadCommand('turbo-reload', { frame: '_top' });
  }

  private extractFrameName(filePath: string): string {
    // Try to determine the Turbo frame from the file path
    // Default to main-content if we can't determine
    if (filePath.includes('dashboard')) return 'main-content';
    if (filePath.includes('inquiry')) return 'main-content';
    if (filePath.includes('auth')) return '_top';
    
    return 'main-content';
  }

  onModuleDestroy() {
    if (this.watcher) {
      this.watcher.close();
      this.logger.log('Hot reload watcher stopped');
    }
  }
}