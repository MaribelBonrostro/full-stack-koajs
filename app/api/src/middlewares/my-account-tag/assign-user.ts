import type { Middleware } from '@nokkel/api';
import { type Database } from '../../lib/database';
import { Auth } from '../../lib/model';
import {
  AccountTagService,
  getStatusForError,
  UserService,
} from '../../service';

export const AssignTagToUserMiddleware: Middleware<
  { user_id: string; tag_id: string },
  { accountTag: AccountTagService; user: UserService; db: Database },
  { auth: Auth }
> = async ctx => {
  const { accountId, userId } = ctx.params;
  const { tagId } = ctx.request.body;

  if (!accountId || !userId || !tagId) {
    ctx.throw(400, 'Account ID, User ID, and Tag ID are required');
    return;
  }

  if (!accountId || !userId || !tagId) {
    ctx.throw(400, 'Account ID, User ID, and Tag ID are required');
    return;
  }

  await ctx.services.db
    .transaction(async trx => {
      const user = await ctx.services.user.getMe(ctx.state.auth)(trx);
      if (!user) ctx.throw(401, 'User does not exist');
      if (user.account_id !== accountId)
        ctx.throw(403, 'User does not have access to this account');
      const accountTag = await ctx.services.accountTag.getMyAccountTagById(
        String(accountId),
        tagId
      )(trx);
      if (!accountTag) ctx.throw(404, 'Account tag does not exist');

      const alreadyAssigned = await ctx.services.accountTag.isTagAssignedToUser(
        String(userId),
        tagId
      )(trx);
      if (alreadyAssigned) ctx.throw(409, 'Tag already assigned to user');
      await ctx.services.accountTag.assignTagToUser(String(userId), tagId)(trx);

      ctx.status = 201;
      ctx.body = { user_id: String(userId), tag_id: tagId };
    })
    .catch(error => {
      ctx.throw(error?.message, getStatusForError(error), { expose: false });
    });
};
