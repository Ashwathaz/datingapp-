import { Global, Module } from '@nestjs/common';
import { AuditService } from './services/audit.service';
import { DatabaseService } from './services/database.service';

@Global()
@Module({
  providers: [DatabaseService, AuditService],
  exports: [DatabaseService, AuditService],
})
export class CommonModule {}

