import { randomUUID } from 'crypto';
import type { Knex } from 'knex';

import type { AccountTagRecord } from '../database';
import type { DateFields } from '../date';

export interface SerializedAccountTag extends DateFields {
  id: string;
  name: string;
  account_id: string;
}

export class AccountTag {
  constructor(
    public name: string,
    public account_id: string,
    public id: string = randomUUID(),
    public created_at: Date = new Date(),
    public updated_at: Date = new Date()
  ) {}

  public static async getAccountTagByName(
    accountId: string,
    name: string,
    trx: Knex | Knex.Transaction
  ): Promise<AccountTag | null> {
    const record = await trx
      .table('account_tags')
      .where({ account_id: accountId, name })
      .first();
    if (!record) return null;
    return this.toAccountTag(record);
  }
  public static async getAccountTagById(
    id: string,
    trx: Knex | Knex.Transaction
  ): Promise<AccountTag | null> {
    const record = await trx.table('account_tags').where('id', id).first();
    if (!record) return null;
    return this.toAccountTag(record);
  }
  public static async getTagsByAccountId(
    accountId: string,
    trx: Knex | Knex.Transaction
  ): Promise<AccountTag[]> {
    const records = await trx
      .table('account_tags')
      .where('account_id', accountId)
      .orderBy('created_at', 'desc');
    return records.map(this.toAccountTag);
  }

  private static toAccountTag(record: AccountTagRecord): AccountTag {
    return new AccountTag(
      record.name,
      record.account_id,
      record.id,
      new Date(record.created_at),
      new Date(record.updated_at)
    );
  }

  private toRecord(): AccountTagRecord {
    return {
      id: this.id,
      name: this.name,
      account_id: this.account_id,
      created_at: this.created_at.toISOString(),
      updated_at: this.updated_at.toISOString(),
    };
  }

  public save(trx: Knex | Knex.Transaction): Promise<AccountTag> {
    this.updated_at = new Date();
    return trx
      .table('account_tags')
      .insert(this.toRecord())
      .onConflict('id')
      .merge(['name', 'updated_at'])
      .then(() => this);
  }

  public serialize(): SerializedAccountTag {
    return {
      id: this.id,
      name: this.name,
      account_id: this.account_id,
      created_at: this.created_at.toISOString(),
      updated_at: this.updated_at.toISOString(),
    };
  }
}
