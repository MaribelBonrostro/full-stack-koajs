import type { Knex } from 'knex';

import type { AccountRecord, UserAccountRecord, UserRecord } from './schema';

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
  }
}
