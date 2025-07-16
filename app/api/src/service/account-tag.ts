import { randomUUID } from 'crypto';
import { AccountTag } from '../lib/model';
import type { Knex } from 'knex';

type Account = {
  name: string;
  account_id: string;
};
export class AccountTagService {
  public createAccountTag({ name, account_id }: Account) {
    return async (
      trx: Knex<AccountTag> | Knex.Transaction<AccountTag>
    ): Promise<AccountTag> => {
      const accountTag = new AccountTag(
        name,
        account_id,
        randomUUID(),
        new Date(),
        new Date()
      );
      return await accountTag.save(trx);
    };
  }

  public getMyAccountTagByName(accountId: string, name: string) {
    return async (
      knex: Knex<AccountTag> | Knex.Transaction<AccountTag>
    ): Promise<AccountTag | null> => {
      const accountTag = await AccountTag.getAccountTagByName(
        accountId,
        name,
        knex
      );

      return accountTag;
    };
  }

  public getMyAccountTagById(accountId: string, tagId: string) {
    return async (
      knex: Knex<AccountTag> | Knex.Transaction<AccountTag>
    ): Promise<AccountTag | null> => {
      const accountTag = await AccountTag.getAccountTagById(tagId, knex);
      if (accountTag && accountTag.account_id !== accountId) {
        return null;
      }
      return accountTag;
    };
  }

  public getMyAccountTags(accountId: string) {
    return async (
      knex: Knex<AccountTag> | Knex.Transaction<AccountTag>
    ): Promise<AccountTag[] | null> => {
      const accountTags = await AccountTag.getTagsByAccountId(accountId, knex);

      return accountTags;
    };
  }

  public updateAccountTag(accountTag: AccountTag) {
    return async (
      trx: Knex<AccountTag> | Knex.Transaction<AccountTag>
    ): Promise<AccountTag> => {
      accountTag.updated_at = new Date();
      await trx.table('account_tags').where('id', accountTag.id).update({
        name: accountTag.name,
      });
      return accountTag;
    };
  }

  public deleteAccountTag(accountTag: AccountTag) {
    return async (
      trx: Knex<AccountTag> | Knex.Transaction<AccountTag>
    ): Promise<void> => {
      await trx.table('account_tags').where('id', accountTag.id).delete();
    };
  }

  public assignTagToUser(userId: string, tagId: string) {
    return async (trx: Knex | Knex.Transaction): Promise<void> => {
      await trx.table('user_account_tags').insert({
        user_id: userId,
        tag_id: tagId,
      });
    };
  }
  public isTagAssignedToUser(userId: string, tagId: string) {
    return async (trx: Knex | Knex.Transaction): Promise<boolean> => {
      const count = await trx
        .table('user_account_tags')
        .where({ user_id: userId, tag_id: tagId })
        .count<{ count: string }[]>('* as count')
        .first();
      return Number(count?.count) > 0;
    };
  }
}
