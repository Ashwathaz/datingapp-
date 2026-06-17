import { Injectable } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Injectable()
export class AuditService {
  constructor(private readonly db: DatabaseService) {}

  async record(input: {
    actorUserId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    metadata?: Record<string, unknown>;
  }) {
    await this.db.query(
      `insert into audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
       values ($1, $2, $3, $4, $5)`,
      [
        input.actorUserId ?? null,
        input.action,
        input.entityType,
        input.entityId ?? null,
        input.metadata ?? {},
      ],
    );
  }
}

