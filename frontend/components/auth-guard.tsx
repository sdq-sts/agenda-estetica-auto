'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Calendar } from 'lucide-react';

/**
 * AuthGuard Component
 *
 * Client-side authentication guard that protects routes and manages redirects.
 *
 * Features:
 * - Checks localStorage for JWT token
 * - Redirects unauthenticated users to /login
 * - Redirects authenticated users away from /login
 * - Shows loading state during auth check
 * - Handles all route protection logic
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      // Public paths that don't require authentication
      const publicPaths = ['/login'];
      const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));
      const isAuthenticated = auth.isAuthenticated();

      // If on public path and authenticated, redirect to home
      if (isPublicPath && isAuthenticated) {
        router.replace('/');
        return;
      }

      // If on protected path and not authenticated, redirect to login
      if (!isPublicPath && !isAuthenticated) {
        router.replace('/login');
        return;
      }

      // Auth check complete
      setIsChecking(false);
    };

    checkAuth();
  }, [pathname, router]);

  // Show loading state while checking auth
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100/50">
        <div className="text-center">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-teal-600 rounded-xl blur-md opacity-40 animate-pulse"></div>
              <div className="relative p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-soft">
                <Calendar className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          {/* Loading Spinner */}
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>

          <p className="text-sm font-medium text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
