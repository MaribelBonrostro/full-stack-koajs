/* eslint-disable node/no-unpublished-import */
import { Chance } from 'chance';
import request from 'supertest';

import { MockJwks } from '@nokkel/testing';

import { applicationFactory, config } from '@/lib';
import { Account, Auth, User } from '@/lib/model';
import { accountRouteFactory } from '@/routes/account';
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
APP.use(accountRouteFactory({ publicKey: PUBLIC_KEY }).attach());

jest.useFakeTimers({ now: NOW });

describe('DELETE /accounts', () => {
  const account = new Account(
    CHANCE.company(),
    false,
    CHANCE.guid(),
    CHANCE.date(),
    CHANCE.date()
  );
  const deletedAccount = new Account(
    CHANCE.company(),
    true,
    CHANCE.guid(),
    CHANCE.date(),
    CHANCE.date()
  );
  const password = CHANCE.string();
  const userWithAccount = new User(
    CHANCE.email(),
    password,
    CHANCE.name(),
    false,
    CHANCE.guid(),
    account.id
  );
  const userWithoutAccount = new User(
    CHANCE.email(),
    password,
    CHANCE.name(),
    false,
    CHANCE.guid()
  );
  const userWithDeletedAccount = new User(
    CHANCE.email(),
    password,
    CHANCE.name(),
    false,
    CHANCE.guid(),
    deletedAccount.id
  );
  const unknownUser = new User(CHANCE.email(), password, CHANCE.name(), false);

  beforeEach(async () => {
    await account.save(APP.context.services.db.connection);
    await deletedAccount.save(APP.context.services.db.connection);
    await userWithAccount.save(APP.context.services.db.connection);
    await userWithoutAccount.save(APP.context.services.db.connection);
    await userWithDeletedAccount.save(APP.context.services.db.connection);
  });

  afterEach(async () => {
    await APP.context.services.db.connection('user_accounts').delete();
    await APP.context.services.db.connection('accounts').delete();
    await APP.context.services.db.connection('users').delete();
  });

  afterAll(async () => {
    await APP.context.services.db.destroy;
  });

  describe('Given an invalid JWT', () => {
    it.each([
      generateJwt(
        new Auth(userWithAccount.id, userWithAccount.email, ['WRITE'])
          .jwtPayload,
        JWKS_CLIENT.generateKeys().privateKey,
        100
      ),
      CHANCE.word(),
    ])('Then returns 401', async token => {
      await expect(
        request(APP.callback())
          .delete('/accounts')
          .set('Authorization', `Bearer ${token}`)
      ).resolves.toEqual(expect.objectContaining({ status: 401 }));
    });
  });

  describe('Given auth lacks permissions', () => {
    it('Then returns 401', async () => {
      const { accessToken } = await JWT_SERVICE.getJwtFromAuth(
        new Auth(userWithAccount.id, userWithAccount.email, [])
      );

      await expect(
        request(APP.callback())
          .delete('/accounts')
          .set('Authorization', `Bearer ${accessToken}`)
      ).resolves.toEqual(expect.objectContaining({ status: 401 }));
    });
  });

  describe('Given a user that does not exist', () => {
    describe('When the user executes delete account', () => {
      it('Then return 404 and no account is deleted', async () => {
        const { accessToken } = await JWT_SERVICE.getJwtFromAuth(
          new Auth(unknownUser.id, unknownUser.email, ['WRITE'])
        );

        await expect(
          request(APP.callback())
            .delete('/accounts')
            .set('Authorization', `Bearer ${accessToken}`)
        ).resolves.toEqual(expect.objectContaining({ status: 404 }));
      });
    });
  });

  describe('Given a user without an account', () => {
    describe('When the user executes delete account', () => {
      it('Then return 404 and no account is deleted', async () => {
        const { accessToken } = await JWT_SERVICE.getJwtFromAuth(
          new Auth(userWithoutAccount.id, userWithoutAccount.email, ['WRITE'])
        );

        await expect(
          request(APP.callback())
            .delete('/accounts')
            .set('Authorization', `Bearer ${accessToken}`)
        ).resolves.toEqual(expect.objectContaining({ status: 404 }));
      });
    });
  });

  describe('Given a user with a deleted account', () => {
    describe('When the user executes delete account', () => {
      it('Then return 200 and account is deleted (idempotent)', async () => {
        const { accessToken } = await JWT_SERVICE.getJwtFromAuth(
          new Auth(userWithDeletedAccount.id, userWithDeletedAccount.email, [
            'WRITE',
          ])
        );

        const response = await request(APP.callback())
          .delete('/accounts')
          .set('Authorization', `Bearer ${accessToken}`);
        const _account = await APP.context.services.db
          .connection('accounts')
          .where({ name: deletedAccount.name })
          .first();
        const userAccount = await APP.context.services.db
          .connection('user_accounts')
          .where({ user_id: userWithDeletedAccount.id })
          .first();

        expect(response).toEqual(expect.objectContaining({ status: 200 }));
        expect(response.body).toEqual({});
        expect(_account).toEqual(
          expect.objectContaining({
            id: deletedAccount.id,
            deleted: true,
          })
        );
        expect(userAccount).toEqual({
          user_id: userWithDeletedAccount.id,
          account_id: deletedAccount.id,
        });
      });
    });
  });

  describe('Given a user with an account', () => {
    describe('When the user executes delete account', () => {
      it('Then return 200 and account is deleted', async () => {
        const { accessToken } = await JWT_SERVICE.getJwtFromAuth(
          new Auth(userWithAccount.id, userWithAccount.email, ['WRITE'])
        );

        const response = await request(APP.callback())
          .delete('/accounts')
          .set('Authorization', `Bearer ${accessToken}`);
        const _account = await APP.context.services.db
          .connection('accounts')
          .where({ name: account.name })
          .first();
        const userAccount = await APP.context.services.db
          .connection('user_accounts')
          .where({ user_id: userWithAccount.id })
          .first();

        expect(response).toEqual(expect.objectContaining({ status: 200 }));
        expect(response.body).toEqual({});
        expect(_account).toEqual(
          expect.objectContaining({
            id: account.id,
            deleted: true,
          })
        );
        expect(userAccount).toEqual({
          user_id: userWithAccount.id,
          account_id: account.id,
        });
      });
    });
  });
});
