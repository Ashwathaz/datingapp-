import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

class DeviceDto {
  @IsString() token!: string;
  @IsIn(['ios', 'android', 'web']) platform!: string;
}

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Post('devices')
  device(@CurrentUser() user: CurrentUser, @Body() dto: DeviceDto) {
    return this.notifications.registerDevice(user.sub, dto.token, dto.platform);
  }

  @Get()
  list(@CurrentUser() user: CurrentUser) {
    return this.notifications.list(user.sub);
  }
}

