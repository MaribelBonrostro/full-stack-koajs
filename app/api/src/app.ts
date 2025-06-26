import { applicationFactory, config } from './lib';
import {
  accountRouteFactory,
  accountTagsRouteFactory,
  authRouteFactory,
  meRouteFactory,
} from './routes';

export const application = applicationFactory(config);

import cors from '@koa/cors';

application.use(
  cors({
    origin: ctx => {
      const allowed = [config.cors?.origin];
      const origin = ctx.request.header.origin;
      if (origin && allowed.includes(origin)) {
        return origin;
      }
      return '';
    },
    credentials: true,
  })
);
application.use(
  authRouteFactory({
    accessToken: { expiry: config.cookie.access.expiry },
    refreshToken: { expiry: config.cookie.refresh.expiry },
  }).attach()
);
application.use(
  accountRouteFactory({ publicKey: config.jwks.publicKey }).attach()
);
application.use(
  accountTagsRouteFactory({ publicKey: config.jwks.publicKey }).attach()
);
application.use(meRouteFactory({ publicKey: config.jwks.publicKey }).attach());
