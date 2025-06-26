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

export interface AccountTagRecord extends DateFields {
  id: string;
  account_id: string;
  name: string;
}

export interface UserAccountTagRecord {
  user_id: string;
  tag_id: string;
}
