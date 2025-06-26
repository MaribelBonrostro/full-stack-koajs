CREATE TABLE IF NOT EXISTS users (
  id         UUID NOT NULL PRIMARY KEY,
  email      VARCHAR(255) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  name       VARCHAR(255) NOT NULL,
  deleted    BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS user_accounts (
  user_id UUID NOT NULL,
  account_id UUID NOT NULL,

  CONSTRAINT pk_user_account
    PRIMARY KEY (user_id, account_id),

  CONSTRAINT fk_user
    FOREIGN KEY (user_id)
    REFERENCES users (id),

  CONSTRAINT fk_account
    FOREIGN KEY (account_id)
    REFERENCES accounts (id)
);

CREATE TABLE IF NOT EXISTS accounts (
  id            UUID NOT NULL PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  deleted       boolean NOT NULL,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at    TIMESTAMP WITH TIME ZONE NOT NULL
);


-- account_tags table
CREATE TABLE IF NOT EXISTS account_tags (
  id  UUID NOT NULL PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- user_account_tags table (join table)
CREATE TABLE IF NOT EXISTS user_account_tags (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES account_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, tag_id)
);