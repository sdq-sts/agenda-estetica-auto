'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Car, Wrench, Calendar, CalendarDays } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/clientes', icon: Users, label: 'Clientes' },
    { href: '/veiculos', icon: Car, label: 'Veículos' },
    { href: '/servicos', icon: Wrench, label: 'Serviços' },
    { href: '/calendario', icon: CalendarDays, label: 'Calendário' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 lg:hidden">
      <div className="flex justify-around py-2 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg min-w-[44px] min-h-[44px] transition-colors ${
                isActive
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
