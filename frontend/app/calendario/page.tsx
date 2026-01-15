'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CalendarioSemanal } from '@/components/calendario-semanal';
import { BottomNav } from '@/components/bottom-nav';
import { AgendamentoFormModal } from '@/components/agendamento-form-modal';
import { BloqueioModal } from '@/components/bloqueio-modal';
import { Toast, ToastType } from '@/components/toast';
import { agendamentosAPI, bloqueiosAPI } from '@/lib/api';
import { ArrowLeft, Calendar as CalendarIcon, User, Car, Wrench, X, Edit, Trash2, AlertTriangle, Plus, Filter, Search, Ban } from 'lucide-react';
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { StatusBadge, StatusType } from '@/components/ui/status-badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusMap: Record<string, { type: StatusType; label: string }> = {
  PENDENTE: { type: 'pending', label: 'Pendente' },
  CONFIRMADO: { type: 'confirmed', label: 'Confirmado' },
  CONCLUIDO: { type: 'completed', label: 'Concluído' },
  CANCELADO: { type: 'cancelled', label: 'Cancelado' },
};

interface AgendamentoEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    status: string;
    clienteNome: string;
    veiculoInfo?: string;
    servicosInfo?: string;
    valorTotal?: number;
    observacoes?: string;
    isBloqueio?: boolean;
  };
}

export default function CalendarioPage() {
  const [eventos, setEventos] = useState<AgendamentoEvent[]>([]);
  const [eventosFiltrados, setEventosFiltrados] = useState<AgendamentoEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<AgendamentoEvent | null>(null);

  // Form modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formInitialData, setFormInitialData] = useState<any>(null);

  // Delete confirmation states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Filter states
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');
  const [busca, setBusca] = useState('');

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Bloqueio states
  const [isBloqueioModalOpen, setIsBloqueioModalOpen] = useState(false);
  const [bloqueioDataHora, setBloqueioDataHora] = useState<Date>(new Date());
  const [showSlotOptions, setShowSlotOptions] = useState(false);
  const [slotSelected, setSlotSelected] = useState<{ start: Date; end: Date } | null>(null);

  useEffect(() => {
    loadAgendamentos();
  }, []);

  // Aplicar filtros sempre que mudarem
  useEffect(() => {
    let filtered = [...eventos];

    // Filtrar por status
    if (filtroStatus !== 'TODOS') {
      filtered = filtered.filter(e => e.resource.status === filtroStatus);
    }

    // Filtrar por busca (cliente ou veículo)
    if (busca.trim()) {
      const buscaLower = busca.toLowerCase();
      filtered = filtered.filter(e =>
        e.resource.clienteNome.toLowerCase().includes(buscaLower) ||
        e.resource.veiculoInfo?.toLowerCase().includes(buscaLower)
      );
    }

    setEventosFiltrados(filtered);
  }, [eventos, filtroStatus, busca]);

  async function loadAgendamentos() {
    try {
      const [agendamentosResponse, bloqueiosResponse] = await Promise.all([
        agendamentosAPI.getAll(1, 100),
        bloqueiosAPI.getAll(undefined, true),
      ]);

      // Formatar agendamentos (excluir cancelados do calendário)
      const eventosAgendamentos: AgendamentoEvent[] = agendamentosResponse.data
        .filter((a: any) => a.status !== 'CANCELADO')
        .map((a: any) => {
          const dataHora = new Date(a.dataHora);
          const dataFim = new Date(dataHora);

          // Duração estimada: 1 hora (pode ser ajustado conforme duração dos serviços)
          dataFim.setHours(dataHora.getHours() + 1);

          return {
            id: a.id,
            title: a.cliente?.nome || 'Cliente não informado',
            start: dataHora,
            end: dataFim,
            resource: {
              status: a.status || 'PENDENTE',
              clienteNome: a.cliente?.nome || 'Cliente não informado',
              veiculoInfo: a.veiculo
                ? `${a.veiculo.marca} ${a.veiculo.modelo} - ${a.veiculo.placa}`
                : undefined,
              servicosInfo: a.servicos?.map((s: any) => s.servico?.nome || 'Serviço').join(', '),
              valorTotal: a.valorTotal,
              observacoes: a.observacoes,
            },
          };
        });

      // Formatar bloqueios como eventos cinza
      const eventosBloqueios: AgendamentoEvent[] = bloqueiosResponse.map((b: any) => {
        let start: Date;
        let end: Date;

        if (b.tipo === 'PONTUAL' && b.dataEspecifica) {
          start = new Date(b.dataEspecifica);
          end = new Date(b.dataEspecifica);

          // Parse hora inicio e fim
          const [horaIni, minIni] = b.horaInicio.split(':').map(Number);
          const [horaFim, minFim] = b.horaFim.split(':').map(Number);

          start.setHours(horaIni, minIni, 0, 0);
          end.setHours(horaFim, minFim, 0, 0);
        } else {
          // Bloqueios recorrentes não aparecem diretamente no calendário
          // (precisariam de lógica mais complexa para repetir)
          return null;
        }

        return {
          id: `bloqueio-${b.id}`,
          title: b.motivo || '🚫 Bloqueado',
          start,
          end,
          resource: {
            status: 'BLOQUEADO',
            clienteNome: b.motivo || 'Horário bloqueado',
            isBloqueio: true,
          },
        };
      }).filter((e: any) => e !== null);

      // Combinar agendamentos e bloqueios
      const todosEventos = [...eventosAgendamentos, ...eventosBloqueios];

      setEventos(todosEventos);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      setToast({
        message: 'Erro ao carregar agendamentos. Tente novamente.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  }

  function handleSelectEvent(event: AgendamentoEvent) {
    // Não abrir modal de detalhes se for um bloqueio
    if (event.resource.isBloqueio) {
      setToast({ message: 'Este é um bloqueio de horário. Gerencie bloqueios em Configurações.', type: 'success' });
      return;
    }
    setSelectedEvent(event);
  }

  function handleSelectSlot(slotInfo: { start: Date; end: Date }) {
    // Mostrar opções: Agendar ou Bloquear
    setSlotSelected(slotInfo);
    setShowSlotOptions(true);
  }

  function handleOptionAgendar() {
    if (!slotSelected) return;
    setFormMode('create');
    setFormInitialData({ dataHora: slotSelected.start });
    setIsFormOpen(true);
    setShowSlotOptions(false);
    setSlotSelected(null);
  }

  function handleOptionBloquear() {
    if (!slotSelected) return;
    setBloqueioDataHora(slotSelected.start);
    setIsBloqueioModalOpen(true);
    setShowSlotOptions(false);
    setSlotSelected(null);
  }

  function handleBloqueioSuccess() {
    setToast({ message: 'Horário bloqueado com sucesso!', type: 'success' });
    loadAgendamentos();
  }

  function handleOpenEditForm() {
    if (!selectedEvent) return;

    // Buscar dados completos do agendamento para popular o form
    agendamentosAPI.getOne(selectedEvent.id).then((response) => {
      const agendamento = response;

      setFormMode('edit');
      setFormInitialData({
        id: agendamento.id,
        dataHora: new Date(agendamento.dataHora),
        clienteId: agendamento.clienteId,
        veiculoId: agendamento.veiculoId,
        servicoIds: agendamento.servicos?.map((s: any) => s.servicoId) || [],
        observacoes: agendamento.observacoes || '',
      });
      setIsFormOpen(true);
      setSelectedEvent(null); // Fechar modal de detalhes
    });
  }

  function handleOpenDeleteConfirm() {
    setShowDeleteConfirm(true);
  }

  async function handleDeleteAgendamento() {
    if (!selectedEvent) return;

    setDeleting(true);
    try {
      // Cancelar agendamento (mudar status para CANCELADO)
      await agendamentosAPI.update(selectedEvent.id, { status: 'CANCELADO' });

      // Recarregar agendamentos
      await loadAgendamentos();

      // Fechar modais
      setShowDeleteConfirm(false);
      setSelectedEvent(null);

      // Mostrar toast de sucesso
      setToast({
        message: 'Agendamento cancelado com sucesso!',
        type: 'success'
      });
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);

      // Mostrar toast de erro
      setToast({
        message: 'Erro ao cancelar agendamento. Tente novamente.',
        type: 'error'
      });
    } finally {
      setDeleting(false);
    }
  }

  function handleFormSuccess() {
    // Recarregar agendamentos após criar/editar
    loadAgendamentos();

    // Mostrar toast de sucesso
    setToast({
      message: formMode === 'create'
        ? 'Agendamento criado com sucesso!'
        : 'Agendamento atualizado com sucesso!',
      type: 'success'
    });
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50 pb-20 lg:pb-4">
        {/* Header - Cleaner and more modern */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-soft">
          <div className="container mx-auto max-w-6xl px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              {/* Left: Back + Title */}
              <div className="flex items-center gap-3 min-w-0">
                <Link href="/">
                  <Button variant="ghost" size="icon" className="min-w-[44px] min-h-[44px] flex-shrink-0">
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                </Link>
                <div className="min-w-0">
                  <h1 className="text-xl md:text-2xl font-outfit font-bold text-gray-900 tracking-tight truncate">
                    Calendário
                  </h1>
                  <p className="text-xs md:text-sm text-gray-600 hidden md:block">
                    {eventos.length} {eventos.length === 1 ? 'agendamento' : 'agendamentos'}
                  </p>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  onClick={() => {
                    setFormMode('create');
                    setFormInitialData({ dataHora: new Date() });
                    setIsFormOpen(true);
                  }}
                  className="min-h-[44px] gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Novo</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 max-w-6xl mt-6 space-y-6">
          {/* Quick Stats + Filters - Combined for cleaner layout */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-soft p-4 md:p-6 space-y-6">
            {/* Status Summary */}
            <div className="flex items-center gap-6 overflow-x-auto pb-2">
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  <strong className="font-semibold text-gray-900">{eventos.length}</strong> Total
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  <strong className="font-semibold text-blue-600">{eventos.filter(e => e.resource.status === 'CONFIRMADO').length}</strong> Confirmados
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  <strong className="font-semibold text-amber-600">{eventos.filter(e => e.resource.status === 'PENDENTE').length}</strong> Pendentes
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  <strong className="font-semibold text-green-600">{eventos.filter(e => e.resource.status === 'CONCLUIDO').length}</strong> Concluídos
                </span>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Busca */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar cliente ou veículo..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                  />
                </div>
              </div>

              {/* Filtro de Status */}
              <div className="sm:w-48">
                <select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm font-medium bg-white appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 0.75rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.25rem'
                  }}
                >
                  <option value="TODOS">Todos</option>
                  <option value="PENDENTE">Pendentes</option>
                  <option value="CONFIRMADO">Confirmados</option>
                  <option value="CONCLUIDO">Concluídos</option>
                  <option value="CANCELADO">Cancelados</option>
                </select>
              </div>

              {/* Limpar Filtros */}
              {(busca || filtroStatus !== 'TODOS') && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setBusca('');
                    setFiltroStatus('TODOS');
                  }}
                  className="min-w-[44px] min-h-[44px] flex-shrink-0"
                  title="Limpar filtros"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Contador de resultados filtrados */}
            {(busca || filtroStatus !== 'TODOS') && (
              <div className="text-sm text-gray-600 pt-3 border-t border-gray-100">
                {eventosFiltrados.length === 0 ? (
                  <span>Nenhum agendamento encontrado</span>
                ) : (
                  <span>
                    <strong className="text-gray-900">{eventosFiltrados.length}</strong> {eventosFiltrados.length === 1 ? 'agendamento encontrado' : 'agendamentos encontrados'}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Calendário */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <CalendarioSemanal
              eventos={eventosFiltrados}
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
            />
          )}
        </main>

        {/* Modal de detalhes do evento */}
        {selectedEvent && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end md:items-center justify-center md:p-4"
            onClick={() => setSelectedEvent(null)}
          >
            <div
              className="bg-white rounded-t-2xl md:rounded-xl shadow-lift max-w-lg w-full animate-slide-up md:animate-scale-in max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 md:p-8">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-outfit font-bold text-gray-900">
                      Detalhes do Agendamento
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedEvent(null)}
                    className="min-w-[44px] min-h-[44px]"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="space-y-4">
                  {/* Cliente */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Cliente
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedEvent.resource.clienteNome}
                      </p>
                    </div>
                  </div>

                  {/* Data/Hora */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg">
                      <CalendarIcon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Data e Hora
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {format(selectedEvent.start, 'PPP - HH:mm', { locale: ptBR })}
                      </p>
                    </div>
                  </div>

                  {/* Veículo */}
                  {selectedEvent.resource.veiculoInfo && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                        <Car className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Veículo
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedEvent.resource.veiculoInfo}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Serviços */}
                  {selectedEvent.resource.servicosInfo && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg">
                        <Wrench className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Serviços
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedEvent.resource.servicosInfo}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Status */}
                  <div className="pt-3 border-t border-gray-200">
                    <StatusBadge
                      status={statusMap[selectedEvent.resource.status]?.type || 'pending'}
                      label={statusMap[selectedEvent.resource.status]?.label || selectedEvent.resource.status}
                    />
                  </div>

                  {/* Valor Total */}
                  {selectedEvent.resource.valorTotal && (
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Valor Total
                      </p>
                      <p className="text-2xl font-outfit font-bold text-gray-900">
                        R$ {selectedEvent.resource.valorTotal.toFixed(2)}
                      </p>
                    </div>
                  )}

                  {/* Observações */}
                  {selectedEvent.resource.observacoes && (
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Observações
                      </p>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200">
                        {selectedEvent.resource.observacoes}
                      </p>
                    </div>
                  )}

                  {/* Ações */}
                  {selectedEvent.resource.status !== 'CANCELADO' && (
                    <div className="pt-4 border-t border-gray-200 flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1 min-h-[44px]"
                        onClick={handleOpenEditForm}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1 min-h-[44px]"
                        onClick={handleOpenDeleteConfirm}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Confirmação de Cancelamento */}
        {showDeleteConfirm && selectedEvent && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <div
              className="bg-white rounded-xl shadow-lift max-w-md w-full animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-outfit font-bold text-gray-900 mb-1">
                      Cancelar Agendamento?
                    </h3>
                    <p className="text-sm text-gray-600">
                      Tem certeza que deseja cancelar o agendamento de{' '}
                      <strong>{selectedEvent.resource.clienteNome}</strong>?
                      Esta ação não pode ser desfeita.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 min-h-[44px]"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleting}
                  >
                    Voltar
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1 min-h-[44px]"
                    onClick={handleDeleteAgendamento}
                    disabled={deleting}
                  >
                    {deleting ? 'Cancelando...' : 'Sim, Cancelar'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Opções (Agendar ou Bloquear) */}
        {showSlotOptions && slotSelected && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSlotOptions(false)}
          >
            <div
              className="bg-white rounded-xl shadow-lift max-w-sm w-full p-6 animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-outfit font-bold text-gray-900 mb-4">
                O que deseja fazer?
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {format(slotSelected.start, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>

              <div className="space-y-3">
                <Button
                  onClick={handleOptionAgendar}
                  className="w-full min-h-[44px] justify-start"
                >
                  <CalendarIcon className="w-5 h-5 mr-3" />
                  Criar Agendamento
                </Button>
                <Button
                  onClick={handleOptionBloquear}
                  variant="destructive"
                  className="w-full min-h-[44px] justify-start"
                >
                  <Ban className="w-5 h-5 mr-3" />
                  Bloquear este Horário
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Formulário (Criar/Editar) */}
        <AgendamentoFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSuccess={handleFormSuccess}
          mode={formMode}
          initialData={formInitialData}
        />

        {/* Modal de Bloqueio */}
        <BloqueioModal
          isOpen={isBloqueioModalOpen}
          onClose={() => setIsBloqueioModalOpen(false)}
          onSuccess={handleBloqueioSuccess}
          dataHora={bloqueioDataHora}
        />

        {/* Toast de Feedback */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
      <BottomNav />
    </>
  );
}
