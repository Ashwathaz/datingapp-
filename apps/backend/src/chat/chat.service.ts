import { ForbiddenException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../common/services/database.service';

@Injectable()
export class ChatService {
  constructor(private readonly db: DatabaseService) {}

  async send(senderId: string, matchId: string, content: string, mediaUrl?: string) {
    await this.ensureMatchParticipant(senderId, matchId);
    const safetyResponse = await fetch(`${process.env.AI_SERVICE_URL ?? 'http://localhost:8000'}/v1/safety/chat`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ user_id: senderId, message: content }),
    });
    const safety = safetyResponse.ok ? await safetyResponse.json() : { risk: 'unknown', flagged: true };
    const result = await this.db.query(
      `insert into messages (match_id, sender_user_id, content, media_url, safety_status, safety_payload)
       values ($1, $2, $3, $4, $5, $6) returning *`,
      [matchId, senderId, content, mediaUrl ?? null, safety.flagged ? 'flagged' : 'clear', safety],
    );
    if (safety.flagged) {
      await this.db.query(
        `insert into reports (reporter_user_id, reported_user_id, reason, status, metadata)
         values ($1, $2, $3, 'open', $4)`,
        [senderId, senderId, `Automated chat safety: ${safety.risk}`, safety],
      );
    }
    return result.rows[0];
  }

  async list(userId: string, matchId: string) {
    await this.ensureMatchParticipant(userId, matchId);
    const result = await this.db.query(
      `select * from messages where match_id = $1 and deleted_at is null order by created_at asc limit 200`,
      [matchId],
    );
    return result.rows;
  }

  async ensureMatchParticipant(userId: string, matchId: string) {
    const match = await this.db.query(
      'select 1 from matches where id = $1 and $2 in (user_a_id::text, user_b_id::text) and status = $3',
      [matchId, userId, 'active'],
    );
    if (!match.rowCount) throw new ForbiddenException('Chat is locked until a mutual match exists');
  }
}

