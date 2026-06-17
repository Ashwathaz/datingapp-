import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TrustController } from './trust.controller';
import { TrustService } from './trust.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [TrustController],
  providers: [TrustService],
  exports: [TrustService],
})
export class TrustModule {}

