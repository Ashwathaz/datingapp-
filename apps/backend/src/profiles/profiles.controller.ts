import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import {
  BioDto,
  EntertainmentDto,
  InterestsDto,
  LifestyleDto,
  PersonalInfoDto,
  PreferencesDto,
  WorkEducationDto,
} from './dto';
import { ProfilesService } from './profiles.service';

@ApiTags('profiles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profiles: ProfilesService) {}

  @Get('me')
  get(@CurrentUser() user: CurrentUser) {
    return this.profiles.getProfile(user.sub);
  }

  @Patch('personal')
  personal(@CurrentUser() user: CurrentUser, @Body() dto: PersonalInfoDto) {
    return this.profiles.upsertPersonal(user.sub, dto);
  }

  @Patch('preferences')
  preferences(@CurrentUser() user: CurrentUser, @Body() dto: PreferencesDto) {
    return this.profiles.upsertPreferences(user.sub, dto);
  }

  @Patch('work-education')
  work(@CurrentUser() user: CurrentUser, @Body() dto: WorkEducationDto) {
    return this.profiles.upsertWork(user.sub, dto);
  }

  @Patch('lifestyle')
  lifestyle(@CurrentUser() user: CurrentUser, @Body() dto: LifestyleDto) {
    return this.profiles.upsertLifestyle(user.sub, dto);
  }

  @Patch('interests')
  interests(@CurrentUser() user: CurrentUser, @Body() dto: InterestsDto) {
    return this.profiles.setInterests(user.sub, dto);
  }

  @Patch('entertainment')
  entertainment(@CurrentUser() user: CurrentUser, @Body() dto: EntertainmentDto) {
    return this.profiles.upsertEntertainment(user.sub, dto);
  }

  @Patch('bio')
  bio(@CurrentUser() user: CurrentUser, @Body() dto: BioDto) {
    return this.profiles.upsertBio(user.sub, dto);
  }
}

