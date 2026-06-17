import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../common/services/database.service';
import { MediaUploadDto } from './dto';

@Injectable()
export class MediaService {
  constructor(private readonly db: DatabaseService) {}

  async add(userId: string, dto: MediaUploadDto) {
    const existing = await this.db.query<{ count: string }>('select count(*) from media_assets where user_id = $1', [userId]);
    if (Number(existing.rows[0].count) >= 6) throw new BadRequestException('Maximum 6 media items allowed');

    const aiResponse = await fetch(`${process.env.AI_SERVICE_URL ?? 'http://localhost:8000'}/v1/media/analyze`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ user_id: userId, media_url: dto.url, media_type: dto.type }),
    });
    if (!aiResponse.ok) throw new BadRequestException('Media analysis failed');
    const analysis = await aiResponse.json();
    const result = await this.db.query(
      `insert into media_assets
       (user_id, url, media_type, is_face_photo, is_full_body, position, trust_score, moderation_status, ai_analysis)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       returning *`,
      [
        userId,
        dto.url,
        dto.type,
        dto.isFacePhoto,
        dto.isFullBody,
        dto.position,
        analysis.image_trust_score,
        analysis.flagged ? 'flagged' : 'approved',
        analysis,
      ],
    );
    return result.rows[0];
  }

  async requirements(userId: string) {
    const result = await this.db.query<{ total: string; face_photos: string; full_body: string }>(
      `select count(*) as total,
              count(*) filter (where is_face_photo) as face_photos,
              count(*) filter (where is_full_body) as full_body
       from media_assets where user_id = $1 and moderation_status = 'approved'`,
      [userId],
    );
    const row = result.rows[0];
    return {
      satisfied: Number(row.total) >= 3 && Number(row.face_photos) >= 2 && Number(row.full_body) >= 1,
      total: Number(row.total),
      facePhotos: Number(row.face_photos),
      fullBody: Number(row.full_body),
    };
  }
}

