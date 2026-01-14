'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { auth } from '@/lib/auth';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Public paths
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
  }, [pathname, router]);

  return <>{children}</>;
}
