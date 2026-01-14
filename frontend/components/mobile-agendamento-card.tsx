'use client';

import { useState } from 'react';
import { Calendar, User, Car, Wrench, ChevronDown, DollarSign } from 'lucide-react';
import { ModernCard } from '@/components/ui/modern-card';
import { StatusBadge, StatusType } from '@/components/ui/status-badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Agendamento {
  id: string;
  dataHora: string;
  status: string;
  cliente?: {
    nome: string;
  } | null;
  veiculo?: {
    marca: string;
    modelo: string;
    placa: string;
  } | null;
  servicos?: Array<{
    servico?: {
      nome: string;
    } | null;
  }>;
  observacoes?: string | null;
  valorTotal?: number | null;
}

interface MobileAgendamentoCardProps {
  agendamento: Agendamento;
  statusInfo: { type: StatusType; label: string };
}

export function MobileAgendamentoCard({ agendamento, statusInfo }: MobileAgendamentoCardProps) {
  const [expanded, setExpanded] = useState(false);
  const dataHora = new Date(agendamento.dataHora);

  return (
    <ModernCard
      className="relative transition-all duration-300"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-4">
        {/* Header Compacto */}
        <div className="flex items-start gap-3">
          {/* Ícone de Data */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex flex-col items-center justify-center flex-shrink-0 shadow-soft">
            <span className="text-[10px] font-semibold text-white/80 uppercase">
              {format(dataHora, 'MMM', { locale: ptBR })}
            </span>
            <span className="text-xl font-outfit font-bold text-white leading-none">
              {format(dataHora, 'd')}
            </span>
          </div>

          {/* Cliente + Horário */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-outfit font-bold text-gray-900 truncate">
              {agendamento.cliente?.nome || 'Cliente não informado'}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-600 font-medium">
                {format(dataHora, 'HH:mm')}
              </span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex-shrink-0">
            <StatusBadge status={statusInfo.type} label={statusInfo.label} />
          </div>
        </div>

        {/* Valor em Destaque (sempre visível) */}
        {agendamento.valorTotal && (
          <div className="mt-3 flex items-center justify-between px-3 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-lg">
            <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Valor</span>
            <span className="text-lg font-outfit font-bold text-green-700">
              R$ {agendamento.valorTotal.toFixed(2)}
            </span>
          </div>
        )}

        {/* Detalhes Expandidos */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            expanded ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="space-y-2.5 pt-3 border-t border-gray-100">
            {/* Veículo */}
            {agendamento.veiculo && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                  <Car className="w-4 h-4 text-teal-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 font-medium">
                    {agendamento.veiculo.marca} {agendamento.veiculo.modelo}
                  </p>
                  <p className="text-xs font-mono text-gray-500 mt-0.5">
                    {agendamento.veiculo.placa}
                  </p>
                </div>
              </div>
            )}

            {/* Serviços */}
            {agendamento.servicos && agendamento.servicos.length > 0 && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Wrench className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 font-medium">
                    {agendamento.servicos.map((s) => s.servico?.nome || 'Serviço').join(', ')}
                  </p>
                </div>
              </div>
            )}

            {/* Observações */}
            {agendamento.observacoes && (
              <div className="px-3 py-2 bg-amber-50 border border-amber-100 rounded-lg">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">
                  Observações
                </p>
                <p className="text-sm text-amber-900 leading-relaxed">
                  {agendamento.observacoes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Indicador de Expansão */}
        <div className="flex justify-center mt-3">
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
              expanded ? 'rotate-180' : ''
            }`}
          />
        </div>
      </div>
    </ModernCard>
  );
}
