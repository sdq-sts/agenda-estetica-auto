import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;

  // Public paths that don't require authentication
  const publicPaths = ['/login'];
  const isPublicPath = publicPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  // If accessing a public path and already authenticated, redirect to home
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If accessing a protected path without authentication, redirect to login
  if (!isPublicPath && !token) {
    // Check localStorage on client side instead
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
};
