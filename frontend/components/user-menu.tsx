'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { LogOut, User } from 'lucide-react';

export function UserMenu() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(auth.getUser());
  }, []);

  const handleLogout = () => {
    auth.logout();
    router.push('/login');
  };

  if (!user) return null;

  return (
    <div className="flex items-center gap-3">
      {/* User Info */}
      <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-xl bg-white border border-gray-200/60 shadow-soft">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900">
            {user.nome}
          </span>
          <span className="text-xs text-gray-500">{user.tenant.nome}</span>
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200/60 hover:border-red-300 hover:bg-red-50 text-gray-700 hover:text-red-600 transition-all duration-200 shadow-soft hover:shadow-medium active:scale-[0.98]"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline text-sm font-medium">Sair</span>
      </button>
    </div>
  );
}
