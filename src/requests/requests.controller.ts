import {
  Controller,
  Get,
  Post,
  Patch,
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
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { FilterRequestDto } from './dto/filter-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestAccessGuard } from './guards/request-access.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('Requests')
@ApiBearerAuth()
@Controller('requests')
@UseGuards(JwtAuthGuard)
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle demande d\'échange' })
  @ApiResponse({
    status: 201,
    description: 'Demande créée avec succès',
  })
  @ApiResponse({
    status: 400,
    description: 'Données invalides ou demande déjà existante',
  })
  @ApiResponse({
    status: 404,
    description: 'Compétence non trouvée',
  })
  async create(
    @Body() createRequestDto: CreateRequestDto,
    @GetUser('id') userId: string,
  ) {
    return await this.requestsService.create(createRequestDto, userId);
  }

  @Get('my')
  @ApiOperation({ summary: 'Récupérer mes demandes (envoyées et reçues)' })
  @ApiResponse({
    status: 200,
    description: 'Liste des demandes récupérée avec succès',
  })
  async getMyRequests(
    @GetUser('id') userId: string,
    @Query() filters: FilterRequestDto,
  ) {
    return await this.requestsService.findMyRequests(userId, filters);
  }

  @Get(':id')
  @UseGuards(RequestAccessGuard)
  @ApiOperation({ summary: 'Récupérer les détails d\'une demande' })
  @ApiParam({
    name: 'id',
    description: 'ID de la demande',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Détails de la demande récupérés avec succès',
  })
  @ApiResponse({
    status: 403,
    description: 'Accès interdit',
  })
  @ApiResponse({
    status: 404,
    description: 'Demande non trouvée',
  })
  async getRequestById(
    @Param('id') id: string,
    @GetUser('id') userId: string,
  ) {
    return await this.requestsService.findOne(id, userId);
  }

  @Patch(':id/status')
  @UseGuards(RequestAccessGuard)
  @ApiOperation({ summary: 'Mettre à jour le statut d\'une demande' })
  @ApiParam({
    name: 'id',
    description: 'ID de la demande',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Statut mis à jour avec succès',
  })
  @ApiResponse({
    status: 400,
    description: 'Transition de statut invalide',
  })
  @ApiResponse({
    status: 403,
    description: 'Vous n\'avez pas le droit de modifier ce statut',
  })
  @ApiResponse({
    status: 404,
    description: 'Demande non trouvée',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
    @GetUser('id') userId: string,
  ) {
    return await this.requestsService.updateStatus(
      id,
      userId,
      updateStatusDto.status,
    );
  }
}