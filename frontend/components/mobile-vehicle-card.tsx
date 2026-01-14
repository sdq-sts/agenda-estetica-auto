'use client';

import { useState } from 'react';
import { Car, Calendar, Palette, User, Edit, Trash2, ChevronDown, MoreVertical } from 'lucide-react';
import { ModernCard } from '@/components/ui/modern-card';

interface Veiculo {
  id: string;
  marca: string;
  modelo: string;
  ano: number;
  placa: string;
  cor?: string | null;
  cliente?: {
    nome: string;
  } | null;
}

interface MobileVehicleCardProps {
  veiculo: Veiculo;
  onEdit: (veiculo: Veiculo) => void;
  onDelete: (id: string) => void;
}

export function MobileVehicleCard({ veiculo, onEdit, onDelete }: MobileVehicleCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <ModernCard
      className={`relative overflow-visible transition-all duration-300 ${showMenu ? 'z-50' : 'z-0'}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-4">
        {/* Header: Ícone + Marca/Modelo + Menu */}
        <div className="flex items-start gap-3">
          {/* Ícone do Carro */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-soft">
            <Car className="w-6 h-6 text-white" />
          </div>

          {/* Marca/Modelo + Placa */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-outfit font-bold text-gray-900 truncate">
              {veiculo.marca} {veiculo.modelo}
            </h3>
            <div className="mt-1 inline-block px-2.5 py-0.5 bg-gray-100 border border-gray-200 rounded-md">
              <span className="text-xs font-mono font-bold text-gray-700 tracking-wider">
                {veiculo.placa}
              </span>
            </div>
          </div>

          {/* Menu de Ações */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="w-10 h-10 rounded-lg hover:bg-gray-100 active:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <>
                {/* Overlay para fechar menu */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                  }}
                />

                {/* Menu */}
                <div className="absolute right-0 top-12 z-50 bg-white rounded-xl shadow-lift border border-gray-200 py-1 min-w-[140px]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(veiculo);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                  >
                    <Edit className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">Editar</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(veiculo.id);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-red-50 active:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-600">Excluir</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Detalhes Expandidos */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            expanded ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="space-y-2.5 pt-3 border-t border-gray-100">
            {/* Ano */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-gray-600" />
              </div>
              <span className="text-sm text-gray-700 font-medium">
                Ano: {veiculo.ano}
              </span>
            </div>

            {/* Cor */}
            {veiculo.cor && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <Palette className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-sm text-gray-700 font-medium">
                  {veiculo.cor}
                </span>
              </div>
            )}

            {/* Proprietário */}
            {veiculo.cliente && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm text-gray-700 font-medium">
                  {veiculo.cliente.nome}
                </span>
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
