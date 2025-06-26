/* eslint-disable node/no-unpublished-import */
import { Chance } from 'chance';
import request from 'supertest';

import { MockJwks } from '@nokkel/testing';

import { applicationFactory, config } from '@/lib';
import { Account, Auth, User } from '@/lib/model';
import { accountTagsRouteFactory } from '@/routes/account-tag';
import { JwtService } from '@/service';

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

describe('POST /accounts/:accountId/users/:userId/tags', () => {
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
  const anotherUser = new User(
    CHANCE.email(),
    password,
    CHANCE.name(),
    false,
    CHANCE.guid(),
    account.id
  );
  let tagId: string;

  beforeEach(async () => {
    await account.save(APP.context.services.db.connection);
    await user.save(APP.context.services.db.connection);
    await anotherUser.save(APP.context.services.db.connection);
    // Create a tag for the account
    const [tag] = await APP.context.services.db
      .connection('account_tags')
      .insert({
        id: CHANCE.guid(),
        account_id: account.id,
        name: 'VIP',
        created_at: NOW,
        updated_at: NOW,
      })
      .returning('*');
    tagId = tag.id;
  });

  afterEach(async () => {
    await APP.context.services.db.connection('user_account_tags').delete();
    await APP.context.services.db.connection('account_tags').delete();
    await APP.context.services.db.connection('accounts').delete();
    await APP.context.services.db.connection('users').delete();
  });

  afterAll(async () => {
    await APP.context.services.db.destroy();
  });

  it('should assign a tag to a user', async () => {
    const { accessToken } = await JWT_SERVICE.getJwtFromAuth(
      new Auth(user.id, user.email, ['WRITE'])
    );

    const res = await request(APP.callback())
      .post(`/accounts/${account.id}/users/${anotherUser.id}/tags`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ tagId });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('user_id', anotherUser.id);
    expect(res.body).toHaveProperty('tag_id', tagId);

    // Check in DB
    const userTag = await APP.context.services.db
      .connection('user_account_tags')
      .where({ user_id: anotherUser.id, tag_id: tagId })
      .first();
    expect(userTag).toBeDefined();
  });

  it('should return 409 if tag already assigned', async () => {
    const { accessToken } = await JWT_SERVICE.getJwtFromAuth(
      new Auth(user.id, user.email, ['WRITE'])
    );

    // Assign once
    await request(APP.callback())
      .post(`/accounts/${account.id}/users/${anotherUser.id}/tags`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ tagId });

    // Assign again
    const res = await request(APP.callback())
      .post(`/accounts/${account.id}/users/${anotherUser.id}/tags`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ tagId });

    expect(res.status).toBe(409);
  });

  it('should return 404 if tag does not exist', async () => {
    const { accessToken } = await JWT_SERVICE.getJwtFromAuth(
      new Auth(user.id, user.email, ['WRITE'])
    );

    const fakeTagId = CHANCE.guid();

    const res = await request(APP.callback())
      .post(`/accounts/${account.id}/users/${anotherUser.id}/tags`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ tagId: fakeTagId });

    expect(res.status).toBe(404);
  });

  it('should return 400 if tagId is missing', async () => {
    const { accessToken } = await JWT_SERVICE.getJwtFromAuth(
      new Auth(user.id, user.email, ['WRITE'])
    );

    const res = await request(APP.callback())
      .post(`/accounts/${account.id}/users/${anotherUser.id}/tags`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it('should return 401 for invalid JWT', async () => {
    const res = await request(APP.callback())
      .post(`/accounts/${account.id}/users/${anotherUser.id}/tags`)
      .set('Authorization', `Bearer invalidtoken`)
      .send({ tagId });

    expect(res.status).toBe(401);
  });
});
