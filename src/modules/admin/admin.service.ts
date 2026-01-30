import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Skill } from '../skills/entities/skill.entity';
import { Report } from './entities/report.entity';
import { BanUserDto } from './dto/ban-user.dto';
import { ResolveReportDto } from './dto/resolve-report.dto';
import { SkillStatus } from '../../common/enums/skill-status.enum';
import { AdminQueryDto } from './dto/admin-query.dto';
import { ReportStatus } from 'src/common/enums/report-status.enum';
import { CreateReportDto } from '../reports/dto/create-report.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Skill)
    private skillRepository: Repository<Skill>,
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
  ) {}

  /**
   * Get all users with pagination and search
   */
  async getAllUsers(queryDto: AdminQueryDto) {
    const { page = 1, limit = 10, search } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (search) {
      queryBuilder.where(
        '(user.email LIKE :search OR user.firstName LIKE :search OR user.lastName LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('user.createdAt', 'DESC')
      .getManyAndCount();

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async banUser(userId: string, banUserDto: BanUserDto, adminId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (user.isBanned) {
      throw new BadRequestException('User is already banned');
    }

    user.isBanned = true;
    await this.userRepository.save(user);

    console.log(
      `[ADMIN ACTION] User ${userId} banned by admin ${adminId}. Reason: ${banUserDto.reason}`,
    );

    return {
      message: 'User banned successfully',
      user,
    };
  }

  async unbanUser(userId: string, adminId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (!user.isBanned) {
      throw new BadRequestException('User is not banned');
    }

    user.isBanned = false;
    await this.userRepository.save(user);

    console.log(`[ADMIN ACTION] User ${userId} unbanned by admin ${adminId}`);

    return {
      message: 'User unbanned successfully',
      user,
    };
  }

  async deleteSkill(skillId: string, adminId: string) {
    const skill = await this.skillRepository.findOne({
      where: { id: skillId },
      relations: ['user'],
    });

    if (!skill) {
      throw new NotFoundException(`Skill with ID ${skillId} not found`);
    }

    if (skill.status === SkillStatus.DELETED) {
      throw new BadRequestException('Skill is already deleted');
    }

    skill.status = SkillStatus.DELETED;
    await this.skillRepository.save(skill);

    console.log(`[ADMIN ACTION] Skill ${skillId} deleted by admin ${adminId}`);

    return {
      message: 'Skill deleted successfully',
      skill,
    };
  }

  async getReports(queryDto: AdminQueryDto) {
    const { page = 1, limit = 10, status } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.reportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.reporter', 'reporter');

    if (status) {
      queryBuilder.where('report.status = :status', { status });
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('report.createdAt', 'DESC')
      .getManyAndCount();

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createReport(createReportDto: CreateReportDto, reporterId: string) {
    const reporter = await this.userRepository.findOne({
      where: { id: reporterId },
    });

    if (!reporter) {
      throw new NotFoundException('Reporter not found');
    }

    const report = this.reportRepository.create({
      ...createReportDto,
      reporter,
    });

    return await this.reportRepository.save(report);
  }

  async resolveReport(
    reportId: string,
    resolveReportDto: ResolveReportDto,
    adminId: string,
  ) {
    const report = await this.reportRepository.findOne({
      where: { id: reportId },
      relations: ['reporter'],
    });

    if (!report) {
      throw new NotFoundException(`Report with ID ${reportId} not found`);
    }

    report.status = resolveReportDto.status;
    report.resolvedBy = adminId;
    report.adminNotes = resolveReportDto.adminNotes;

    await this.reportRepository.save(report);

    console.log(
      `[ADMIN ACTION] Report ${reportId} resolved by admin ${adminId} with status ${resolveReportDto.status}`,
    );

    return {
      message: 'Report resolved successfully',
      report,
    };
  }

  async getStatistics() {
    const totalUsers = await this.userRepository.count();
    const bannedUsers = await this.userRepository.count({
      where: { isBanned: true },
    });
    const activeSkills = await this.skillRepository.count({
      where: { status: SkillStatus.ACTIVE },
    });
    const pendingReports = await this.reportRepository.count({
      where: { status: ReportStatus.PENDING },
    });

    return {
      totalUsers,
      bannedUsers,
      activeUsers: totalUsers - bannedUsers,
      activeSkills,
      pendingReports,
    };
  }
}
