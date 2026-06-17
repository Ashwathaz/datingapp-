import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../common/guards/roles.guard';
import { AdminService } from './admin.service';

class StatusDto {
  @IsString() status!: string;
}

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin', 'moderator', 'verification_agent', 'support_agent')
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('dashboard')
  dashboard() {
    return this.admin.dashboard();
  }

  @Get('review-queue')
  reviewQueue(@Query('type') type = 'media') {
    return this.admin.reviewQueue(type);
  }

  @Roles('super_admin', 'moderator')
  @Patch('users/:id/status')
  status(@CurrentUser() user: CurrentUser, @Param('id') id: string, @Body() dto: StatusDto) {
    return this.admin.setUserStatus(user.sub, id, dto.status);
  }
}

