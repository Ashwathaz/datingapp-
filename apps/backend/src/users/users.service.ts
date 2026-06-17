import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../common/services/database.service';

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService) {}

  async me(userId: string) {
    const result = await this.db.query(
      `select u.id, u.first_name, u.last_name, u.username, u.email, u.phone_number, u.role, u.status,
              coalesce(ts.total_score, 0) as trust_score
       from users u
       left join trust_scores ts on ts.user_id = u.id
       where u.id = $1`,
      [userId],
    );
    return result.rows[0];
  }
}

