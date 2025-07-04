import type { Middleware } from '@nokkel/api';

import { type Database } from '../../lib/database';
import {
  type Account,
  type Auth,
  type SerializedAccount,
} from '../../lib/model';
import {
  type AccountService,
  getStatusForError,
  type UserService,
} from '../../service';

export const createMyAccountMiddleware: Middleware<
  SerializedAccount,
  { account: AccountService; user: UserService; db: Database },
  { auth: Auth }
> = async ctx => {
  const { name } = ctx.request.body;

  await ctx.services.db
    .transaction<Account>(async trx => {
      // Check the user does not already have an existing account
      const existing = await ctx.services.account
        .getMyAccount(ctx.state.auth)(trx)
        .catch(() => null);
      if (existing && !existing.deleted)
        ctx.throw(409, 'Account already exists for this user');

      // Update existing account if previously deleted
      if (existing && existing.deleted) {
        const account = await ctx.services.account.updateMyAccount(
          ctx.state.auth,
          { name, deleted: false }
        )(trx);
        ctx.body = account.serialize();
      } else {
        // Check the user exists and doesn't already have an account
        const user = await ctx.services.user
          .getMe(ctx.state.auth)(trx)
          .catch(() => null);
        if (!user) ctx.throw(401, 'User does not exist');
        if (user!.account_id && !existing?.deleted)
          ctx.throw(409, 'User already has an account');

        // Create an account and associate to the user
        const account = await ctx.services.account.createAccount({ name })(trx);
        await ctx.services.user.updateMe(ctx.state.auth, {
          account_id: account.id,
        })(trx);
        ctx.body = account.serialize();
      }

      ctx.status = 201;
      ctx.set('Location', '/accounts');
    })
    .catch(error => {
      ctx.throw(error?.message, getStatusForError(error), { expose: false });
    });
};
