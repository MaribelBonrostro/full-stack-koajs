import { createApplication, generateSwaggerSpec } from '@nokkel/api';
import type { LogLevel } from '@nokkel/monitoring';

import {
  AccountService,
  AccountTagService,
  AuthService,
  JwtService,
  UserService,
} from '../service';

import { Database, type DatabaseConfig } from './database';

type Config = {
  hostname: string;
  app: { name: string; version: string };
  cookie: {
    keys: string[];
    access: { expiry: number };
    refresh: { expiry: number };
  };
  database: DatabaseConfig;
  log: { level: LogLevel };
  cors?: { origin?: string; credentials?: boolean };
  jwks: { privateKey: string; publicKey: string };
};

export function applicationFactory(config: Config) {
  const application = createApplication({
    config: {
      name: config.hostname,
      logLevel: config.log.level,
      services: {
        account: new AccountService(),
        accountTag: new AccountTagService(),
        auth: new AuthService(),
        db: new Database(config.database),
        jwt: new JwtService(config.jwks.privateKey, config.jwks.publicKey, {
          accessToken: { expiry: config.cookie.access.expiry },
          refreshToken: { expiry: config.cookie.refresh.expiry },
        }),
        user: new UserService(),
      },
    },
    cors: { origin: config.cors?.origin, credentials: true },
    koa: {
      keys: config.cookie.keys,
    },
    body: {},
    swagger: {
      spec: generateSwaggerSpec({
        definition: {
          info: {
            title: config.app.name,
            version: config.app.version,
          },
        },
      }),
    },
  });
  return application;
}
