import type { Middleware } from '@nokkel/api';

import { type Database } from '../../lib/database';
import { type Auth, type SerializedUser, type User } from '../../lib/model';
import { getStatusForError, type UserService } from '../../service';

export const createMeMiddleware: Middleware<
  SerializedUser,
  { user: UserService; db: Database },
  { auth: Auth }
> = async ctx => {
  const { email, password, name } = ctx.request.body;
  await ctx.services.db
    .transaction<User>(async trx => {
      const user = await ctx.services.user.createUser({
        email,
        password,
        account_id: null,
        name,
      })(trx);
      ctx.body = user.serialise();
      ctx.status = 201;
    })
    .catch(error => {
      ctx.throw(error?.message, getStatusForError(error), { expose: false });
    });
};
