'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { X, User, Car, Wrench, Calendar, Clock, DollarSign, FileText } from 'lucide-react';
import { clientesAPI, veiculosAPI, servicosAPI, agendamentosAPI } from '@/lib/api';
import { format } from 'date-fns';

interface AgendamentoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: 'create' | 'edit';
  initialData?: {
    id?: string;
    dataHora: Date;
    clienteId?: string;
    veiculoId?: string;
    servicoIds?: string[];
    observacoes?: string;
  };
}

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  veiculos: Veiculo[];
}

interface Veiculo {
  id: string;
  marca: string;
  modelo: string;
  placa: string;
  ano: number;
}

interface Servico {
  id: string;
  nome: string;
  categoria: string;
  duracaoMinutos: number;
  preco: number;
  ativo: boolean;
}

export function AgendamentoFormModal({
  isOpen,
  onClose,
  onSuccess,
  mode,
  initialData,
}: AgendamentoFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [veiculosDisponiveis, setVeiculosDisponiveis] = useState<Veiculo[]>([]);

  // Form state
  const [dataHora, setDataHora] = useState(initialData?.dataHora || new Date());
  const [clienteId, setClienteId] = useState(initialData?.clienteId || '');
  const [veiculoId, setVeiculoId] = useState(initialData?.veiculoId || '');
  const [servicosSelecionados, setServicosSelecionados] = useState<string[]>(initialData?.servicoIds || []);
  const [observacoes, setObservacoes] = useState(initialData?.observacoes || '');

  // Payment state
  const [statusPagamento, setStatusPagamento] = useState<string>('PENDENTE');
  const [formaPagamento, setFormaPagamento] = useState<string>('');
  const [valorPago, setValorPago] = useState<string>('');

  // Error state
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Load initial data
  useEffect(() => {
    if (isOpen) {
      loadClientes();
      loadServicos();
    }
  }, [isOpen]);

  // Update veículos when cliente changes
  useEffect(() => {
    if (clienteId) {
      const cliente = clientes.find(c => c.id === clienteId);
      if (cliente) {
        setVeiculosDisponiveis(cliente.veiculos || []);
        // Reset veículo se não pertence ao novo cliente
        if (veiculoId && !cliente.veiculos.some(v => v.id === veiculoId)) {
          setVeiculoId('');
        }
      }
    } else {
      setVeiculosDisponiveis([]);
      setVeiculoId('');
    }
  }, [clienteId, clientes]);

  async function loadClientes() {
    try {
      const response = await clientesAPI.getAll(1, 1000);
      setClientes(response.data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  }

  async function loadServicos() {
    try {
      const response = await servicosAPI.getAll(1, 1000);
      setServicos(response.data.filter((s: Servico) => s.ativo));
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
    }
  }

  function toggleServico(servicoId: string) {
    setServicosSelecionados(prev =>
      prev.includes(servicoId)
        ? prev.filter(id => id !== servicoId)
        : [...prev, servicoId]
    );
  }

  function calcularValorTotal(): number {
    return servicos
      .filter(s => servicosSelecionados.includes(s.id))
      .reduce((total, s) => total + s.preco, 0);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(''); // Clear previous errors

    if (!clienteId || !veiculoId || servicosSelecionados.length === 0) {
      setErrorMessage('Preencha todos os campos obrigatórios');
      return;
    }

    // Validate payment fields
    if (statusPagamento === 'PAGO') {
      if (!formaPagamento) {
        setErrorMessage('Selecione a forma de pagamento');
        return;
      }
      if (!valorPago || parseFloat(valorPago) <= 0) {
        setErrorMessage('Informe o valor pago');
        return;
      }
    }

    setLoading(true);

    try {
      const payload: any = {
        dataHora: dataHora.toISOString(),
        clienteId,
        veiculoId,
        servicos: servicosSelecionados.map(id => {
          const servico = servicos.find(s => s.id === id);
          return { servicoId: id, preco: servico?.preco || 0 };
        }),
        observacoes: observacoes || undefined,
        status: 'PENDENTE',
        statusPagamento,
      };

      if (statusPagamento === 'PAGO') {
        payload.formaPagamento = formaPagamento;
        payload.valorPago = parseFloat(valorPago);
      }

      if (mode === 'create') {
        await agendamentosAPI.create(payload);
      } else if (mode === 'edit' && initialData?.id) {
        await agendamentosAPI.update(initialData.id, payload);
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erro ao salvar agendamento:', error);
      const message = error.response?.data?.message || 'Erro ao salvar agendamento. Tente novamente.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  const valorTotal = calcularValorTotal();

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end md:items-center justify-center md:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl md:rounded-xl shadow-lift max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up md:animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <div className="p-6 md:p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h3 className="text-2xl font-outfit font-bold text-gray-900 tracking-tight">
                  {mode === 'create' ? 'Novo Agendamento' : 'Editar Agendamento'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Preencha os dados abaixo
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="min-w-[44px] min-h-[44px]"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 animate-shake">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-red-800 mb-1">
                    Erro ao salvar agendamento
                  </h4>
                  <p className="text-sm text-red-700">
                    {errorMessage}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setErrorMessage('')}
                  className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-6">
              {/* Data e Hora */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Data e Hora
                </label>
                <input
                  type="datetime-local"
                  value={format(dataHora, "yyyy-MM-dd'T'HH:mm")}
                  onChange={(e) => setDataHora(new Date(e.target.value))}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  required
                />
              </div>

              {/* Cliente */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Cliente *
                </label>
                <select
                  value={clienteId}
                  onChange={(e) => setClienteId(e.target.value)}
                  className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 0.75rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.25rem'
                  }}
                  required
                >
                  <option value="">Selecione um cliente</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nome} - {cliente.telefone}
                    </option>
                  ))}
                </select>
              </div>

              {/* Veículo */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  <Car className="w-4 h-4 inline mr-1" />
                  Veículo *
                </label>
                <select
                  value={veiculoId}
                  onChange={(e) => setVeiculoId(e.target.value)}
                  className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 0.75rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.25rem'
                  }}
                  required
                  disabled={!clienteId}
                >
                  <option value="">
                    {clienteId ? 'Selecione um veículo' : 'Selecione um cliente primeiro'}
                  </option>
                  {veiculosDisponiveis.map((veiculo) => (
                    <option key={veiculo.id} value={veiculo.id}>
                      {veiculo.marca} {veiculo.modelo} - {veiculo.placa}
                    </option>
                  ))}
                </select>
              </div>

              {/* Serviços */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  <Wrench className="w-4 h-4 inline mr-1" />
                  Serviços * (selecione um ou mais)
                </label>
                <div className="grid gap-3 md:grid-cols-2">
                  {servicos.map((servico) => {
                    const isSelected = servicosSelecionados.includes(servico.id);
                    return (
                      <label
                        key={servico.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleServico(servico.id)}
                          className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-100"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-gray-900">
                            {servico.nome}
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            {servico.categoria} • {servico.duracaoMinutos}min • R$ {servico.preco.toFixed(2)}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Observações
                </label>
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={3}
                  placeholder="Informações adicionais sobre o agendamento..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                />
              </div>

              {/* Pagamento */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                  💳 Pagamento
                </h4>

                {/* Status Pagamento */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Status do Pagamento
                  </label>
                  <select
                    value={statusPagamento}
                    onChange={(e) => {
                      setStatusPagamento(e.target.value);
                      if (e.target.value !== 'PAGO') {
                        setFormaPagamento('');
                        setValorPago('');
                      }
                    }}
                    className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundPosition: 'right 0.75rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.25rem'
                    }}
                  >
                    <option value="PENDENTE">Pendente</option>
                    <option value="PAGO">Pago</option>
                    <option value="REEMBOLSADO">Reembolsado</option>
                  </select>
                </div>

                {/* Forma de Pagamento - só aparece se PAGO */}
                {statusPagamento === 'PAGO' && (
                  <>
                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Forma de Pagamento *
                      </label>
                      <select
                        value={formaPagamento}
                        onChange={(e) => setFormaPagamento(e.target.value)}
                        className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white appearance-none cursor-pointer"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                          backgroundPosition: 'right 0.75rem center',
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '1.25rem'
                        }}
                        required
                      >
                        <option value="">Selecione a forma de pagamento</option>
                        <option value="PIX">PIX</option>
                        <option value="DINHEIRO">Dinheiro</option>
                        <option value="CARTAO">Cartão de Crédito</option>
                        <option value="DEBITO">Cartão de Débito</option>
                      </select>
                    </div>

                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Valor Pago * (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={valorPago}
                        onChange={(e) => setValorPago(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        required
                      />
                      {valorPago && valorTotal && parseFloat(valorPago) !== valorTotal && (
                        <p className="text-sm text-orange-600 mt-1.5">
                          ⚠ Valor diferente do total (R$ {valorTotal.toFixed(2)})
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Valor Total */}
              {servicosSelecionados.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      <DollarSign className="w-4 h-4" />
                      Valor Total
                    </div>
                    <div className="text-3xl font-outfit font-bold text-gray-900 tracking-tight">
                      R$ {valorTotal.toFixed(2)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 min-h-[44px]"
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 min-h-[44px]"
                disabled={loading || servicosSelecionados.length === 0}
              >
                {loading ? 'Salvando...' : mode === 'create' ? 'Criar Agendamento' : 'Salvar Alterações'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
