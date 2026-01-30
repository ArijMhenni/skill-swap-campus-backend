import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { AdminQueryDto } from './dto/admin-query.dto';
import { BanUserDto } from './dto/ban-user.dto';
import { ResolveReportDto } from './dto/resolve-report.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of users retrieved successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access only' })
  async getAllUsers(@Query() queryDto: AdminQueryDto) {
    return await this.adminService.getAllUsers(queryDto);
  }

  @Patch('users/:id/ban')
  @ApiOperation({ summary: 'Ban a user (Admin only)' })
  @ApiParam({ name: 'id', description: 'User ID to ban' })
  @ApiResponse({ status: 200, description: 'User banned successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access only' })
  async banUser(
    @Param('id') userId: string,
    @Body() banUserDto: BanUserDto,
    @GetUser() admin: User,
  ) {
    return await this.adminService.banUser(userId, banUserDto, admin.id);
  }

  @Patch('users/:id/unban')
  @ApiOperation({ summary: 'Unban a user (Admin only)' })
  @ApiParam({ name: 'id', description: 'User ID to unban' })
  @ApiResponse({ status: 200, description: 'User unbanned successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access only' })
  async unbanUser(@Param('id') userId: string, @GetUser() admin: User) {
    return await this.adminService.unbanUser(userId, admin.id);
  }

  @Delete('skills/:id')
  @ApiOperation({ summary: 'Delete a skill (Admin only)' })
  @ApiParam({ name: 'id', description: 'Skill ID to delete' })
  @ApiResponse({ status: 200, description: 'Skill deleted successfully' })
  @ApiResponse({ status: 404, description: 'Skill not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access only' })
  async deleteSkill(@Param('id') skillId: string, @GetUser() admin: User) {
    return await this.adminService.deleteSkill(skillId, admin.id);
  }

  @Get('reports')
  @ApiOperation({ summary: 'Get all reports (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of reports retrieved successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access only' })
  async getReports(@Query() queryDto: AdminQueryDto) {
    return await this.adminService.getReports(queryDto);
  }

  @Patch('reports/:id/resolve')
  @ApiOperation({ summary: 'Resolve a report (Admin only)' })
  @ApiParam({ name: 'id', description: 'Report ID to resolve' })
  @ApiResponse({ status: 200, description: 'Report resolved successfully' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access only' })
  async resolveReport(
    @Param('id') reportId: string,
    @Body() resolveReportDto: ResolveReportDto,
    @GetUser() admin: User,
  ) {
    return await this.adminService.resolveReport(
      reportId,
      resolveReportDto,
      admin.id,
    );
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get platform statistics (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Platform statistics retrieved successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access only' })
  async getStatistics() {
    return await this.adminService.getStatistics();
  }
}
