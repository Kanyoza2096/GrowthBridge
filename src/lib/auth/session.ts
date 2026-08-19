import { SessionOptions } from 'iron-session';
import { serverConfig } from '@/lib/config/server';

export interface SessionData {
  user?: {
    id: string;
    email: string;
    role: string;
    name?: string;
    department?: string;
    avatar?: string;
    createdAt?: string;
  };
  isLoggedIn?: boolean;
  csrfToken?: string;
}

const isSecure = process.env.NODE_ENV === 'production' || process.env.CF_PAGES === '1';

export const sessionOptions: SessionOptions = {
  password: serverConfig.ADMIN_SESSION_SECRET,
  cookieName: 'growthbridge-admin-session',
  cookieOptions: {
    secure: isSecure,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: serverConfig.ADMIN_SESSION_MAX_AGE,
    path: '/',
  },
};
