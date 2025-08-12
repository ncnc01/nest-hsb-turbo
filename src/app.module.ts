import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { DashboardModule } from "./modules/dashboard/dashboard.module";

import { AuthModule } from "./modules/auth/auth.module";
import { InquiryModule } from "./modules/inquiry/inquiry.module";
import { HandlebarsModule } from "./common/handlebars/handlebars.module";
import { DevReloadModule } from "./modules/dev-reload/dev-reload.module";
import { DevToolsModule } from './dev-tools/dev-tools.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "public"),
      serveRoot: "/public/",
    }),
    HandlebarsModule,
    ...(process.env.NODE_ENV !== 'production' ? [DevReloadModule] : []),
    AuthModule,
    DashboardModule,
    InquiryModule,
    DevToolsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
