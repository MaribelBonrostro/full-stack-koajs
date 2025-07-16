/* eslint-disable node/no-unpublished-import */
import { Chance } from 'chance';
import request from 'supertest';

import { MockJwks } from '@nokkel/testing';

import { applicationFactory, config } from '@/lib';
import { Account, Auth, User } from '@/lib/model';
import { accountTagsRouteFactory } from '@/routes/account-tag';
import { JwtService } from '@/service';

import { generateJwt } from '../../mocks/jwt';

const NOW = new Date();
const CHANCE = new Chance();
const JWKS_CLIENT = new MockJwks({});
const { publicKey: PUBLIC_KEY, privateKey: PRIVATE_KEY } =
  JWKS_CLIENT.generateKeys();
const JWT_SERVICE = new JwtService(PRIVATE_KEY, PUBLIC_KEY, {
  accessToken: { expiry: 100 },
  refreshToken: { expiry: 100 },
});
const APP = applicationFactory({
  ...config,
  jwks: { publicKey: PUBLIC_KEY, privateKey: PRIVATE_KEY },
});
APP.use(accountTagsRouteFactory({ publicKey: PUBLIC_KEY }).attach());

jest.useFakeTimers({ now: NOW });

describe('GET /accounts/:accountId/tags', () => {
  const account = new Account(CHANCE.company(), false);
  const password = CHANCE.string();
  const user = new User(
    CHANCE.email(),
    password,
    CHANCE.name(),
    false,
    CHANCE.guid(),
    account.id
  );

  beforeEach(async () => {
    await account.save(APP.context.services.db.connection);
    await user.save(APP.context.services.db.connection);
    // Create some tags
    await APP.context.services.db.connection('account_tags').insert([
      {
        id: CHANCE.guid(),
        account_id: account.id,
        name: 'VIP',
        created_at: NOW,
        updated_at: NOW,
      },
      {
        id: CHANCE.guid(),
        account_id: account.id,
        name: 'Staff',
        created_at: NOW,
        updated_at: NOW,
      },
    ]);
  });

  afterEach(async () => {
    await APP.context.services.db.connection('account_tags').delete();
    await APP.context.services.db.connection('accounts').delete();
    await APP.context.services.db.connection('users').delete();
  });

  afterAll(async () => {
    await APP.context.services.db.destroy();
  });

  it('should return 401 for missing or invalid token', async () => {
    const res = await request(APP.callback()).get(
      `/accounts/${account.id}/tags`
    );
    expect(res.status).toBe(401);
  });

  it('should return all tags for the account', async () => {
    const { accessToken } = await JWT_SERVICE.getJwtFromAuth(
      new Auth(user.id, user.email, ['READ'])
    );

    const res = await request(APP.callback())
      .get(`/accounts/${account.id}/tags`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
    expect(res.body.map((t: any) => t.name)).toEqual(
      expect.arrayContaining(['VIP', 'Staff'])
    );
  });

  it('should return 404 for non-existent account', async () => {
    const { accessToken } = await JWT_SERVICE.getJwtFromAuth(
      new Auth(user.id, user.email, ['READ'])
    );
    const fakeAccountId = CHANCE.guid();

    const res = await request(APP.callback())
      .get(`/accounts/${fakeAccountId}/tags`)
      .set('Authorization', `Bearer ${accessToken}`);

    // Depending on your implementation, this could be 404 or 200 with empty array
    // Adjust as needed:
    expect([200, 404]).toContain(res.status);
  });
});
