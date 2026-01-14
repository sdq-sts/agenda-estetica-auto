'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { StatusBadge, StatusType } from '@/components/ui/status-badge';
import { BottomNav } from '@/components/bottom-nav';
import { MobileAgendamentoCard } from '@/components/mobile-agendamento-card';
import { agendamentosAPI } from '@/lib/api';
import { ArrowLeft, Calendar, User, Car, Wrench } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusMap: Record<string, { type: StatusType; label: string }> = {
  PENDENTE: { type: 'pending', label: 'Pendente' },
  CONFIRMADO: { type: 'confirmed', label: 'Confirmado' },
  CONCLUIDO: { type: 'completed', label: 'Concluído' },
  CANCELADO: { type: 'cancelled', label: 'Cancelado' },
};

export default function AgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAgendamentos(); }, []);

  async function loadAgendamentos() {
    try { const data = await agendamentosAPI.getAll(); setAgendamentos(data.data); } finally { setLoading(false); }
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 pb-20 lg:pb-4">
        {/* Clean Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="container mx-auto max-w-6xl px-6 py-4">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="icon" className="min-w-[44px] min-h-[44px]">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Agendamentos</h1>
                <p className="text-sm text-gray-600">Gestão de agenda</p>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 max-w-6xl mt-6 space-y-6">
          {/* Header com contador */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Próximos Agendamentos</h2>
            <p className="text-sm text-gray-600">Total: {agendamentos.length} agendados</p>
          </div>

          {/* Lista de Agendamentos */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
          ) : agendamentos.length === 0 ? (
            <ModernCard>
              <ModernCardContent className="py-12 text-center">
                <div className="text-gray-300 mb-4">
                  <Calendar className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhum agendamento</h3>
                <p className="text-sm text-gray-600">Quando houver agendamentos, eles aparecerão aqui</p>
              </ModernCardContent>
            </ModernCard>
          ) : (
            <>
              {/* Mobile Cards */}
              <div className="flex flex-col gap-3 md:hidden">
                {agendamentos.map((a) => {
                  const status = statusMap[a.status] || { type: 'pending' as StatusType, label: a.status };
                  return (
                    <MobileAgendamentoCard
                      key={a.id}
                      agendamento={a}
                      statusInfo={status}
                    />
                  );
                })}
              </div>

              {/* Desktop Cards */}
              <div className="hidden md:flex md:flex-col gap-4">
                {agendamentos.map((a) => {
                  const status = statusMap[a.status] || { type: 'pending' as StatusType, label: a.status };
                  return (
                    <ModernCard key={a.id}>
                      <ModernCardHeader className="pb-3">
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <User className="w-5 h-5 text-gray-600" />
                              <ModernCardTitle className="text-lg">{a.cliente?.nome || 'Cliente não informado'}</ModernCardTitle>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span className="font-medium">{format(new Date(a.dataHora), 'PPP - HH:mm', { locale: ptBR })}</span>
                            </div>
                          </div>
                          <StatusBadge status={status.type} label={status.label} />
                        </div>
                      </ModernCardHeader>
                      <ModernCardContent className="space-y-3">
                        {a.veiculo && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Car className="w-4 h-4" />
                            <span>{a.veiculo.marca} {a.veiculo.modelo} - <span className="font-mono text-xs">{a.veiculo.placa}</span></span>
                          </div>
                        )}
                        {a.servicos && a.servicos.length > 0 && (
                          <div className="flex items-start gap-2 text-sm text-gray-600">
                            <Wrench className="w-4 h-4 mt-0.5" />
                            <span>{a.servicos.map((s: any) => s.servico?.nome || 'Serviço').join(', ')}</span>
                          </div>
                        )}
                        {a.observacoes && (
                          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <strong className="text-gray-700">Observações:</strong> {a.observacoes}
                          </div>
                        )}
                        <div className="pt-3 border-t border-gray-200">
                          <p className="text-2xl font-bold text-gray-900">
                            R$ {a.valorTotal?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                      </ModernCardContent>
                    </ModernCard>
                  );
                })}
              </div>
            </>
          )}
        </main>
      </div>
      <BottomNav />
    </>
  );
}
