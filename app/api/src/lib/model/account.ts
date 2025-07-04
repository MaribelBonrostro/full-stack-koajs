import { randomUUID } from 'crypto';
import type { Knex } from 'knex';

import type { AccountRecord } from '../database';
import type { DateFields } from '../date';

export interface SerializedAccount extends DateFields {
  id: string;
  name: string;
  deleted: boolean;
}

export class Account {
  public static async getAccountById(
    id: string,
    trx: Knex | Knex.Transaction
  ): Promise<Account | null> {
    const record = await trx.table('accounts').where('id', id).first();
    if (!record) return null;
    return this.toAccount(record);
  }

  public static async getAccountByUserId(
    userId: string,
    trx: Knex | Knex.Transaction
  ): Promise<Account | null> {
    const record = await trx
      .table('accounts')
      .select('accounts.*')
      .leftJoin('user_accounts', 'user_accounts.account_id', 'accounts.id')
      .where('user_accounts.user_id', userId)
      .first();
    if (!record) return null;
    return this.toAccount(record);
  }

  private static toAccount(record: AccountRecord): Account {
    return new Account(
      record.name,
      record.deleted,
      record.id,
      new Date(record.created_at),
      new Date(record.updated_at)
    );
  }

  constructor(
    public name: string,
    public deleted: boolean,
    public id: string = randomUUID(),
    public created_at: Date = new Date(),
    public updated_at: Date = new Date()
  ) {}

  public save(trx: Knex | Knex.Transaction): Promise<Account> {
    this.updated_at = new Date();
    return trx
      .table('accounts')
      .insert(this.toRecord())
      .onConflict('id')
      .merge(['deleted', 'name', 'updated_at'])
      .then(() => this);
  }

  public delete(trx: Knex | Knex.Transaction): Promise<Account> {
    this.updated_at = new Date();
    this.deleted = true;

    return trx
      .table('accounts')
      .insert(this.toRecord())
      .onConflict('id')
      .merge(['deleted', 'updated_at'])
      .then(() => this);
  }

  public serialize(): SerializedAccount {
    return {
      id: this.id,
      name: this.name,
      deleted: this.deleted,
      created_at: this.created_at.toISOString(),
      updated_at: this.updated_at.toISOString(),
    };
  }

  private toRecord(): AccountRecord {
    return {
      id: this.id,
      name: this.name,
      deleted: this.deleted,
      created_at: this.created_at.toISOString(),
      updated_at: this.updated_at.toISOString(),
    };
  }
}
