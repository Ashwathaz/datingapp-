import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomInt, randomUUID } from 'crypto';
import { DatabaseService } from '../common/services/database.service';
import { RegisterDto } from './dto';

interface TokenUser {
  id: string;
  email: string;
  role: string;
}

interface RefreshPayload {
  sub: string;
  email: string;
  role: string;
  jti: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly db: DatabaseService, private readonly jwt: JwtService) {}

  async register(dto: RegisterDto) {
    const existing = await this.db.query('select id from users where email = $1 or username = $2', [
      dto.email.toLowerCase(),
      dto.username.toLowerCase(),
    ]);
    if (existing.rowCount) throw new ConflictException('Email or username already exists');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const result = await this.db.query<{ id: string; email: string; role: string }>(
      `insert into users (first_name, last_name, username, phone_number, email, password_hash)
       values ($1, $2, $3, $4, $5, $6)
       returning id, email, role`,
      [
        dto.firstName,
        dto.lastName,
        dto.username.toLowerCase(),
        dto.phoneNumber,
        dto.email.toLowerCase(),
        passwordHash,
      ],
    );
    await this.createVerificationChallenge(result.rows[0].id, 'phone');
    await this.createVerificationChallenge(result.rows[0].id, 'email');
    return { user: result.rows[0], tokens: this.withoutSessionId(await this.issueTokens(result.rows[0])) };
  }

  async login(email: string, password: string) {
    const result = await this.db.query<{
      id: string; email: string; role: string; password_hash: string; status: string;
    }>('select id, email, role, password_hash, status from users where email = $1', [
      email.toLowerCase(),
    ]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    this.assertAccountCanAuthenticate(user.status);
    return this.withoutSessionId(await this.issueTokens({ id: user.id, email: user.email, role: user.role }));
  }

  async refresh(refreshToken: string) {
    const payload = await this.verifyRefreshToken(refreshToken);
    const session = await this.db.query<{
      id: string;
      user_id: string;
      refresh_token_hash: string;
      email: string;
      role: string;
      status: string;
    }>(
      `select s.id, s.user_id, s.refresh_token_hash, u.email, u.role, u.status
       from auth_sessions s
       join users u on u.id = s.user_id
       where s.id = $1 and s.user_id = $2 and s.revoked_at is null and s.expires_at > now()
       limit 1`,
      [payload.jti, payload.sub],
    );
    const row = session.rows[0];
    if (!row || !(await bcrypt.compare(refreshToken, row.refresh_token_hash))) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    if (!this.canAuthenticate(row.status)) {
      await this.revokeSession(row.id);
      throw new UnauthorizedException('Account is not active');
    }

    const tokens = await this.issueTokens({ id: row.user_id, email: row.email, role: row.role });
    await this.revokeSession(row.id, tokens.sessionId);
    return this.withoutSessionId(tokens);
  }

  async logout(refreshToken: string) {
    try {
      const payload = await this.verifyRefreshToken(refreshToken);
      await this.revokeSession(payload.jti);
    } catch {
      return { loggedOut: true };
    }
    return { loggedOut: true };
  }

  async createVerificationChallenge(userId: string, channel: 'email' | 'phone') {
    const code = String(randomInt(100000, 999999));
    await this.db.query(
      `insert into verification_challenges (user_id, channel, code_hash, expires_at)
       values ($1, $2, $3, now() + interval '15 minutes')`,
      [userId, channel, await bcrypt.hash(code, 10)],
    );
    return { channel, devCode: process.env.NODE_ENV === 'production' ? undefined : code };
  }

  async verifyChallenge(userId: string, channel: 'email' | 'phone', code: string) {
    const result = await this.db.query<{ id: string; code_hash: string }>(
      `select id, code_hash from verification_challenges
       where user_id = $1 and channel = $2 and consumed_at is null and expires_at > now()
       order by created_at desc limit 1`,
      [userId, channel],
    );
    const challenge = result.rows[0];
    if (!challenge || !(await bcrypt.compare(code, challenge.code_hash))) {
      throw new UnauthorizedException('Invalid verification code');
    }
    await this.db.query('update verification_challenges set consumed_at = now() where id = $1', [
      challenge.id,
    ]);
    await this.db.query(
      `insert into user_verifications (user_id, type, status, score, verified_at)
       values ($1, $2, 'approved', 100, now())
       on conflict (user_id, type) do update set status = 'approved', score = 100, verified_at = now()`,
      [userId, channel],
    );
    return { verified: true };
  }

  private async issueTokens(user: TokenUser) {
    const sessionId = randomUUID();
    const payload = { sub: user.id, email: user.email, role: user.role };
    const refreshPayload = { ...payload, jti: sessionId };
    const refreshToken = await this.jwt.signAsync(refreshPayload, {
      secret: process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret',
      expiresIn: process.env.JWT_REFRESH_TTL ?? '30d',
    });
    await this.db.query(
      `insert into auth_sessions (id, user_id, refresh_token_hash, expires_at)
       values ($1, $2, $3, $4)`,
      [sessionId, user.id, await bcrypt.hash(refreshToken, 12), this.refreshTokenExpiresAt()],
    );
    return {
      accessToken: await this.jwt.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret',
        expiresIn: process.env.JWT_ACCESS_TTL ?? '15m',
      }),
      refreshToken,
      sessionId,
    };
  }

  private async verifyRefreshToken(refreshToken: string): Promise<RefreshPayload> {
    try {
      const payload = await this.jwt.verifyAsync<RefreshPayload>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret',
      });
      if (!payload.sub || !payload.jti) throw new UnauthorizedException('Invalid refresh token');
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async revokeSession(sessionId: string, replacedBySessionId?: string) {
    await this.db.query(
      `update auth_sessions
       set revoked_at = coalesce(revoked_at, now()), replaced_by_session_id = coalesce(replaced_by_session_id, $2), updated_at = now()
       where id = $1`,
      [sessionId, replacedBySessionId ?? null],
    );
  }

  private refreshTokenExpiresAt() {
    return new Date(Date.now() + this.durationToMilliseconds(process.env.JWT_REFRESH_TTL ?? '30d'));
  }

  private durationToMilliseconds(value: string) {
    const match = value.trim().match(/^(\d+)([smhd])$/);
    if (!match) return 30 * 24 * 60 * 60 * 1000;
    const amount = Number(match[1]);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };
    return amount * multipliers[unit];
  }

  private assertAccountCanAuthenticate(status: string) {
    if (!this.canAuthenticate(status)) throw new UnauthorizedException('Account is not active');
  }

  private canAuthenticate(status: string) {
    return status === 'active' || status === 'pending_verification';
  }

  private withoutSessionId(tokens: { accessToken: string; refreshToken: string; sessionId: string }) {
    return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
  }
}
