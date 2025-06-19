import type { Middleware } from '@nokkel/api';

import type { Database } from '../../lib/database';
import { type Auth, type SerializedUser } from '../../lib/model';
import { getStatusForError, type UserService } from '../../service';

export const deleteMeMiddleware: Middleware<
  SerializedUser,
  { user: UserService; db: Database },
  { auth: Auth }
> = async ctx => {
  await ctx.services.db
    .transaction(async trx => {
      await ctx.services.user.deleteMe(ctx.state.auth)(trx);
      ctx.status = 200;
    })
    .catch(error => {
      ctx.throw(error?.message, getStatusForError(error), { expose: false });
    });
};
