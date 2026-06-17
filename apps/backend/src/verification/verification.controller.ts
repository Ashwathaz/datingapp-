import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { IdVerificationDto, ReferenceDto, SelfieVerificationDto, SocialVerificationDto } from './dto';
import { VerificationService } from './verification.service';

@ApiTags('verification')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('verification')
export class VerificationController {
  constructor(private readonly verification: VerificationService) {}

  @Get('matching-eligibility')
  eligible(@CurrentUser() user: CurrentUser) {
    return this.verification.matchingEligibility(user.sub);
  }

  @Post('government-id')
  id(@CurrentUser() user: CurrentUser, @Body() dto: IdVerificationDto) {
    return this.verification.submitGovernmentId(user.sub, dto);
  }

  @Post('selfie')
  selfie(@CurrentUser() user: CurrentUser, @Body() dto: SelfieVerificationDto) {
    return this.verification.submitSelfie(user.sub, dto);
  }

  @Post('social')
  social(@CurrentUser() user: CurrentUser, @Body() dto: SocialVerificationDto) {
    return this.verification.submitSocial(user.sub, dto);
  }

  @Post('reference')
  reference(@CurrentUser() user: CurrentUser, @Body() dto: ReferenceDto) {
    return this.verification.submitReference(user.sub, dto);
  }
}

