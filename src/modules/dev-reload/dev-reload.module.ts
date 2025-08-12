import { Module } from '@nestjs/common';
import { DevReloadGateway } from './dev-reload.gateway';
import { DevReloadService } from './dev-reload.service';

@Module({
  providers: [DevReloadGateway, DevReloadService],
  exports: [DevReloadService],
})
export class DevReloadModule {}