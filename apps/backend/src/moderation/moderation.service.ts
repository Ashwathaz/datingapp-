import { Injectable } from '@nestjs/common';
import { AuditService } from '../common/services/audit.service';
import { DatabaseService } from '../common/services/database.service';

@Injectable()
export class ModerationService {
  constructor(private readonly db: DatabaseService, private readonly audit: AuditService) {}

  async report(reporterUserId: string, reportedUserId: string, reason: string, details: string) {
    const result = await this.db.query(
      `insert into reports (reporter_user_id, reported_user_id, reason, details, status)
       values ($1, $2, $3, $4, 'open') returning *`,
      [reporterUserId, reportedUserId, reason, details],
    );
    return result.rows[0];
  }

  async queue() {
    const result = await this.db.query(
      `select r.*, u.username as reported_username
       from reports r join users u on u.id = r.reported_user_id
       where r.status in ('open', 'in_review')
       order by r.created_at asc limit 100`,
    );
    return result.rows;
  }

  async update(actorUserId: string, reportId: string, status: string, note: string) {
    const result = await this.db.query(
      `update reports set status = $2, resolution_note = $3, reviewed_by_user_id = $4, reviewed_at = now()
       where id = $1 returning *`,
      [reportId, status, note, actorUserId],
    );
    await this.audit.record({ actorUserId, action: 'moderation.report.update', entityType: 'report', entityId: reportId, metadata: { status } });
    return result.rows[0];
  }
}

