import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { VerificationModule } from '../verification/verification.module';
import { MatchingController } from './matching.controller';
import { MatchingService } from './matching.service';

@Module({
  imports: [JwtModule.register({}), VerificationModule],
  controllers: [MatchingController],
  providers: [MatchingService],
})
export class MatchingModule {}

