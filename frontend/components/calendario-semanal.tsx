'use client';

import { useCallback, useMemo, useState } from 'react';
import { Calendar, momentLocalizer, Event, View, NavigateAction, ToolbarProps } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/pt-br';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../app/calendario.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

moment.locale('pt-br');
const localizer = momentLocalizer(moment);

// Tipos
interface AgendamentoEvent extends Event {
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
  };
}

interface CalendarioSemanalProps {
  eventos: AgendamentoEvent[];
  onSelectEvent?: (event: AgendamentoEvent) => void;
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void;
}

// Mensagens em português
const messages = {
  allDay: 'Dia inteiro',
  previous: 'Anterior',
  next: 'Próximo',
  today: 'Hoje',
  month: 'Mês',
  week: 'Semana',
  day: 'Dia',
  agenda: 'Agenda',
  date: 'Data',
  time: 'Hora',
  event: 'Evento',
  noEventsInRange: 'Sem agendamentos neste período',
  showMore: (total: number) => `+ ${total} mais`,
};

// Custom Toolbar - Compacta para mobile
function CustomToolbar({ label, onNavigate, onView, view }: ToolbarProps) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div className="mb-4 md:mb-6">
      {/* Mobile Layout - Muito compacto */}
      <div className="md:hidden">
        {/* Data + Navegação em uma linha */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onNavigate('PREV')}
            className="min-w-[40px] min-h-[40px] flex-shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <div className="flex-1 text-center">
            <h3 className="text-sm font-outfit font-bold text-gray-900 leading-tight">
              {label}
            </h3>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => onNavigate('NEXT')}
            className="min-w-[40px] min-h-[40px] flex-shrink-0"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Hoje button - Semana view removida no mobile */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('TODAY')}
            className="w-full min-h-[40px] text-sm font-medium"
          >
            Ir para Hoje
          </Button>
        </div>
      </div>

      {/* Desktop Layout - Padrão melhorado */}
      <div className="hidden md:flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('TODAY')}
            className="min-h-[40px]"
          >
            Hoje
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onNavigate('PREV')}
            className="min-w-[40px] min-h-[40px]"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onNavigate('NEXT')}
            className="min-w-[40px] min-h-[40px]"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        <h3 className="text-lg font-outfit font-bold text-gray-900">
          {label}
        </h3>

        <div className="flex items-center gap-2">
          <Button
            variant={view === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onView('week')}
            className="min-h-[40px]"
          >
            Semana
          </Button>
          <Button
            variant={view === 'day' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onView('day')}
            className="min-h-[40px]"
          >
            Dia
          </Button>
        </div>
      </div>
    </div>
  );
}

export function CalendarioSemanal({
  eventos,
  onSelectEvent,
  onSelectSlot,
}: CalendarioSemanalProps) {
  // Detectar mobile para usar view dia por padrão
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const initialView: View = isMobile ? 'day' : 'week';

  // Estado para controlar data e view atual
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>(initialView);

  // Handler para navegação (Hoje, Anterior, Próximo)
  const handleNavigate = useCallback((newDate: Date, view: View, action: NavigateAction) => {
    setCurrentDate(newDate);
  }, []);

  // Handler para mudança de view (Semana, Dia) - no mobile, força sempre "day"
  const handleViewChange = useCallback((newView: View) => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    setCurrentView(isMobile ? 'day' : newView);
  }, []);

  // Customizar estilo do evento baseado no status
  const eventStyleGetter = useCallback((event: AgendamentoEvent) => {
    const status = event.resource.status.toLowerCase();

    return {
      className: `status-${status}`,
    };
  }, []);

  // Formatar o título do evento
  const eventTitleAccessor = useCallback((event: AgendamentoEvent) => {
    return event.resource.clienteNome;
  }, []);

  // Configurações do calendário
  const { scrollToTime, min, max, formats } = useMemo(() => {
    const now = new Date();

    return {
      scrollToTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0),
      min: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0),
      max: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16, 30, 0),
      formats: {
        timeGutterFormat: 'HH:mm',
        eventTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) =>
          `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
        agendaTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) =>
          `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
        dayFormat: 'ddd DD/MM',
        dayHeaderFormat: 'dddd, DD [de] MMMM',
      },
    };
  }, []);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-soft p-4 md:p-6 overflow-hidden">
      <Calendar
        localizer={localizer}
        events={eventos}
        startAccessor="start"
        endAccessor="end"
        titleAccessor={eventTitleAccessor}
        style={{ height: '100%', minHeight: isMobile ? 500 : 600 }}
        view={isMobile ? 'day' : currentView}
        date={currentDate}
        onNavigate={handleNavigate}
        onView={handleViewChange}
        views={isMobile ? ['day'] : ['week', 'day']}
        step={30}
        timeslots={1}
        scrollToTime={scrollToTime}
        min={min}
        max={max}
        formats={formats}
        messages={messages}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={onSelectEvent}
        onSelectSlot={onSelectSlot}
        selectable
        popup
        culture="pt-BR"
        components={{
          toolbar: CustomToolbar,
        }}
      />
    </div>
  );
}
