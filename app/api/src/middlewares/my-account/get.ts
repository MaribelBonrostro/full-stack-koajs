import type { Middleware } from '@nokkel/api';

import { type Database } from '../../lib/database';
import { type Auth, type SerializedAccount } from '../../lib/model';
import { type AccountService, getStatusForError } from '../../service';

export const getMyAccountMiddleware: Middleware<
  SerializedAccount,
  { account: AccountService; db: Database },
  { auth: Auth }
> = async ctx => {
  await ctx.services.account
    .getMyAccount(ctx.state.auth)(ctx.services.db.connection)
    .then(account => {
      if (account.deleted) {
        ctx.status = 404;
      } else {
        ctx.body = account.serialize();
        ctx.status = 200;
      }
    })
    .catch(error => {
      ctx.throw(error?.message, getStatusForError(error), { expose: false });
    });
};
