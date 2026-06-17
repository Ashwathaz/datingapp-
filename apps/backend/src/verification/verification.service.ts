import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../common/services/database.service';
import { IdVerificationDto, ReferenceDto, SelfieVerificationDto, SocialVerificationDto } from './dto';

@Injectable()
export class VerificationService {
  constructor(private readonly db: DatabaseService) {}

  async submitGovernmentId(userId: string, dto: IdVerificationDto) {
    const response = await fetch(`${process.env.AI_SERVICE_URL ?? 'http://localhost:8000'}/v1/identity/id-card`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ user_id: userId, ...dto }),
    });
    if (!response.ok) throw new BadRequestException('ID verification analysis failed');
    const analysis = await response.json();
    await this.db.query(
      `insert into user_verifications (user_id, type, status, score, provider_payload)
       values ($1, 'government_id', $2, $3, $4)
       on conflict (user_id, type) do update set status = $2, score = $3, provider_payload = $4, updated_at = now()`,
      [userId, analysis.status, analysis.score, analysis],
    );
    return analysis;
  }

  async submitSelfie(userId: string, dto: SelfieVerificationDto) {
    const response = await fetch(`${process.env.AI_SERVICE_URL ?? 'http://localhost:8000'}/v1/identity/selfie`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ user_id: userId, ...dto }),
    });
    if (!response.ok) throw new BadRequestException('Selfie verification analysis failed');
    const analysis = await response.json();
    await this.db.query(
      `insert into user_verifications (user_id, type, status, score, provider_payload)
       values ($1, 'selfie', $2, $3, $4)
       on conflict (user_id, type) do update set status = $2, score = $3, provider_payload = $4, updated_at = now()`,
      [userId, analysis.status, analysis.score, analysis],
    );
    return analysis;
  }

  async submitSocial(userId: string, dto: SocialVerificationDto) {
    await this.db.query(
      `insert into social_verifications (user_id, instagram_username, linkedin_profile_url, status)
       values ($1, $2, $3, 'pending_review')
       on conflict (user_id) do update set instagram_username = $2, linkedin_profile_url = $3, status = 'pending_review'`,
      [userId, dto.instagramUsername ?? null, dto.linkedInProfileUrl ?? null],
    );
    return { status: 'pending_review' };
  }

  async submitReference(userId: string, dto: ReferenceDto) {
    await this.db.query(
      `insert into reference_verifications (user_id, friend_name, friend_phone_number, relationship, status)
       values ($1, $2, $3, $4, 'requested')`,
      [userId, dto.friendName, dto.friendPhoneNumber, dto.relationship],
    );
    return { status: 'requested' };
  }

  async matchingEligibility(userId: string) {
    const result = await this.db.query<{ missing: string[] }>(
      `select array(
         select required.type
         from (values ('email'), ('phone'), ('selfie'), ('government_id')) required(type)
         left join user_verifications uv on uv.user_id = $1 and uv.type = required.type and uv.status = 'approved'
         where uv.id is null
       ) as missing`,
      [userId],
    );
    const missing = result.rows[0]?.missing ?? [];
    return { eligible: missing.length === 0, missing };
  }
}

