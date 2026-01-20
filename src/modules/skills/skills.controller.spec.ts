import { Test, TestingModule } from '@nestjs/testing';
import { SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { FilterSkillDto } from './dto/filter-skill.dto';
import { SkillCategory } from '../../common/enums/skill-category.enum';
import { SkillType } from '../../common/enums/skill-type.enum';
import { SkillStatus } from '../../common/enums/skill-status.enum';

describe('SkillsController', () => {
  let controller: SkillsController;
  let service: SkillsService;

  const mockSkillsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findByUser: jest.fn(),
  };

  const mockSkill = {
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
    },
    createdAt: new Date(),
  };

  const mockRequest = {
    user: { id: 'user-123' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SkillsController],
      providers: [
        {
          provide: SkillsService,
          useValue: mockSkillsService,
        },
      ],
    }).compile();

    controller = module.get<SkillsController>(SkillsController);
    service = module.get<SkillsService>(SkillsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new skill', async () => {
      const createSkillDto: CreateSkillDto = {
        title: 'Introduction to React',
        description: 'Learn the basics of React',
        category: SkillCategory.TECH,
        type: SkillType.OFFER,
        estimatedTime: 10,
      };

      mockSkillsService.create.mockResolvedValue(mockSkill);

      const result = await controller.create(createSkillDto, mockRequest);

      expect(service.create).toHaveBeenCalledWith(createSkillDto, 'user-123');
      expect(result).toEqual(mockSkill);
    });

    it('should use temp-user-id if no user in request', async () => {
      const createSkillDto: CreateSkillDto = {
        title: 'Test Skill',
        description: 'Test description',
        category: SkillCategory.LANGUAGES,
        type: SkillType.REQUEST,
        estimatedTime: 5,
      };

      mockSkillsService.create.mockResolvedValue(mockSkill);

      await controller.create(createSkillDto, {});

      expect(service.create).toHaveBeenCalledWith(
        createSkillDto,
        'temp-user-id',
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated skills without filters', async () => {
      const filterDto: FilterSkillDto = { page: 1, limit: 10 };
      const mockResponse = {
        data: [mockSkill],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      mockSkillsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(filterDto);

      expect(service.findAll).toHaveBeenCalledWith(filterDto);
      expect(result).toEqual(mockResponse);
    });

    it('should return filtered skills by category', async () => {
      const filterDto: FilterSkillDto = {
        category: SkillCategory.TECH,
        page: 1,
        limit: 10,
      };
      const mockResponse = {
        data: [mockSkill],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      mockSkillsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(filterDto);

      expect(service.findAll).toHaveBeenCalledWith(filterDto);
      expect(result.data[0].category).toBe(SkillCategory.TECH);
    });

    it('should return filtered skills by type', async () => {
      const filterDto: FilterSkillDto = {
        type: SkillType.OFFER,
        page: 1,
        limit: 10,
      };

      mockSkillsService.findAll.mockResolvedValue({
        data: [mockSkill],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });

      await controller.findAll(filterDto);

      expect(service.findAll).toHaveBeenCalledWith(filterDto);
    });

    it('should return filtered skills by search term', async () => {
      const filterDto: FilterSkillDto = {
        search: 'React',
        page: 1,
        limit: 10,
      };

      mockSkillsService.findAll.mockResolvedValue({
        data: [mockSkill],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });

      await controller.findAll(filterDto);

      expect(service.findAll).toHaveBeenCalledWith(filterDto);
    });

    it('should handle custom pagination parameters', async () => {
      const filterDto: FilterSkillDto = {
        page: 3,
        limit: 20,
      };

      mockSkillsService.findAll.mockResolvedValue({
        data: [],
        pagination: { page: 3, limit: 20, total: 0, totalPages: 0 },
      });

      const result = await controller.findAll(filterDto);

      expect(service.findAll).toHaveBeenCalledWith(filterDto);
      expect(result.pagination.page).toBe(3);
      expect(result.pagination.limit).toBe(20);
    });
  });

  describe('findByUser', () => {
    it('should return all skills for a specific user', async () => {
      const userSkills = [mockSkill];
      mockSkillsService.findByUser.mockResolvedValue(userSkills);

      const result = await controller.findByUser('user-123');

      expect(service.findByUser).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(userSkills);
    });
  });

  describe('findOne', () => {
    it('should return a single skill by id', async () => {
      mockSkillsService.findOne.mockResolvedValue(mockSkill);

      const result = await controller.findOne(
        '123e4567-e89b-12d3-a456-426614174000',
      );

      expect(service.findOne).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000',
      );
      expect(result).toEqual(mockSkill);
    });
  });

  describe('update', () => {
    it('should update a skill', async () => {
      const updateSkillDto: UpdateSkillDto = {
        title: 'Advanced React',
      };
      const updatedSkill = { ...mockSkill, title: 'Advanced React' };

      mockSkillsService.update.mockResolvedValue(updatedSkill);

      const result = await controller.update(
        'skill-123',
        updateSkillDto,
        mockRequest,
      );

      expect(service.update).toHaveBeenCalledWith(
        'skill-123',
        updateSkillDto,
        'user-123',
      );
      expect(result.title).toBe('Advanced React');
    });

    it('should use temp-user-id if no user in request', async () => {
      const updateSkillDto: UpdateSkillDto = { title: 'New Title' };

      mockSkillsService.update.mockResolvedValue(mockSkill);

      await controller.update('skill-123', updateSkillDto, {});

      expect(service.update).toHaveBeenCalledWith(
        'skill-123',
        updateSkillDto,
        'temp-user-id',
      );
    });
  });

  describe('delete', () => {
    it('should delete a skill', async () => {
      mockSkillsService.delete.mockResolvedValue(undefined);

      await controller.delete('skill-123', mockRequest);

      expect(service.delete).toHaveBeenCalledWith('skill-123', 'user-123');
    });

    it('should use temp-user-id if no user in request', async () => {
      mockSkillsService.delete.mockResolvedValue(undefined);

      await controller.delete('skill-123', {});

      expect(service.delete).toHaveBeenCalledWith(
        'skill-123',
        'temp-user-id',
      );
    });
  });
});
