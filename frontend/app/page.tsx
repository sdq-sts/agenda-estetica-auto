'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '@/components/ui/modern-card';
import { BottomNav } from '@/components/bottom-nav';
import { UserMenu } from '@/components/user-menu';
import { Users, Car, Wrench, Calendar, CalendarDays, Sparkles, ArrowRight, Settings } from 'lucide-react';
import { clientesAPI, veiculosAPI, servicosAPI, agendamentosAPI } from '@/lib/api';

export default function Home() {
  const [stats, setStats] = useState({ clientes: 0, veiculos: 0, servicos: 0, agendamentos: 0 });
  const [loading, setLoading] = useState(true);

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
      } catch (e) {
        console.error('Error loading stats:', e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const statsData = [
    {
      label: 'Clientes',
      value: stats.clientes,
      icon: Users,
      gradient: 'from-blue-600 to-blue-700',
      lightBg: 'bg-blue-50/80',
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
    },
    {
      label: 'Veículos',
      value: stats.veiculos,
      icon: Car,
      gradient: 'from-teal-600 to-teal-700',
      lightBg: 'bg-teal-50/80',
      iconBg: 'bg-gradient-to-br from-teal-500 to-teal-600',
    },
    {
      label: 'Serviços',
      value: stats.servicos,
      icon: Wrench,
      gradient: 'from-blue-600 to-blue-700',
      lightBg: 'bg-blue-50/80',
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
    },
    {
      label: 'Agendamentos',
      value: stats.agendamentos,
      icon: Calendar,
      gradient: 'from-teal-600 to-teal-700',
      lightBg: 'bg-teal-50/80',
      iconBg: 'bg-gradient-to-br from-teal-500 to-teal-600',
    },
  ];

  const quickActions = [
    {
      href: '/clientes',
      icon: Users,
      title: 'Clientes',
      description: 'Gerenciar cadastros',
      gradient: 'from-blue-600 to-blue-700',
      hoverGlow: 'group-hover:shadow-glow-blue',
    },
    {
      href: '/veiculos',
      icon: Car,
      title: 'Veículos',
      description: 'Controlar frota',
      gradient: 'from-teal-600 to-teal-700',
      hoverGlow: 'group-hover:shadow-glow-teal',
    },
    {
      href: '/servicos',
      icon: Wrench,
      title: 'Serviços',
      description: 'Catálogo e preços',
      gradient: 'from-blue-600 to-blue-700',
      hoverGlow: 'group-hover:shadow-glow-blue',
    },
    {
      href: '/calendario',
      icon: CalendarDays,
      title: 'Calendário Semanal',
      description: 'Visualização de agendamentos',
      gradient: 'from-teal-600 to-teal-700',
      hoverGlow: 'group-hover:shadow-glow-teal',
    },
    {
      href: '/agendamentos',
      icon: Calendar,
      title: 'Lista de Agendamentos',
      description: 'Todos os agendamentos',
      gradient: 'from-blue-600 to-blue-700',
      hoverGlow: 'group-hover:shadow-glow-blue',
    },
    {
      href: '/configuracoes',
      icon: Settings,
      title: 'Configurações',
      description: 'Horários e bloqueios',
      gradient: 'from-teal-600 to-teal-700',
      hoverGlow: 'group-hover:shadow-glow-teal',
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50 pb-20 lg:pb-4">
        {/* Refined Header with better typography */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 sticky top-0 z-10">
          <div className="container mx-auto max-w-6xl px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-teal-600 rounded-xl blur-md opacity-40"></div>
                  <div className="relative p-2.5 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-medium">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-outfit font-bold text-gray-900 tracking-tight">
                    Agenda Estética Auto
                  </h1>
                  <p className="text-sm font-medium text-gray-500">
                    Gerenciamento de agendamentos
                  </p>
                </div>
              </div>
              <UserMenu />
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 max-w-6xl mt-8 space-y-10">
          {/* Stats Overview - Redesigned for better visual impact */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">
              Visão Geral
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {statsData.map((stat, index) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={index}
                    className="group animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <ModernCard className="overflow-hidden relative border-0 shadow-medium hover:shadow-lift transition-all duration-300">
                      {/* Gradient background overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-300`}></div>

                      {/* Decorative gradient blob */}
                      <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-[0.08] blur-3xl rounded-full group-hover:opacity-[0.12] transition-opacity duration-500`}></div>

                      <ModernCardHeader className="pb-5 relative">
                        <div className="flex flex-col gap-4">
                          {/* Icon */}
                          <div className={`relative w-14 h-14 bg-gradient-to-br ${stat.gradient} rounded-2xl shadow-soft transition-all duration-300 group-hover:scale-105 group-hover:shadow-medium group-hover:-translate-y-1 flex items-center justify-center`}>
                            <Icon className="w-7 h-7 text-white" />
                          </div>

                          {/* Stats */}
                          <div className="space-y-1.5">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                              {stat.label}
                            </p>
                            <p className="text-4xl md:text-5xl font-outfit font-bold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent tracking-tight">
                              {loading ? '...' : stat.value}
                            </p>
                          </div>
                        </div>
                      </ModernCardHeader>
                    </ModernCard>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions - Improved layout and interaction */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">
              Acesso Rápido
            </h2>
            <div className="grid gap-3 md:gap-4 md:grid-cols-2 lg:grid-cols-3">
              {quickActions.map((nav, index) => {
                const Icon = nav.icon;

                return (
                  <Link
                    key={index}
                    href={nav.href}
                    className="block group animate-slide-up"
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <ModernCard className="cursor-pointer transition-all duration-300 border-0 shadow-soft hover:shadow-medium hover:-translate-y-0.5 active:scale-[0.98]">
                      <ModernCardHeader className="pb-4">
                        <div className="flex items-center gap-4">
                          <div className={`relative p-3.5 bg-gradient-to-br ${nav.gradient} rounded-xl shadow-soft transition-all duration-300 group-hover:scale-110 group-hover:shadow-medium`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-outfit font-bold text-gray-900 tracking-tight mb-0.5 truncate">
                              {nav.title}
                            </h3>
                            <p className="text-xs text-gray-600 truncate">
                              {nav.description}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400 transition-all duration-300 group-hover:text-gray-700 group-hover:translate-x-1 flex-shrink-0" />
                        </div>
                      </ModernCardHeader>
                    </ModernCard>
                  </Link>
                );
              })}
            </div>
          </div>
        </main>
      </div>
      <BottomNav />
    </>
  );
}
