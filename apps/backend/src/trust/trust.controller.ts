import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TrustService } from './trust.service';

@ApiTags('trust')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('trust')
export class TrustController {
  constructor(private readonly trust: TrustService) {}

  @Post('recalculate')
  recalculate(@CurrentUser() user: CurrentUser) {
    return this.trust.recalculate(user.sub);
  }

  @Get('me')
  me(@CurrentUser() user: CurrentUser) {
    return this.trust.recalculate(user.sub);
  }
}

