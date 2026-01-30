import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './config/database.config';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './auth/auth.module';
import { RequestsModule } from './modules/requests/requests.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SkillsModule } from './modules/skills/skills.module';
import { AdminModule } from './modules/admin/admin.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { BanCheckInterceptor } from './modules/admin/interceptors/ban-check.interceptor';
import { ReportsModule } from './modules/reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),
    UsersModule,
    AdminModule,
    SkillsModule,
    AuthModule,
    RequestsModule,
    NotificationsModule,
    ReportsModule,
  ],
  providers: [
    // ... vos autres providers
    {
      provide: APP_INTERCEPTOR,
      useClass: BanCheckInterceptor, // ⬅️ Ajouter ceci
    },
  ],
})
export class AppModule {}
