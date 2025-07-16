import type { Knex } from 'knex';

import type {
  AccountRecord,
  AccountTagRecord,
  UserAccountRecord,
  UserAccountTagRecord,
  UserRecord,
} from './schema';

declare module 'knex/types/tables' {
  interface Tables {
    accounts: Knex.CompositeTableType<
      AccountRecord,
      AccountRecord,
      Partial<Pick<AccountRecord, 'deleted' | 'updated_at' | 'name'>>,
      Omit<AccountRecord, 'id' | 'created_at'>
    >;
    users: Knex.CompositeTableType<
      UserRecord,
      UserRecord,
      Partial<
        Pick<
          UserRecord,
          'deleted' | 'updated_at' | 'name' | 'email' | 'password'
        >
      >,
      Omit<UserRecord, 'id' | 'created_at'>
    >;
    user_accounts: Knex.CompositeTableType<
      UserAccountRecord,
      UserAccountRecord,
      UserAccountRecord,
      UserAccountRecord
    >;
    account_tags: Knex.CompositeTableType<
      AccountTagRecord,
      AccountTagRecord,
      Partial<Pick<AccountTagRecord, 'name' | 'updated_at'>>,
      Omit<AccountTagRecord, 'id' | 'created_at'>
    >;
    user_account_tags: Knex.CompositeTableType<
      UserAccountTagRecord,
      UserAccountTagRecord,
      UserAccountTagRecord,
      UserAccountTagRecord
    >;
  }
}
