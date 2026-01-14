'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ModernCard, ModernCardContent } from '@/components/ui/modern-card';
import { BottomNav } from '@/components/bottom-nav';
import { Toast, ToastType } from '@/components/toast';
import { configuracoesAPI, bloqueiosAPI } from '@/lib/api';
import { ArrowLeft, Clock, Calendar, Ban, Trash2, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Tab = 'horario' | 'recorrentes' | 'pontuais';

interface Bloqueio {
  id: string;
  tipo: 'PONTUAL' | 'RECORRENTE';
  diaSemana?: number;
  dataEspecifica?: string;
  horaInicio: string;
  horaFim: string;
  diaInteiro: boolean;
  motivo?: string;
  ativo: boolean;
}

const diasSemana = [
  { key: 'domingo', label: 'Domingo', valor: 0 },
  { key: 'segunda', label: 'Segunda-feira', valor: 1 },
  { key: 'terca', label: 'Terça-feira', valor: 2 },
  { key: 'quarta', label: 'Quarta-feira', valor: 3 },
  { key: 'quinta', label: 'Quinta-feira', valor: 4 },
  { key: 'sexta', label: 'Sexta-feira', valor: 5 },
  { key: 'sabado', label: 'Sábado', valor: 6 },
];

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('horario');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Horários padrão (seg-dom)
  const [horarios, setHorarios] = useState<Record<string, string | null>>({});
  const [horarioAtivo, setHorarioAtivo] = useState<Record<string, boolean>>({});

  // Bloqueios
  const [bloqueiosRecorrentes, setBloqueiosRecorrentes] = useState<Bloqueio[]>([]);
  const [bloqueiosPontuais, setBloqueiosPontuais] = useState<Bloqueio[]>([]);

  // Modal de novo bloqueio recorrente
  const [showNovoRecorrente, setShowNovoRecorrente] = useState(false);
  const [novoRecorrente, setNovoRecorrente] = useState({
    diaSemana: 1,
    horaInicio: '08:00',
    horaFim: '18:00',
    motivo: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [horariosData, bloqueiosData] = await Promise.all([
        configuracoesAPI.getHorarios(),
        bloqueiosAPI.getAll(undefined, true),
      ]);

      setHorarios(horariosData);

      // Inicializar estado de ativo baseado nos horários
      const ativoState: Record<string, boolean> = {};
      Object.entries(horariosData).forEach(([dia, horario]) => {
        ativoState[dia] = !!horario;
      });
      setHorarioAtivo(ativoState);

      // Separar bloqueios
      const recorrentes = bloqueiosData.filter((b: Bloqueio) => b.tipo === 'RECORRENTE');
      const pontuais = bloqueiosData.filter((b: Bloqueio) => b.tipo === 'PONTUAL');

      setBloqueiosRecorrentes(recorrentes);
      setBloqueiosPontuais(pontuais);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setToast({ message: 'Erro ao carregar configurações', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveHorarios() {
    setSaving(true);
    try {
      // Criar objeto com horários apenas para dias ativos
      const horariosToSave: Record<string, string | null> = {};
      diasSemana.forEach(({ key }) => {
        horariosToSave[key] = horarioAtivo[key] ? (horarios[key] || '08:00-18:00') : null;
      });

      await configuracoesAPI.saveHorariosPadrao(horariosToSave);
      setToast({ message: 'Horários salvos com sucesso!', type: 'success' });
    } catch (error) {
      console.error('Erro ao salvar horários:', error);
      setToast({ message: 'Erro ao salvar horários', type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateBloqueioRecorrente() {
    try {
      await bloqueiosAPI.create({
        tipo: 'RECORRENTE',
        diaSemana: novoRecorrente.diaSemana,
        horaInicio: novoRecorrente.horaInicio,
        horaFim: novoRecorrente.horaFim,
        diaInteiro: false,
        motivo: novoRecorrente.motivo || undefined,
        ativo: true,
      });

      setToast({ message: 'Exceção recorrente criada!', type: 'success' });
      setShowNovoRecorrente(false);
      setNovoRecorrente({ diaSemana: 1, horaInicio: '08:00', horaFim: '18:00', motivo: '' });
      loadData();
    } catch (error) {
      console.error('Erro ao criar bloqueio:', error);
      setToast({ message: 'Erro ao criar exceção', type: 'error' });
    }
  }

  async function handleDeleteBloqueio(id: string) {
    if (!confirm('Deseja realmente remover este bloqueio?')) return;

    try {
      await bloqueiosAPI.delete(id);
      setToast({ message: 'Bloqueio removido com sucesso!', type: 'success' });
      loadData();
    } catch (error) {
      console.error('Erro ao deletar bloqueio:', error);
      setToast({ message: 'Erro ao remover bloqueio', type: 'error' });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50 pb-20 lg:pb-4">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 sticky top-0 z-10">
          <div className="container mx-auto max-w-6xl px-6 py-4">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="icon" className="min-w-[44px] min-h-[44px]">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-outfit font-bold text-gray-900 tracking-tight">
                  Configurações de Horário
                </h1>
                <p className="text-sm font-medium text-gray-500">
                  Gerencie horários e bloqueios
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 max-w-6xl mt-8 space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab('horario')}
              className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all min-h-[44px] whitespace-nowrap ${
                activeTab === 'horario'
                  ? 'bg-blue-600 text-white shadow-medium'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
              }`}
            >
              <Clock className="w-4 h-4 inline mr-2" />
              Horário Padrão
            </button>
            <button
              onClick={() => setActiveTab('recorrentes')}
              className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all min-h-[44px] whitespace-nowrap ${
                activeTab === 'recorrentes'
                  ? 'bg-blue-600 text-white shadow-medium'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Exceções Semanais
            </button>
            <button
              onClick={() => setActiveTab('pontuais')}
              className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all min-h-[44px] whitespace-nowrap ${
                activeTab === 'pontuais'
                  ? 'bg-blue-600 text-white shadow-medium'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
              }`}
            >
              <Ban className="w-4 h-4 inline mr-2" />
              Bloqueios Pontuais
            </button>
          </div>

          {/* Tab: Horário Padrão */}
          {activeTab === 'horario' && (
            <ModernCard>
              <ModernCardContent className="p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-outfit font-bold text-gray-900 mb-1">
                    Horário Padrão de Funcionamento
                  </h3>
                  <p className="text-sm text-gray-600">
                    Defina os horários de abertura e fechamento para cada dia da semana
                  </p>
                </div>

                <div className="space-y-3">
                  {diasSemana.map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        checked={horarioAtivo[key] || false}
                        onChange={(e) => setHorarioAtivo({ ...horarioAtivo, [key]: e.target.checked })}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-100"
                      />
                      <div className="flex-1 flex items-center gap-4">
                        <span className="text-sm font-semibold text-gray-900 min-w-[120px]">
                          {label}
                        </span>
                        {horarioAtivo[key] ? (
                          <input
                            type="text"
                            value={horarios[key] || '08:00-18:00'}
                            onChange={(e) => setHorarios({ ...horarios, [key]: e.target.value })}
                            placeholder="08:00-18:00"
                            className="px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                          />
                        ) : (
                          <span className="text-sm text-gray-500">FECHADO</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <Button onClick={handleSaveHorarios} disabled={saving} className="min-h-[44px]">
                    {saving ? 'Salvando...' : 'Salvar Horários'}
                  </Button>
                </div>
              </ModernCardContent>
            </ModernCard>
          )}

          {/* Tab: Exceções Recorrentes */}
          {activeTab === 'recorrentes' && (
            <ModernCard>
              <ModernCardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-outfit font-bold text-gray-900 mb-1">
                      Exceções Semanais
                    </h3>
                    <p className="text-sm text-gray-600">
                      Bloqueios que se repetem toda semana no mesmo dia
                    </p>
                  </div>
                  <Button onClick={() => setShowNovoRecorrente(true)} className="min-h-[44px]">
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Exceção
                  </Button>
                </div>

                {bloqueiosRecorrentes.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Nenhuma exceção recorrente configurada</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bloqueiosRecorrentes.map((bloqueio) => {
                      const dia = diasSemana.find((d) => d.valor === bloqueio.diaSemana);
                      return (
                        <div
                          key={bloqueio.id}
                          className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg"
                        >
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              Toda {dia?.label}
                            </p>
                            <p className="text-xs text-gray-600 mt-0.5">
                              {bloqueio.horaInicio} - {bloqueio.horaFim}
                              {bloqueio.motivo && ` • ${bloqueio.motivo}`}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteBloqueio(bloqueio.id)}
                            className="min-w-[44px] min-h-[44px] text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Modal Novo Recorrente */}
                {showNovoRecorrente && (
                  <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setShowNovoRecorrente(false)}
                  >
                    <div
                      className="bg-white rounded-xl shadow-lift max-w-md w-full p-6"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <h3 className="text-xl font-outfit font-bold text-gray-900 mb-4">
                        Nova Exceção Semanal
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Dia da Semana
                          </label>
                          <select
                            value={novoRecorrente.diaSemana}
                            onChange={(e) =>
                              setNovoRecorrente({ ...novoRecorrente, diaSemana: Number(e.target.value) })
                            }
                            className="w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none bg-white appearance-none cursor-pointer"
                            style={{
                              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                              backgroundPosition: 'right 0.75rem center',
                              backgroundRepeat: 'no-repeat',
                              backgroundSize: '1.25rem'
                            }}
                          >
                            {diasSemana.map((dia) => (
                              <option key={dia.valor} value={dia.valor}>
                                {dia.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Hora Início
                            </label>
                            <input
                              type="time"
                              value={novoRecorrente.horaInicio}
                              onChange={(e) =>
                                setNovoRecorrente({ ...novoRecorrente, horaInicio: e.target.value })
                              }
                              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Hora Fim
                            </label>
                            <input
                              type="time"
                              value={novoRecorrente.horaFim}
                              onChange={(e) =>
                                setNovoRecorrente({ ...novoRecorrente, horaFim: e.target.value })
                              }
                              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Motivo (opcional)
                          </label>
                          <input
                            type="text"
                            value={novoRecorrente.motivo}
                            onChange={(e) =>
                              setNovoRecorrente({ ...novoRecorrente, motivo: e.target.value })
                            }
                            placeholder="Ex: Fornecedores, Almoço..."
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 mt-6">
                        <Button
                          variant="outline"
                          onClick={() => setShowNovoRecorrente(false)}
                          className="flex-1 min-h-[44px]"
                        >
                          Cancelar
                        </Button>
                        <Button onClick={handleCreateBloqueioRecorrente} className="flex-1 min-h-[44px]">
                          Criar Exceção
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </ModernCardContent>
            </ModernCard>
          )}

          {/* Tab: Bloqueios Pontuais */}
          {activeTab === 'pontuais' && (
            <ModernCard>
              <ModernCardContent className="p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-outfit font-bold text-gray-900 mb-1">
                    Bloqueios Pontuais
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Datas específicas bloqueadas. Use o calendário para criar novos bloqueios.
                  </p>
                </div>

                {bloqueiosPontuais.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Ban className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Nenhum bloqueio pontual</p>
                    <p className="text-xs mt-2">
                      Clique em um horário vazio no calendário para bloquear
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bloqueiosPontuais.map((bloqueio) => (
                      <div
                        key={bloqueio.id}
                        className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg"
                      >
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {bloqueio.dataEspecifica &&
                              format(new Date(bloqueio.dataEspecifica), "dd 'de' MMMM 'de' yyyy", {
                                locale: ptBR,
                              })}
                          </p>
                          <p className="text-xs text-gray-600 mt-0.5">
                            {bloqueio.diaInteiro
                              ? 'Dia inteiro'
                              : `${bloqueio.horaInicio} - ${bloqueio.horaFim}`}
                            {bloqueio.motivo && ` • ${bloqueio.motivo}`}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteBloqueio(bloqueio.id)}
                          className="min-w-[44px] min-h-[44px] text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ModernCardContent>
            </ModernCard>
          )}
        </main>

        {/* Toast */}
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
      <BottomNav />
    </>
  );
}
