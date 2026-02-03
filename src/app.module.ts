import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './config/database.config';
import { UsersModule } from './modules/users/users.module';
import { SkillsModule } from './modules/skills/skills.module';
import { ChatModule } from './modules/chat/chat.module';
import { AuthModule } from './auth/auth.module';
import { RequestsModule } from './modules/requests/requests.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AdminModule } from './modules/admin/admin.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { BanCheckInterceptor } from './modules/admin/interceptors/ban-check.interceptor';
import { ReportsModule } from './modules/reports/reports.module';
import { RatingsModule } from './modules/ratings/ratings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],  // ⬅️ important
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => getDatabaseConfig(configService),
    }),
    UsersModule,
    AdminModule,
    SkillsModule,
    AuthModule,
    RequestsModule,
    ChatModule,
    NotificationsModule,
    ReportsModule,
    RatingsModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: BanCheckInterceptor,
    },
  ],
})
export class AppModule {}
