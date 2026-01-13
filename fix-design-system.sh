#!/bin/bash
cd /home/sdq-farm/code/agenda-estetica-auto/frontend

# Component: Bottom Navigation (Mobile-First)
mkdir -p components
cat > components/bottom-nav.tsx << 'EOF'
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Car, Wrench, Calendar } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/clientes', icon: Users, label: 'Clientes' },
    { href: '/veiculos', icon: Car, label: 'Veículos' },
    { href: '/servicos', icon: Wrench, label: 'Serviços' },
    { href: '/agendamentos', icon: Calendar, label: 'Agenda' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 lg:hidden">
      <div className="flex justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg min-w-[44px] min-h-[44px] transition ${
                isActive
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
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
EOF

# NEW Home Page - Design System Completo
cat > app/page.tsx << 'EOFPAGE'
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BottomNav } from '@/components/bottom-nav';
import { Users, Car, Wrench, Calendar, TrendingUp } from 'lucide-react';
import { clientesAPI, veiculosAPI, servicosAPI, agendamentosAPI } from '@/lib/api';

export default function Home() {
  const [stats, setStats] = useState({ clientes: 0, veiculos: 0, servicos: 0, agendamentos: 0 });

  useEffect(() => {
    async function loadStats() {
      try {
        const [c, v, s, a] = await Promise.all([
          clientesAPI.getAll(),
          veiculosAPI.getAll(),
          servicosAPI.getAll(),
          agendamentosAPI.getAll(),
        ]);
        setStats({
          clientes: c.meta.total,
          veiculos: v.meta.total,
          servicos: s.meta.total,
          agendamentos: a.meta.total,
        });
      } catch (e) {}
    }
    loadStats();
  }, []);

  return (
    <>
      <div className="min-h-screen bg-gray-50 pb-20 lg:pb-4">
        {/* Header */}
        <header className="bg-primary-600 text-white p-6 shadow-md">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 18.5a1.5 1.5 0 0 1-1 1.5H7a1.5 1.5 0 0 1-1-1.5V6.621c0-.206.21-.37.417-.31l7 2.012a.5.5 0 0 0 .583-.49V4.5A1.5 1.5 0 0 1 15.5 3h1A1.5 1.5 0 0 1 18 4.5z"/>
                  <path d="M8.5 6a.5.5 0 0 0-.496.56l.528 5.284a.5.5 0 0 0 .992 0l.528-5.284A.5.5 0 0 0 9.5 6z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Agenda Estética Auto</h1>
                <p className="text-primary-100 text-sm mt-1">Sistema de Gerenciamento - MVP Fase 1</p>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto p-4 max-w-6xl">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="hover:shadow-md transition">
              <CardHeader className="pb-2">
                <CardDescription>Clientes</CardDescription>
                <CardTitle className="text-3xl text-primary-600">{stats.clientes}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="hover:shadow-md transition">
              <CardHeader className="pb-2">
                <CardDescription>Veículos</CardDescription>
                <CardTitle className="text-3xl text-primary-600">{stats.veiculos}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="hover:shadow-md transition">
              <CardHeader className="pb-2">
                <CardDescription>Serviços</CardDescription>
                <CardTitle className="text-3xl text-primary-600">{stats.servicos}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="hover:shadow-md transition">
              <CardHeader className="pb-2">
                <CardDescription>Agendamentos</CardDescription>
                <CardTitle className="text-3xl text-primary-600">{stats.agendamentos}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Main Navigation Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            <Link href="/clientes">
              <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary-100 rounded-lg">
                      <Users className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <CardTitle>Clientes</CardTitle>
                      <CardDescription>Gerenciar cadastros</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Cadastre e gerencie seus clientes, veículos e histórico completo de atendimentos.
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/veiculos">
              <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary-100 rounded-lg">
                      <Car className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <CardTitle>Veículos</CardTitle>
                      <CardDescription>Controle de frota</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Cadastro completo de veículos com marca, modelo, placa e histórico de serviços.
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/servicos">
              <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary-100 rounded-lg">
                      <Wrench className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <CardTitle>Serviços</CardTitle>
                      <CardDescription>Catálogo e preços</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Gerencie seu catálogo de serviços, categorias, durações e valores.
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/agendamentos">
              <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary-100 rounded-lg">
                      <Calendar className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <CardTitle>Agendamentos</CardTitle>
                      <CardDescription>Agenda e controle</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Visualize e gerencie todos os agendamentos com status e horários.
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </main>
      </div>
      <BottomNav />
    </>
  );
}
EOFPAGE

echo "✅ Design System implementado corretamente!"
