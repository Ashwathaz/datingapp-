import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../common/guards/roles.guard';
import { ModerateDto, ReportDto } from './dto';
import { ModerationService } from './moderation.service';

@ApiTags('moderation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('moderation')
export class ModerationController {
  constructor(private readonly moderation: ModerationService) {}

  @Post('reports')
  report(@CurrentUser() user: CurrentUser, @Body() dto: ReportDto) {
    return this.moderation.report(user.sub, dto.reportedUserId, dto.reason, dto.details);
  }

  @UseGuards(RolesGuard)
  @Roles('super_admin', 'moderator')
  @Get('queue')
  queue() {
    return this.moderation.queue();
  }

  @UseGuards(RolesGuard)
  @Roles('super_admin', 'moderator')
  @Patch('reports/:id')
  update(@CurrentUser() user: CurrentUser, @Param('id') id: string, @Body() dto: ModerateDto) {
    return this.moderation.update(user.sub, id, dto.status, dto.note);
  }
}

