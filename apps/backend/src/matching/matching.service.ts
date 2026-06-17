import { ForbiddenException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../common/services/database.service';
import { VerificationService } from '../verification/verification.service';

@Injectable()
export class MatchingService {
  constructor(private readonly db: DatabaseService, private readonly verification: VerificationService) {}

  async recommendations(userId: string, threshold = 75) {
    const eligibility = await this.verification.matchingEligibility(userId);
    if (!eligibility.eligible) throw new ForbiddenException({ message: 'Verification required', missing: eligibility.missing });

    const result = await this.db.query(
      `with me as (select * from compatibility_profiles where user_id = $1)
       select candidate.user_id,
              candidate.summary,
              round(
                25 * relationship_overlap.score +
                20 * lifestyle_overlap.score +
                15 * interest_overlap.score +
                15 * personality_overlap.score +
                10 * location_overlap.score +
                10 * language_overlap.score +
                5 * career_overlap.score
              )::int as compatibility_score
       from compatibility_profiles candidate
       cross join me
       cross join lateral (select case when candidate.relationship_goals && me.relationship_goals then 1 else 0 end as score) relationship_overlap
       cross join lateral (select case when candidate.lifestyle_tags && me.lifestyle_tags then 1 else 0.4 end as score) lifestyle_overlap
       cross join lateral (
         select least(1, count(*)::numeric / 5) as score
         from unnest(candidate.interests) candidate_interest
         where candidate_interest = any(me.interests)
       ) interest_overlap
       cross join lateral (select case when candidate.personality_traits && me.personality_traits then 1 else 0.5 end as score) personality_overlap
       cross join lateral (select case when candidate.city = me.city then 1 when candidate.country = me.country then 0.6 else 0.2 end as score) location_overlap
       cross join lateral (select case when candidate.languages && me.languages then 1 else 0.2 end as score) language_overlap
       cross join lateral (select case when candidate.industry = me.industry then 1 else 0.5 end as score) career_overlap
       where candidate.user_id <> $1
       and not exists (
         select 1 from discovery_actions da
         where da.actor_user_id = $1 and da.target_user_id = candidate.user_id
         and da.action in ('pass', 'hide', 'block')
       )
       order by compatibility_score desc
       limit 50`,
      [userId],
    );
    return result.rows.filter((row) => Number(row.compatibility_score) >= threshold);
  }

  async act(userId: string, targetUserId: string, action: string) {
    await this.db.query(
      `insert into discovery_actions (actor_user_id, target_user_id, action)
       values ($1, $2, $3)
       on conflict (actor_user_id, target_user_id, action) do nothing`,
      [userId, targetUserId, action],
    );
    if (action !== 'like' && action !== 'super_like') return { matched: false };

    const reciprocal = await this.db.query(
      `select 1 from discovery_actions
       where actor_user_id = $1 and target_user_id = $2 and action in ('like', 'super_like')
       limit 1`,
      [targetUserId, userId],
    );
    if (!reciprocal.rowCount) return { matched: false };

    const match = await this.db.query(
      `insert into matches (user_a_id, user_b_id, status, ai_icebreaker)
       values (least($1::uuid, $2::uuid), greatest($1::uuid, $2::uuid), 'active', $3)
       on conflict (user_a_id, user_b_id) do update set status = 'active'
       returning *`,
      [userId, targetUserId, 'You both have overlapping interests. Ask what they are excited about this week.'],
    );
    return { matched: true, match: match.rows[0] };
  }
}
