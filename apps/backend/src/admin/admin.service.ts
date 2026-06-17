import { Injectable } from '@nestjs/common';
import { AuditService } from '../common/services/audit.service';
import { DatabaseService } from '../common/services/database.service';

@Injectable()
export class AdminService {
  constructor(private readonly db: DatabaseService, private readonly audit: AuditService) {}

  async dashboard() {
    const [users, reports, revenue, trust] = await Promise.all([
      this.db.query("select count(*) from users where status <> 'deleted'"),
      this.db.query("select count(*) from reports where status in ('open', 'in_review')"),
      this.db.query("select count(*) from subscriptions where status = 'active'"),
      this.db.query('select coalesce(avg(total_score), 0) as avg from trust_scores'),
    ]);
    return {
      users: Number(users.rows[0].count),
      openReports: Number(reports.rows[0].count),
      activeSubscriptions: Number(revenue.rows[0].count),
      averageTrustScore: Number(trust.rows[0].avg),
    };
  }

  async reviewQueue(type: string) {
    if (type === 'verification') {
      const result = await this.db.query(
        `select uv.*, u.username from user_verifications uv join users u on u.id = uv.user_id
         where uv.status in ('pending', 'pending_review') order by uv.created_at asc limit 100`,
      );
      return result.rows;
    }
    const result = await this.db.query(
      `select ma.*, u.username from media_assets ma join users u on u.id = ma.user_id
       where ma.moderation_status = 'flagged' order by ma.created_at asc limit 100`,
    );
    return result.rows;
  }

  async setUserStatus(actorUserId: string, userId: string, status: string) {
    const result = await this.db.query('update users set status = $2 where id = $1 returning id, status', [userId, status]);
    await this.audit.record({ actorUserId, action: 'admin.user.status', entityType: 'user', entityId: userId, metadata: { status } });
    return result.rows[0];
  }
}

