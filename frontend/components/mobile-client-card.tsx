'use client';

import { useState } from 'react';
import { Phone, Mail, Car, Calendar, Edit, Trash2, ChevronDown, MoreVertical } from 'lucide-react';
import { ModernCard } from '@/components/ui/modern-card';
import { Button } from '@/components/ui/button';

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email?: string | null;
  observacoes?: string | null;
  veiculos?: any[];
  _count?: {
    agendamentos?: number;
  };
}

interface MobileClientCardProps {
  cliente: Cliente;
  onEdit: (cliente: Cliente) => void;
  onDelete: (id: string) => void;
}

export function MobileClientCard({ cliente, onEdit, onDelete }: MobileClientCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <ModernCard
      className={`relative overflow-visible transition-all duration-300 ${showMenu ? 'z-50' : 'z-0'}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-4">
        {/* Header: Nome + Telefone + Menu */}
        <div className="flex items-start gap-3">
          {/* Avatar Circle */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-soft">
            <span className="text-white font-outfit font-bold text-lg">
              {cliente.nome.charAt(0).toUpperCase()}
            </span>
          </div>

          {/* Nome + Telefone */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-outfit font-bold text-gray-900 truncate">
              {cliente.nome}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-600 font-medium">
                {cliente.telefone}
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
                      onEdit(cliente);
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
                      onDelete(cliente.id);
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

        {/* Badge de Observação (se houver) */}
        {cliente.observacoes && (
          <div className="mt-3 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg">
            <p className="text-xs font-semibold text-blue-700 leading-relaxed">
              {cliente.observacoes}
            </p>
          </div>
        )}

        {/* Detalhes Expandidos */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            expanded ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="space-y-2.5 pt-3 border-t border-gray-100">
            {/* Email */}
            {cliente.email && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-gray-600" />
                </div>
                <span className="text-sm text-gray-700 truncate font-medium">
                  {cliente.email}
                </span>
              </div>
            )}

            {/* Veículos */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                <Car className="w-4 h-4 text-teal-600" />
              </div>
              <span className="text-sm text-gray-700 font-medium">
                {cliente.veiculos?.length || 0} veículo{cliente.veiculos?.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Agendamentos */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm text-gray-700 font-medium">
                {cliente._count?.agendamentos || 0} agendamento{cliente._count?.agendamentos !== 1 ? 's' : ''}
              </span>
            </div>
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
