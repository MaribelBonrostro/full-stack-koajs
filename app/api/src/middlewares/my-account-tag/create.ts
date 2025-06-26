import type { Middleware } from '@nokkel/api';
import { type Database } from '../../lib/database';
import { Auth, SerializedAccountTag } from '../../lib/model';
import {
  AccountTagService,
  getStatusForError,
  UserService,
} from '../../service';

export const createMyAccountTagMiddleware: Middleware<
  SerializedAccountTag,
  { accountTag: AccountTagService; user: UserService; db: Database },
  { auth: Auth }
> = async ctx => {
  const { accountId } = ctx.params;
  const { name } = ctx.request.body;

  if (!accountId || !name) {
    ctx.throw(400, 'Account ID and name are required');
    return;
  }

  await ctx.services.db
    .transaction(async trx => {
      const user = await ctx.services.user.getMe(ctx.state.auth)(trx);
      if (!user) {
        ctx.throw(401, 'User does not exist');
      }
      if (user.account_id !== accountId) {
        ctx.throw(403, 'User does not have access to this account');
      }

      const existingTag = await ctx.services.accountTag.getMyAccountTagByName(
        String(accountId),
        name
      )(trx);
      if (existingTag) {
        ctx.throw(409, 'Account tag with this name already exists');
      }
      const accountTag = await ctx.services.accountTag.createAccountTag({
        name,
        account_id: String(accountId),
      })(trx);

      ctx.status = 201;
      ctx.body = accountTag.serialize();
    })
    .catch(error => {
      ctx.throw(error?.message, getStatusForError(error), { expose: false });
    });
};
