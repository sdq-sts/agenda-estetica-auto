import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware for Route Protection
 *
 * NOTE: This middleware currently does minimal work because we use localStorage
 * for JWT storage (handled client-side by AuthGuard component).
 *
 * Future improvement: Migrate to httpOnly cookies for better security, then
 * this middleware can handle server-side authentication checks.
 *
 * Current behavior:
 * - Allows all requests through
 * - AuthGuard component (client-side) handles actual auth checks
 * - API calls redirect to /login on 401 (see lib/api.ts)
 */
export function middleware(request: NextRequest) {
  // Allow all requests - AuthGuard handles protection client-side
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (png, jpg, svg, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(png|jpg|jpeg|svg|gif|webp)$).*)',
  ],
};
