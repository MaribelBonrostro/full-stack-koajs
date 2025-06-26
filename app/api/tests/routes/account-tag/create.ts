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

describe('POST /accounts/:accountId/tags', () => {
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
  const unknownUser = new User(CHANCE.email(), password, CHANCE.name(), false);

  beforeEach(async () => {
    await account.save(APP.context.services.db.connection);
    await user.save(APP.context.services.db.connection);
  });

  afterEach(async () => {
    await APP.context.services.db.connection('account_tags').delete();
    await APP.context.services.db.connection('accounts').delete();
    await APP.context.services.db.connection('users').delete();
  });

  afterAll(async () => {
    await APP.context.services.db.destroy();
  });

  describe('Given an invalid JWT', () => {
    it.each([
      generateJwt(
        new Auth(user.id, user.email, ['WRITE']).jwtPayload,
        JWKS_CLIENT.generateKeys().privateKey,
        100
      ),
      CHANCE.word(),
    ])('Then returns 401', async token => {
      await expect(
        request(APP.callback())
          .post(`/accounts/${account.id}/tags`)
          .set('Authorization', `Bearer ${token}`)
          .send({ name: 'VIP' })
      ).resolves.toEqual(expect.objectContaining({ status: 401 }));
    });
  });

  describe('Given auth lacks permissions', () => {
    it('Then returns 401', async () => {
      const { accessToken } = await JWT_SERVICE.getJwtFromAuth(
        new Auth(user.id, user.email, [])
      );

      await expect(
        request(APP.callback())
          .post(`/accounts/${account.id}/tags`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ name: 'VIP' })
      ).resolves.toEqual(expect.objectContaining({ status: 401 }));
    });
  });

  describe('Given a payload that is invalid', () => {
    it.each([CHANCE.natural(), CHANCE.bool()])(
      'Then returns 400',
      async name => {
        const { accessToken } = await JWT_SERVICE.getJwtFromAuth(
          new Auth(user.id, user.email, ['WRITE'])
        );

        await expect(
          request(APP.callback())
            .post(`/accounts/${account.id}/tags`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ name })
        ).resolves.toEqual(expect.objectContaining({ status: 400 }));

        await expect(
          APP.context.services.db
            .connection('account_tags')
            .where({ name })
            .first()
        ).resolves.toBeUndefined();
      }
    );
  });

  describe('Given a user that does not exist', () => {
    it('Then returns 401 and no tag is created', async () => {
      const { accessToken } = await JWT_SERVICE.getJwtFromAuth(
        new Auth(unknownUser.id, unknownUser.email, ['WRITE'])
      );

      await expect(
        request(APP.callback())
          .post(`/accounts/${account.id}/tags`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ name: 'VIP' })
      ).resolves.toEqual(expect.objectContaining({ status: 401 }));

      await expect(
        APP.context.services.db
          .connection('account_tags')
          .where({ name: 'VIP' })
          .first()
      ).resolves.toBeUndefined();
    });
  });

  describe('Given a valid user and payload', () => {
    it('Then returns 201 and tag is created', async () => {
      const { accessToken } = await JWT_SERVICE.getJwtFromAuth(
        new Auth(user.id, user.email, ['WRITE'])
      );

      const response = await request(APP.callback())
        .post(`/accounts/${account.id}/tags`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'VIP' });

      const tag = await APP.context.services.db
        .connection('account_tags')
        .where({ name: 'VIP', account_id: account.id })
        .first();

      expect(response).toEqual(expect.objectContaining({ status: 201 }));
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', 'VIP');
      expect(response.body).toHaveProperty('account_id', account.id);
      expect(tag).toEqual(
        expect.objectContaining({ name: 'VIP', account_id: account.id })
      );
    });
  });

  describe('Given a duplicate tag name for the same account', () => {
    it('Then returns 409 and does not create a duplicate', async () => {
      const { accessToken } = await JWT_SERVICE.getJwtFromAuth(
        new Auth(user.id, user.email, ['WRITE'])
      );
      await request(APP.callback())
        .post(`/accounts/${account.id}/tags`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'VIP' });
      const response = await request(APP.callback())
        .post(`/accounts/${account.id}/tags`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'VIP' });

      expect(response.status).toBe(409);
    });
  });
});
