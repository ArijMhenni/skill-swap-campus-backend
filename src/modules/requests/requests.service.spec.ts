import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestsService } from './requests.service';
import { SkillRequest } from './entities/request-skill.entity';
import { RequestStatus } from '../../common/enums/request-status.enum';
import { Skill } from '../skills/entities/skill.entity';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

describe('RequestsService', () => {
  let service: RequestsService;
  let requestRepository: Repository<SkillRequest>;
  let skillRepository: Repository<Skill>;

  const mockRequestRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockSkillRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestsService,
        {
          provide: getRepositoryToken(Request),
          useValue: mockRequestRepository,
        },
        {
          provide: getRepositoryToken(Skill),
          useValue: mockSkillRepository,
        },
      ],
    }).compile();

    service = module.get<RequestsService>(RequestsService);
    requestRepository = module.get<Repository<SkillRequest>>(
      getRepositoryToken(Request),
    );
    skillRepository = module.get<Repository<Skill>>(
      getRepositoryToken(Skill),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a request successfully', async () => {
      const createDto = {
        skillId: 'skill-123',
        message: 'Je voudrais apprendre cette compétence',
      };
      const userId = 'user-456';

      const mockSkill = {
        id: 'skill-123',
        userId: 'provider-789',
        title: 'React',
      };

      const mockRequest = {
        id: 'request-111',
        skillId: createDto.skillId,
        requesterId: userId,
        providerId: mockSkill.userId,
        message: createDto.message,
        status: RequestStatus.PENDING,
      };

      mockSkillRepository.findOne.mockResolvedValue(mockSkill);
      mockRequestRepository.findOne.mockResolvedValue(null);
      mockRequestRepository.create.mockReturnValue(mockRequest);
      mockRequestRepository.save.mockResolvedValue(mockRequest);

      const result = await service.create(createDto, userId);

      expect(result).toEqual(mockRequest);
      expect(mockSkillRepository.findOne).toHaveBeenCalledWith({
        where: { id: createDto.skillId },
        relations: ['user'],
      });
      expect(mockRequestRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if skill does not exist', async () => {
      const createDto = {
        skillId: 'invalid-skill',
        message: 'Message',
      };
      const userId = 'user-456';

      mockSkillRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if requesting own skill', async () => {
      const createDto = {
        skillId: 'skill-123',
        message: 'Message',
      };
      const userId = 'user-456';

      const mockSkill = {
        id: 'skill-123',
        userId: userId, // Same as requester
        title: 'React',
      };

      mockSkillRepository.findOne.mockResolvedValue(mockSkill);

      await expect(service.create(createDto, userId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if pending request already exists', async () => {
      const createDto = {
        skillId: 'skill-123',
        message: 'Message',
      };
      const userId = 'user-456';

      const mockSkill = {
        id: 'skill-123',
        userId: 'provider-789',
        title: 'React',
      };

      const existingRequest = {
        id: 'existing-request',
        status: RequestStatus.PENDING,
      };

      mockSkillRepository.findOne.mockResolvedValue(mockSkill);
      mockRequestRepository.findOne.mockResolvedValue(existingRequest);

      await expect(service.create(createDto, userId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateStatus', () => {
    it('should allow provider to accept a pending request', async () => {
      const requestId = 'request-123';
      const providerId = 'provider-789';
      const newStatus = RequestStatus.ACCEPTED;

      const mockRequest = {
        id: requestId,
        requesterId: 'user-456',
        providerId: providerId,
        status: RequestStatus.PENDING,
      };

      mockRequestRepository.findOne.mockResolvedValue(mockRequest);
      mockRequestRepository.save.mockResolvedValue({
        ...mockRequest,
        status: newStatus,
      });

      const result = await service.updateStatus(
        requestId,
        providerId,
        newStatus,
      );

      expect(result.status).toBe(RequestStatus.ACCEPTED);
    });

    it('should throw ForbiddenException if requester tries to accept', async () => {
      const requestId = 'request-123';
      const requesterId = 'user-456';
      const newStatus = RequestStatus.ACCEPTED;

      const mockRequest = {
        id: requestId,
        requesterId: requesterId,
        providerId: 'provider-789',
        status: RequestStatus.PENDING,
      };

      mockRequestRepository.findOne.mockResolvedValue(mockRequest);

      await expect(
        service.updateStatus(requestId, requesterId, newStatus),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow requester to cancel a pending request', async () => {
      const requestId = 'request-123';
      const requesterId = 'user-456';
      const newStatus = RequestStatus.CANCELLED;

      const mockRequest = {
        id: requestId,
        requesterId: requesterId,
        providerId: 'provider-789',
        status: RequestStatus.PENDING,
      };

      mockRequestRepository.findOne.mockResolvedValue(mockRequest);
      mockRequestRepository.save.mockResolvedValue({
        ...mockRequest,
        status: newStatus,
      });

      const result = await service.updateStatus(
        requestId,
        requesterId,
        newStatus,
      );

      expect(result.status).toBe(RequestStatus.CANCELLED);
    });

    it('should allow both parties to complete an accepted request', async () => {
      const requestId = 'request-123';
      const requesterId = 'user-456';
      const newStatus = RequestStatus.COMPLETED;

      const mockRequest = {
        id: requestId,
        requesterId: requesterId,
        providerId: 'provider-789',
        status: RequestStatus.ACCEPTED,
      };

      mockRequestRepository.findOne.mockResolvedValue(mockRequest);
      mockRequestRepository.save.mockResolvedValue({
        ...mockRequest,
        status: newStatus,
      });

      const result = await service.updateStatus(
        requestId,
        requesterId,
        newStatus,
      );

      expect(result.status).toBe(RequestStatus.COMPLETED);
    });

    it('should throw BadRequestException for invalid status transition', async () => {
      const requestId = 'request-123';
      const userId = 'user-456';
      const newStatus = RequestStatus.COMPLETED;

      const mockRequest = {
        id: requestId,
        requesterId: userId,
        providerId: 'provider-789',
        status: RequestStatus.PENDING, // Can't go directly to COMPLETED
      };

      mockRequestRepository.findOne.mockResolvedValue(mockRequest);

      await expect(
        service.updateStatus(requestId, userId, newStatus),
      ).rejects.toThrow(BadRequestException);
    });
  });
});