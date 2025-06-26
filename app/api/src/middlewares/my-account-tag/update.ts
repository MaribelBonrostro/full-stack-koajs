import { type Database } from '../../lib/database';
import {
  AccountTagService,
  getStatusForError,
  UserService,
} from '../../service';
import { Middleware } from '@nokkel/api';
import { Auth, SerializedAccountTag } from '../../lib/model';

export const updateAccountTagByIdMiddleware: Middleware<
  SerializedAccountTag,
  {
    accountTag: AccountTagService;
    user: UserService;
    db: Database;
  },
  {
    auth: Auth;
  }
> = async ctx => {
  const { accountId, tagId } = ctx.params;
  const { name } = ctx.request.body;

  if (!accountId || !tagId || !name) {
    ctx.throw(400, 'Account ID, tag ID, and name are required');
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

      const existingTag = await ctx.services.accountTag.getMyAccountTagById(
        String(accountId),
        String(tagId)
      )(trx);
      if (!existingTag) {
        ctx.throw(404, 'Account tag not found');
        return;
      }

      existingTag.name = name;
      const updatedTag =
        await ctx.services.accountTag.updateAccountTag(existingTag)(trx);

      ctx.status = 200;
      ctx.body = updatedTag.serialize();
    })
    .catch(error => {
      ctx.throw(error?.message, getStatusForError(error), { expose: false });
    });
};
