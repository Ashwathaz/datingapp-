import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../common/services/database.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly db: DatabaseService) {}

  async registerDevice(userId: string, token: string, platform: string) {
    await this.db.query(
      `insert into device_tokens (user_id, token, platform)
       values ($1, $2, $3)
       on conflict (token) do update set user_id = $1, platform = $3, updated_at = now()`,
      [userId, token, platform],
    );
    return { registered: true };
  }

  async list(userId: string) {
    const result = await this.db.query(
      'select * from notifications where user_id = $1 order by created_at desc limit 100',
      [userId],
    );
    return result.rows;
  }
}

