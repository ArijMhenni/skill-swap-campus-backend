import { Test, TestingModule } from '@nestjs/testing';
import { SkillsService } from './skills.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Skill } from './entities/skill.entity';
import { Repository } from 'typeorm';
import { SkillCategory } from '../../common/enums/skill-category.enum';
import { SkillType } from '../../common/enums/skill-type.enum';
import { SkillStatus } from '../../common/enums/skill-status.enum';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('SkillsService', () => {
  let service: SkillsService;
  let repository: Repository<Skill>;

  const mockSkillRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockSkill: Partial<Skill> = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Introduction to React',
    description: 'Learn the basics of React',
    category: SkillCategory.TECH,
    type: SkillType.OFFER,
    estimatedTime: 10,
    status: SkillStatus.ACTIVE,
    user: {
      id: 'user-123',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
    } as any,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillsService,
        {
          provide: getRepositoryToken(Skill),
          useValue: mockSkillRepository,
        },
      ],
    }).compile();

    service = module.get<SkillsService>(SkillsService);
    repository = module.get<Repository<Skill>>(getRepositoryToken(Skill));

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new skill successfully', async () => {
      const createSkillDto = {
        title: 'Introduction to React',
        description: 'Learn the basics of React',
        category: SkillCategory.TECH,
        type: SkillType.OFFER,
        estimatedTime: 10,
      };
      const userId = 'user-123';

      mockSkillRepository.create.mockReturnValue(mockSkill);
      mockSkillRepository.save.mockResolvedValue(mockSkill);

      const result = await service.create(createSkillDto, userId);

      expect(mockSkillRepository.create).toHaveBeenCalledWith({
        ...createSkillDto,
        user: { id: userId },
      });
      expect(mockSkillRepository.save).toHaveBeenCalledWith(mockSkill);
      expect(result).toEqual(mockSkill);
    });

    it('should create a skill with all valid categories', async () => {
      const categories = Object.values(SkillCategory);

      for (const category of categories) {
        const createSkillDto = {
          title: `Skill in ${category}`,
          description: 'Test description',
          category: category,
          type: SkillType.OFFER,
          estimatedTime: 5,
        };

        mockSkillRepository.create.mockReturnValue({
          ...mockSkill,
          category,
        });
        mockSkillRepository.save.mockResolvedValue({
          ...mockSkill,
          category,
        });

        const result = await service.create(createSkillDto, 'user-123');
        expect(result.category).toBe(category);
      }
    });
  });

  describe('findAll', () => {
    it('should return paginated skills without filters', async () => {
      const mockSkills = [mockSkill, { ...mockSkill, id: 'skill-2' }];
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockSkills, 2]),
      };

      mockSkillRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const filterDto = { page: 1, limit: 10 };
      const result = await service.findAll(filterDto);

      expect(result).toEqual({
        data: mockSkills,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      });
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'skill.status = :status',
        { status: SkillStatus.ACTIVE },
      );
    });

    it('should filter skills by category', async () => {
      const mockSkills = [mockSkill];
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockSkills, 1]),
      };

      mockSkillRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const filterDto = {
        category: SkillCategory.TECH,
        page: 1,
        limit: 10,
      };
      const result = await service.findAll(filterDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'skill.category = :category',
        { category: SkillCategory.TECH },
      );
      expect(result.data).toEqual(mockSkills);
    });

    it('should filter skills by type', async () => {
      const mockSkills = [mockSkill];
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockSkills, 1]),
      };

      mockSkillRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const filterDto = {
        type: SkillType.OFFER,
        page: 1,
        limit: 10,
      };
      const result = await service.findAll(filterDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'skill.type = :type',
        { type: SkillType.OFFER },
      );
      expect(result.data).toEqual(mockSkills);
    });

    it('should filter skills by search term', async () => {
      const mockSkills = [mockSkill];
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockSkills, 1]),
      };

      mockSkillRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const filterDto = {
        search: 'React',
        page: 1,
        limit: 10,
      };
      const result = await service.findAll(filterDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(skill.title LIKE :search OR skill.description LIKE :search)',
        { search: '%React%' },
      );
      expect(result.data).toEqual(mockSkills);
    });

    it('should handle pagination correctly', async () => {
      const mockSkills = Array(5).fill(mockSkill);
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockSkills, 25]),
      };

      mockSkillRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const filterDto = { page: 2, limit: 5 };
      const result = await service.findAll(filterDto);

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(5); // (page - 1) * limit
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(5);
      expect(result.pagination).toEqual({
        page: 2,
        limit: 5,
        total: 25,
        totalPages: 5,
      });
    });

    it('should apply multiple filters together', async () => {
      const mockSkills = [mockSkill];
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockSkills, 1]),
      };

      mockSkillRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const filterDto = {
        category: SkillCategory.TECH,
        type: SkillType.OFFER,
        search: 'React',
        page: 1,
        limit: 10,
      };
      await service.findAll(filterDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(3);
    });
  });

  describe('findOne', () => {
    it('should return a skill by id', async () => {
      mockSkillRepository.findOne.mockResolvedValue(mockSkill);

      const result = await service.findOne('123e4567-e89b-12d3-a456-426614174000');

      expect(mockSkillRepository.findOne).toHaveBeenCalledWith({
        where: { id: '123e4567-e89b-12d3-a456-426614174000' },
        relations: ['user'],
      });
      expect(result).toEqual(mockSkill);
    });

    it('should throw NotFoundException if skill not found', async () => {
      mockSkillRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a skill successfully', async () => {
      const updateDto = { title: 'Advanced React' };
      const updatedSkill = { ...mockSkill, ...updateDto };

      mockSkillRepository.findOne.mockResolvedValue(mockSkill);
      mockSkillRepository.save.mockResolvedValue(updatedSkill);

      const result = await service.update('skill-123', updateDto, 'user-123');

      expect(result.title).toBe('Advanced React');
    });

    it('should throw ForbiddenException if user is not the owner', async () => {
      mockSkillRepository.findOne.mockResolvedValue(mockSkill);

      await expect(
        service.update('skill-123', { title: 'New Title' }, 'different-user'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if skill does not exist', async () => {
      mockSkillRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent', { title: 'New Title' }, 'user-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should soft delete a skill by changing status to DELETED', async () => {
      mockSkillRepository.findOne.mockResolvedValue(mockSkill);
      mockSkillRepository.save.mockResolvedValue({
        ...mockSkill,
        status: SkillStatus.DELETED,
      });

      await service.delete('skill-123', 'user-123');

      expect(mockSkillRepository.save).toHaveBeenCalledWith({
        ...mockSkill,
        status: SkillStatus.DELETED,
      });
    });

    it('should throw ForbiddenException if user is not the owner', async () => {
      mockSkillRepository.findOne.mockResolvedValue(mockSkill);

      await expect(
        service.delete('skill-123', 'different-user'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if skill does not exist', async () => {
      mockSkillRepository.findOne.mockResolvedValue(null);

      await expect(service.delete('non-existent', 'user-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByUser', () => {
    it('should return all skills for a specific user', async () => {
      const userSkills = [mockSkill, { ...mockSkill, id: 'skill-2' }];
      mockSkillRepository.find.mockResolvedValue(userSkills);

      const result = await service.findByUser('user-123');

      expect(mockSkillRepository.find).toHaveBeenCalledWith({
        where: { user: { id: 'user-123' } },
        relations: ['user'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(userSkills);
    });

    it('should return empty array if user has no skills', async () => {
      mockSkillRepository.find.mockResolvedValue([]);

      const result = await service.findByUser('user-without-skills');

      expect(result).toEqual([]);
    });
  });
});
