import type { Middleware } from '@nokkel/api';

import type { Database } from '../../lib/database';
import {
  type AuthService,
  getStatusForError,
  type JwtService,
} from '../../service';

export function getAuthMiddlewareFactory(config: {
  accessToken: { expiry: number };
  refreshToken: { expiry: number };
}): Middleware<
  { accessToken: string; expiry: string },
  { auth: AuthService; db: Database; jwt: JwtService }
> {
  return async function getAuthMiddleware(ctx) {
    const { email, password } = ctx.request.body;

    await ctx.services.db
      .transaction(async trx => {
        const auth = await ctx.services.auth.getAuthFromEmailPassword({
          email,
          password,
        })(trx);
        const { accessToken, refreshToken, expiry } =
          await ctx.services.jwt.getJwtFromAuth(auth);

        ctx.body = { accessToken, expiry: expiry.toISOString() };
        ctx.cookies.set('accessToken', accessToken, {
          signed: true,
          sameSite: true,
          httpOnly: false,
          maxAge: config.accessToken.expiry,
        });
        ctx.cookies.set('refreshToken', refreshToken, {
          signed: true,
          sameSite: true,
          httpOnly: true,
          maxAge: config.refreshToken.expiry,
        });
        ctx.status = 200;
      })
      .catch(error => {
        ctx.throw(error?.message, getStatusForError(error), { expose: false });
      });
  };
}
