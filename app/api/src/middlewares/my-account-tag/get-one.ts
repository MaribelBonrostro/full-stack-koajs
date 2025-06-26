import type { Database } from '../../lib/database';
import type { Auth, SerializedAccountTag } from '../../lib/model';
import type { Middleware } from '@nokkel/api';
import { getStatusForError, type AccountTagService } from '../../service';

export const getTagByAccountIdAndTagIdMiddleware: Middleware<
  SerializedAccountTag,
  { accountTag: AccountTagService; db: Database },
  { auth: Auth }
> = async ctx => {
  const { accountId, tagId } = ctx.params;
  await ctx.services.accountTag
    .getMyAccountTagById(
      String(accountId),
      String(tagId)
    )(ctx.services.db.connection)
    .then(accountTag => {
      if (!accountTag) {
        ctx.status = 404;
      } else {
        ctx.body = accountTag.serialize();
        ctx.status = 200;
      }
    })
    .catch(error => {
      ctx.throw(error?.message, getStatusForError(error), { expose: false });
    });
};
