import { type Database } from '../../lib/database';
import { Auth, type SerializedAccountTag } from '../../lib/model';
import { Middleware } from '@nokkel/api';
import { type AccountTagService, getStatusForError } from '../../service';

export const getAllTagsByAccountMiddleware: Middleware<
  SerializedAccountTag[],
  { accountTag: AccountTagService; db: Database },
  { auth: Auth }
> = async ctx => {
  const { accountId } = ctx.params;
  await ctx.services.db
    .transaction<SerializedAccountTag[]>(async trx => {
      const tags = await ctx.services.accountTag.getMyAccountTags(
        String(accountId)
      )(trx);
      if (!tags || tags.length === 0) {
        ctx.throw(404, 'No account tags found for this account');
      }

      ctx.body = (tags ?? []).map(tag => tag.serialize());
      ctx.status = 200;
    })
    .catch(error => {
      ctx.throw(error?.message, getStatusForError(error), { expose: false });
    });
};
