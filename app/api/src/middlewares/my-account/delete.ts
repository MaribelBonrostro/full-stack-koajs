import type { Middleware } from '@nokkel/api';

import { type Database } from '../../lib/database';
import { type Auth, type SerializedAccount } from '../../lib/model';
import { type AccountService, getStatusForError } from '../../service';

export const deleteMyAccountMiddleware: Middleware<
  SerializedAccount,
  { account: AccountService; db: Database },
  { auth: Auth }
> = async ctx => {
  await ctx.services.db
    .transaction(async trx => {
      await ctx.services.account.deleteMyAccount(ctx.state.auth)(trx);
      ctx.status = 200;
    })
    .catch(error => {
      ctx.throw(error?.message, getStatusForError(error), { expose: false });
    });
};
