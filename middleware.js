import { NextResponse } from 'next/server';

const COOKIE_NAME = 'a2zee_auth_token';

/**
 * Pure Edge-compatible zero-eval JWT payload decoder with expiration check.
 */
function decodeJwtSession(token) {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const binaryStr = atob(base64);
    const jsonStr = decodeURIComponent(
      binaryStr
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const payload = JSON.parse(jsonStr);

    // Expiration check (exp in seconds)
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Protected paths
  const isUserPath = pathname.startsWith('/user');
  const isWorkerPath = pathname.startsWith('/worker');
  const isAdminPath = pathname.startsWith('/admin');

  if (!isUserPath && !isWorkerPath && !isAdminPath) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const session = decodeJwtSession(token);

  // 1. Unauthenticated -> Redirect to /auth?redirect=... and prevent caching
  if (!session) {
    const loginUrl = new URL('/auth', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    const redirectRes = NextResponse.redirect(loginUrl);
    redirectRes.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    redirectRes.headers.set('Pragma', 'no-cache');
    redirectRes.headers.set('Expires', '0');
    return redirectRes;
  }

  // 2. Role-Based Access Control (RBAC)
  if (isAdminPath) {
    const isAllowed = session.role === 'FEDERATION_ADMIN' || session.role === 'SOCIETY_ADMIN';
    if (!isAllowed) {
      const loginUrl = new URL('/auth', request.url);
      loginUrl.searchParams.set('error', 'requires_admin_role');
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isWorkerPath) {
    const isAllowed = session.role === 'WORKER' || session.role === 'FEDERATION_ADMIN';
    if (!isAllowed) {
      const loginUrl = new URL('/auth', request.url);
      loginUrl.searchParams.set('error', 'requires_worker_role');
      return NextResponse.redirect(loginUrl);
    }
  }

  // Set anti-cache headers on all authenticated pages so Back button forces server re-check
  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  return response;
}

export const config = {
  matcher: [
    '/user/:path*',
    '/worker/:path*',
    '/admin/:path*',
  ],
};
