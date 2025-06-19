import type { Middleware } from '@nokkel/api';

import type { Database } from '../../lib/database';
import { type Auth, type SerializedUser } from '../../lib/model';
import { getStatusForError, type UserService } from '../../service';

export const updateMeMiddleware: Middleware<
  SerializedUser,
  { user: UserService; db: Database },
  { auth: Auth }
> = async ctx => {
  const { name, email, password } = ctx.request.body;

  await ctx.services.db
    .transaction(async trx => {
      const user = await ctx.services.user.updateMe(ctx.state.auth, {
        email,
        name,
        password,
      })(trx);
      ctx.body = user.serialise();
      ctx.status = 200;
    })
    .catch(error => {
      ctx.throw(error?.message, getStatusForError(error), { expose: false });
    });
};
