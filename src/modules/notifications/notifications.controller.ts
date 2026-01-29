import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GetUser } from '../../auth/decorators/get-user.decorator';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getMyNotifications(@GetUser('id') userId: string) {
    return await this.notificationsService.findByUser(userId);
  }

  @Get('unread-count')
  async getUnreadCount(@GetUser('id') userId: string) {
    const count = await this.notificationsService.countUnread(userId);
    return { count };
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    await this.notificationsService.markAsRead(id);
    return { success: true };
  }

  @Patch('read-all')
  async markAllAsRead(@GetUser('id') userId: string) {
    await this.notificationsService.markAllAsRead(userId);
    return { success: true };
  }
}