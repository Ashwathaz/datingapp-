import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../common/services/database.service';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly db: DatabaseService) {}

  plans() {
    return [
      { code: 'monthly', name: 'Monthly', interval: 'month', features: ['unlimited_likes', 'advanced_filters', 'see_who_liked_you'] },
      { code: 'quarterly', name: 'Quarterly', interval: 'quarter', features: ['travel_mode', 'incognito_mode', 'profile_boost'] },
      { code: 'yearly', name: 'Yearly', interval: 'year', features: ['priority_support', 'profile_boost', 'advanced_filters'] },
    ];
  }

  async activateStub(userId: string, planCode: string) {
    const result = await this.db.query(
      `insert into subscriptions (user_id, plan_code, provider, provider_subscription_id, status, current_period_start, current_period_end)
       values ($1, $2, 'stub', gen_random_uuid()::text, 'active', now(), now() + interval '30 days')
       returning *`,
      [userId, planCode],
    );
    return result.rows[0];
  }
}

