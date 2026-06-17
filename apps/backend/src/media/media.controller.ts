import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { MediaUploadDto } from './dto';
import { MediaService } from './media.service';

@ApiTags('media')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('media')
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @Post()
  add(@CurrentUser() user: CurrentUser, @Body() dto: MediaUploadDto) {
    return this.media.add(user.sub, dto);
  }

  @Get('requirements')
  requirements(@CurrentUser() user: CurrentUser) {
    return this.media.requirements(user.sub);
  }
}

