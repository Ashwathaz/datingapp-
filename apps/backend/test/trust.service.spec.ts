import { TrustService } from '../src/trust/trust.service';

describe('TrustService', () => {
  it('uses the requested 100 point trust model', async () => {
    const queries: string[] = [];
    const db = {
      query: jest.fn(async (sql: string) => {
        queries.push(sql);
        if (sql.includes('from user_verifications')) return { rows: [{ type: 'phone', status: 'approved' }, { type: 'email', status: 'approved' }, { type: 'government_id', status: 'approved' }, { type: 'selfie', status: 'approved' }] };
        if (sql.includes('avg(trust_score)')) return { rows: [{ avg: '100' }] };
        if (sql.includes('from social_verifications')) return { rows: [{ status: 'approved' }] };
        if (sql.includes('from users')) return { rows: [{ reputation_score: 5 }] };
        return { rows: [] };
      }),
    };
    const service = new TrustService(db as never);
    await expect(service.recalculate('user-id')).resolves.toMatchObject({ totalScore: 100 });
    expect(queries.some((query) => query.includes('insert into trust_scores'))).toBe(true);
  });
});

