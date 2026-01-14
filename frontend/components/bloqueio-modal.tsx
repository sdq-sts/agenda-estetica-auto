'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Ban } from 'lucide-react';
import { bloqueiosAPI } from '@/lib/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BloqueioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  dataHora: Date;
}

export function BloqueioModal({ isOpen, onClose, onSuccess, dataHora }: BloqueioModalProps) {
  const [loading, setLoading] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [diaInteiro, setDiaInteiro] = useState(false);
  const [horaInicio, setHoraInicio] = useState(format(dataHora, 'HH:mm'));
  const [horaFim, setHoraFim] = useState(() => {
    const fim = new Date(dataHora);
    fim.setHours(fim.getHours() + 1);
    return format(fim, 'HH:mm');
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    try {
      await bloqueiosAPI.create({
        tipo: 'PONTUAL',
        dataEspecifica: dataHora.toISOString(),
        horaInicio: diaInteiro ? '00:00' : horaInicio,
        horaFim: diaInteiro ? '23:59' : horaFim,
        diaInteiro,
        motivo: motivo || undefined,
        ativo: true,
      });

      onSuccess();
      onClose();
      setMotivo('');
      setDiaInteiro(false);
    } catch (error) {
      console.error('Erro ao criar bloqueio:', error);
      alert('Erro ao criar bloqueio. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end md:items-center justify-center md:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl md:rounded-xl shadow-lift max-w-lg w-full animate-slide-up md:animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <div className="p-6 md:p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 rounded-lg">
                  <Ban className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-outfit font-bold text-gray-900">
                    Bloquear Horário
                  </h3>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {format(dataHora, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
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

            {/* Form */}
            <div className="space-y-4">
              {/* Dia Inteiro */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="diaInteiro"
                  checked={diaInteiro}
                  onChange={(e) => setDiaInteiro(e.target.checked)}
                  className="w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-100"
                />
                <label htmlFor="diaInteiro" className="text-sm font-semibold text-gray-900 cursor-pointer">
                  Bloquear dia inteiro
                </label>
              </div>

              {/* Horários */}
              {!diaInteiro && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Hora Início
                    </label>
                    <input
                      type="time"
                      value={horaInicio}
                      onChange={(e) => setHoraInicio(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Hora Fim
                    </label>
                    <input
                      type="time"
                      value={horaFim}
                      onChange={(e) => setHoraFim(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Motivo */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Motivo (opcional)
                </label>
                <input
                  type="text"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Ex: Dentista, Reunião, Feriado..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
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
                variant="destructive"
                className="flex-1 min-h-[44px]"
                disabled={loading}
              >
                {loading ? 'Bloqueando...' : 'Confirmar Bloqueio'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
