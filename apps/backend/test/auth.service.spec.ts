import * as bcrypt from 'bcryptjs';
import { AuthService } from '../src/auth/auth.service';

describe('AuthService', () => {
  it('stores a hashed refresh session when logging in', async () => {
    const passwordHash = await bcrypt.hash('correct-password', 4);
    const db = {
      query: jest.fn(async (sql: string, _params?: unknown[]) => {
        if (sql.includes('from users where email')) {
          return {
            rows: [{
              id: 'user-id',
              email: 'person@example.com',
              role: 'user',
              password_hash: passwordHash,
              status: 'active',
            }],
          };
        }
        return { rows: [] };
      }),
    };
    const jwt = {
      signAsync: jest.fn(async (_payload: unknown, options: { secret: string }) => (
        options.secret.includes('refresh') ? 'refresh-token' : 'access-token'
      )),
    };

    const service = new AuthService(db as never, jwt as never);
    await expect(service.login('person@example.com', 'correct-password')).resolves.toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    const sessionInsert = db.query.mock.calls.find(([sql]) => sql.includes('insert into auth_sessions'));
    const sessionParams = sessionInsert?.[1] as unknown[] | undefined;
    expect(sessionInsert).toBeDefined();
    expect(sessionParams?.[1]).toBe('user-id');
    expect(await bcrypt.compare('refresh-token', sessionParams?.[2] as string)).toBe(true);
  });

  it('rotates and revokes refresh sessions', async () => {
    const existingRefreshHash = await bcrypt.hash('old-refresh-token', 4);
    const db = {
      query: jest.fn(async (sql: string, _params?: unknown[]) => {
        if (sql.includes('from auth_sessions')) {
          return {
            rows: [{
              id: 'old-session-id',
              user_id: 'user-id',
              refresh_token_hash: existingRefreshHash,
              email: 'person@example.com',
              role: 'user',
              status: 'active',
            }],
          };
        }
        return { rows: [] };
      }),
    };
    const jwt = {
      verifyAsync: jest.fn(async () => ({
        sub: 'user-id',
        email: 'person@example.com',
        role: 'user',
        jti: 'old-session-id',
      })),
      signAsync: jest.fn(async (_payload: unknown, options: { secret: string }) => (
        options.secret.includes('refresh') ? 'new-refresh-token' : 'new-access-token'
      )),
    };

    const service = new AuthService(db as never, jwt as never);
    await expect(service.refresh('old-refresh-token')).resolves.toEqual({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });

    expect(db.query.mock.calls.some(([sql]) => sql.includes('insert into auth_sessions'))).toBe(true);
    expect(db.query.mock.calls.some(([sql, params]) => (
      sql.includes('update auth_sessions') && params?.[0] === 'old-session-id' && Boolean(params?.[1])
    ))).toBe(true);
  });
});
