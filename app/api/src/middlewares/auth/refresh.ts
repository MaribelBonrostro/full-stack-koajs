import type { Middleware } from '@nokkel/api';

import type { Database } from '../../lib/database';
import {
  type AuthService,
  getStatusForError,
  type JwtService,
} from '../../service';

export function refreshAuthMiddlewareFactory(config: {
  accessToken: { expiry: number };
  refreshToken: { expiry: number };
}): Middleware<
  { accessToken: string; expiry: string },
  { auth: AuthService; db: Database; jwt: JwtService }
> {
  return async function refeshAuthMiddleware(ctx) {
    try {
      const oldRefreshToken = ctx.cookies.get('refreshToken');
      if (!oldRefreshToken) ctx.throw(401, 'Invalid auth');

      const { accessToken, refreshToken, expiry } =
        await ctx.services.jwt.getJwtFromRefreshToken(oldRefreshToken!)(
          ctx.services.db.connection
        );

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      ctx.cookies.set('refreshToken', '', {
        signed: true,
        sameSite: true,
        httpOnly: true,
        maxAge: -1,
      });
      ctx.throw(error?.message, getStatusForError(error), { expose: false });
    }
  };
}
