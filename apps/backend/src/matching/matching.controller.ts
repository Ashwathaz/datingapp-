import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { DiscoveryActionDto } from './dto';
import { MatchingService } from './matching.service';

@ApiTags('matching')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('matching')
export class MatchingController {
  constructor(private readonly matching: MatchingService) {}

  @Get('recommendations')
  recommendations(@CurrentUser() user: CurrentUser, @Query('threshold') threshold?: string) {
    return this.matching.recommendations(user.sub, threshold ? Number(threshold) : 75);
  }

  @Post('actions')
  action(@CurrentUser() user: CurrentUser, @Body() dto: DiscoveryActionDto) {
    return this.matching.act(user.sub, dto.targetUserId, dto.action);
  }
}

