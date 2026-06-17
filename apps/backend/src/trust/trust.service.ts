import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../common/services/database.service';

@Injectable()
export class TrustService {
  constructor(private readonly db: DatabaseService) {}

  async recalculate(userId: string) {
    const verifications = await this.db.query<{ type: string; status: string }>(
      'select type, status from user_verifications where user_id = $1',
      [userId],
    );
    const approved = new Set(verifications.rows.filter((v) => v.status === 'approved').map((v) => v.type));
    const media = await this.db.query<{ avg: string }>(
      'select coalesce(avg(trust_score), 0) as avg from media_assets where user_id = $1 and moderation_status = $2',
      [userId, 'approved'],
    );
    const social = await this.db.query<{ status: string }>('select status from social_verifications where user_id = $1', [userId]);
    const reputation = await this.db.query<{ reputation_score: number }>('select reputation_score from users where id = $1', [userId]);

    const phone = approved.has('phone') ? 10 : 0;
    const email = approved.has('email') ? 10 : 0;
    const governmentId = approved.has('government_id') ? 25 : 0;
    const selfie = approved.has('selfie') ? 25 : 0;
    const imageAuthenticity = Math.round((Number(media.rows[0].avg) / 100) * 15);
    const socialVerification = social.rows[0]?.status === 'approved' ? 10 : 0;
    const accountReputation = Math.min(5, Math.max(0, reputation.rows[0]?.reputation_score ?? 5));
    const totalScore = phone + email + governmentId + selfie + imageAuthenticity + socialVerification + accountReputation;

    await this.db.query(
      `insert into trust_scores
       (user_id, phone_verified, email_verified, id_verified, selfie_verified, image_authenticity, social_verification, account_reputation, total_score)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       on conflict (user_id) do update set
       phone_verified = $2, email_verified = $3, id_verified = $4, selfie_verified = $5,
       image_authenticity = $6, social_verification = $7, account_reputation = $8, total_score = $9,
       updated_at = now()`,
      [userId, phone, email, governmentId, selfie, imageAuthenticity, socialVerification, accountReputation, totalScore],
    );
    return { phone, email, governmentId, selfie, imageAuthenticity, socialVerification, accountReputation, totalScore };
  }
}

