import type { DateFields } from '../date';

export interface AccountRecord extends DateFields {
  id: string;
  name: string;
  deleted: boolean;
}

export interface UserRecord extends DateFields {
  id: string;
  email: string;
  password: string;
  name: string;
  deleted: boolean;
}

export interface UserAccountRecord {
  user_id: string;
  account_id: string;
}
