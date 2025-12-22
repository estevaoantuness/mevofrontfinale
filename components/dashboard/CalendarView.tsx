import React, { useState, useEffect, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Filter,
  Download,
  Home,
  Search,
  X
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import * as api from '../../lib/api';
import type { Reservation, Property, DashboardStats, TodayReservations } from '../../lib/api';

// Cores para cada imóvel (gera automaticamente baseado no ID)
const PROPERTY_COLORS = [
  { bg: 'bg-blue-500/20', border: 'border-blue-500/40', text: 'text-blue-400' },
  { bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', text: 'text-emerald-400' },
  { bg: 'bg-purple-500/20', border: 'border-purple-500/40', text: 'text-purple-400' },
  { bg: 'bg-orange-500/20', border: 'border-orange-500/40', text: 'text-orange-400' },
  { bg: 'bg-pink-500/20', border: 'border-pink-500/40', text: 'text-pink-400' },
  { bg: 'bg-cyan-500/20', border: 'border-cyan-500/40', text: 'text-cyan-400' },
  { bg: 'bg-yellow-500/20', border: 'border-yellow-500/40', text: 'text-yellow-400' },
  { bg: 'bg-red-500/20', border: 'border-red-500/40', text: 'text-red-400' },
];

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

interface CalendarViewProps {
  properties: Property[];
  stats: DashboardStats;
}

interface DayReservation {
  reservation: Reservation;
  type: 'checkin' | 'checkout' | 'stay';
  color: typeof PROPERTY_COLORS[0];
  propertyName: string;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ properties, stats }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [todayData, setTodayData] = useState<TodayReservations | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [filterPropertyId, setFilterPropertyId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Buscar reservas do mês atual
  useEffect(() => {
    fetchReservations();
  }, [currentDate, filterPropertyId]);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const [reservationsData, todayRes] = await Promise.all([
        api.getReservations({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          propertyId: filterPropertyId || undefined,
          limit: 500
        }),
        api.getReservationsToday()
      ]);

      setReservations(reservationsData.reservations);
      setTodayData(todayRes);
    } catch (error) {
      console.error('Erro ao buscar reservas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Gerar dias do calendário
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: (Date | null)[] = [];

    // Dias vazios antes do primeiro dia do mês
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Dias do mês
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  }, [currentDate]);

  // Mapear reservas por dia
  const reservationsByDay = useMemo(() => {
    const map: Record<string, DayReservation[]> = {};

    reservations.forEach(reservation => {
      const checkin = new Date(reservation.checkinDate);
      const checkout = new Date(reservation.checkoutDate);
      const propertyName = reservation.property?.name || `Imovel ${reservation.propertyId}`;
      const colorIndex = (reservation.propertyId - 1) % PROPERTY_COLORS.length;
      const color = PROPERTY_COLORS[colorIndex];

      // Adicionar check-in
      const checkinKey = checkin.toISOString().split('T')[0];
      if (!map[checkinKey]) map[checkinKey] = [];
      map[checkinKey].push({
        reservation,
        type: 'checkin',
        color,
        propertyName
      });

      // Adicionar checkout
      const checkoutKey = checkout.toISOString().split('T')[0];
      if (!map[checkoutKey]) map[checkoutKey] = [];
      map[checkoutKey].push({
        reservation,
        type: 'checkout',
        color,
        propertyName
      });

      // Adicionar dias de estadia
      const current = new Date(checkin);
      current.setDate(current.getDate() + 1);
      while (current < checkout) {
        const stayKey = current.toISOString().split('T')[0];
        if (!map[stayKey]) map[stayKey] = [];
        map[stayKey].push({
          reservation,
          type: 'stay',
          color,
          propertyName
        });
        current.setDate(current.getDate() + 1);
      }
    });

    return map;
  }, [reservations]);

  // Navegação
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Verificar se é hoje
  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Obter reservas de um dia
  const getDayReservations = (date: Date | null): DayReservation[] => {
    if (!date) return [];
    const key = date.toISOString().split('T')[0];
    return reservationsByDay[key] || [];
  };

  // Filtrar propriedades pela busca
  const filteredProperties = properties.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header do Calendário */}
      <div className="bg-[#0B0C15] border border-white/5 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          {/* Navegação do Mês */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <ChevronLeft size={20} className="text-slate-400" />
              </button>
              <h2 className="text-xl font-semibold text-white min-w-[200px] text-center">
                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button
                onClick={goToNextMonth}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <ChevronRight size={20} className="text-slate-400" />
              </button>
            </div>
            <Button variant="secondary" onClick={goToToday} className="text-sm">
              <Calendar size={16} className="mr-2" />
              Hoje
            </Button>
          </div>

          {/* Filtros e Ações */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar imovel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 w-48"
              />
            </div>

            <div className="relative">
              <Button
                variant="secondary"
                onClick={() => setShowFilters(!showFilters)}
                className="text-sm"
              >
                <Filter size={16} className="mr-2" />
                Filtrar
                {filterPropertyId && (
                  <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </Button>

              {showFilters && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowFilters(false)} />
                  <div className="absolute right-0 mt-2 w-64 bg-[#0B0C15] border border-white/10 rounded-xl shadow-xl z-50 p-3 max-h-64 overflow-y-auto">
                    <button
                      onClick={() => { setFilterPropertyId(null); setShowFilters(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        !filterPropertyId ? 'bg-blue-500/20 text-blue-400' : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      Todos os imoveis
                    </button>
                    {filteredProperties.map((property, index) => (
                      <button
                        key={property.id}
                        onClick={() => { setFilterPropertyId(property.id); setShowFilters(false); }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                          filterPropertyId === property.id ? 'bg-blue-500/20 text-blue-400' : 'text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        <div className={`w-3 h-3 rounded ${PROPERTY_COLORS[index % PROPERTY_COLORS.length].bg}`} />
                        {property.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Grade do Calendário */}
        <div className="border border-white/5 rounded-xl overflow-hidden">
          {/* Header dos dias da semana */}
          <div className="grid grid-cols-7 bg-white/[0.02]">
            {WEEKDAYS.map((day) => (
              <div key={day} className="py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider border-b border-white/5">
                {day}
              </div>
            ))}
          </div>

          {/* Dias do mês */}
          <div className="grid grid-cols-7">
            {calendarDays.map((date, index) => {
              const dayReservations = getDayReservations(date);
              const today = isToday(date);

              return (
                <div
                  key={index}
                  onClick={() => date && dayReservations.length > 0 && setSelectedDay(date)}
                  className={`
                    min-h-[100px] p-2 border-b border-r border-white/5 transition-colors
                    ${date ? 'hover:bg-white/[0.02] cursor-pointer' : 'bg-white/[0.01]'}
                    ${today ? 'ring-2 ring-inset ring-blue-500/50' : ''}
                    ${index % 7 === 6 ? 'border-r-0' : ''}
                  `}
                >
                  {date && (
                    <>
                      <div className={`text-sm font-medium mb-1 ${today ? 'text-blue-400' : 'text-slate-400'}`}>
                        {date.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayReservations.slice(0, 3).map((dayRes, idx) => (
                          <div
                            key={`${dayRes.reservation.id}-${dayRes.type}-${idx}`}
                            className={`
                              text-[10px] px-1.5 py-0.5 rounded truncate
                              ${dayRes.color.bg} ${dayRes.color.text} border ${dayRes.color.border}
                            `}
                            title={`${dayRes.propertyName} - ${dayRes.type === 'checkin' ? 'Check-in' : dayRes.type === 'checkout' ? 'Check-out' : 'Ocupado'}`}
                          >
                            {dayRes.type === 'checkin' && '▶ '}
                            {dayRes.type === 'checkout' && '◀ '}
                            {dayRes.propertyName.length > 10 ? dayRes.propertyName.substring(0, 10) + '...' : dayRes.propertyName}
                          </div>
                        ))}
                        {dayReservations.length > 3 && (
                          <div className="text-[10px] text-slate-500 px-1.5">
                            +{dayReservations.length - 3} mais
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legenda */}
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/5">
          <span className="text-xs text-slate-500">Legenda:</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-emerald-400 font-bold">IN</span>
            <span className="text-xs text-slate-400">Check-in</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-red-400 font-bold">OUT</span>
            <span className="text-xs text-slate-400">Check-out</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500/20 border border-blue-500/40" />
            <span className="text-xs text-slate-400">Ocupado</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#0B0C15] border border-white/5 p-5 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Home size={20} className="text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-white">{stats.totalProperties}</p>
              <p className="text-xs text-slate-500">Imoveis Ativos</p>
            </div>
          </div>
        </div>

        <div className="bg-[#0B0C15] border border-white/5 p-5 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
              <span className="text-red-400 font-bold text-sm">OUT</span>
            </div>
            <div>
              <p className="text-2xl font-semibold text-white">{todayData?.checkouts.length || 0}</p>
              <p className="text-xs text-slate-500">Checkouts Hoje</p>
            </div>
          </div>
        </div>

        <div className="bg-[#0B0C15] border border-white/5 p-5 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <span className="text-emerald-400 font-bold text-sm">IN</span>
            </div>
            <div>
              <p className="text-2xl font-semibold text-white">{todayData?.checkins.length || 0}</p>
              <p className="text-xs text-slate-500">Check-ins Hoje</p>
            </div>
          </div>
        </div>

        <div className="bg-[#0B0C15] border border-white/5 p-5 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <span className="text-purple-400 font-bold text-lg">{stats.messagesThisMonth}</span>
            </div>
            <div>
              <p className="text-2xl font-semibold text-white">{stats.messagesThisMonth}</p>
              <p className="text-xs text-slate-500">Msgs Este Mes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Detalhes do Dia */}
      <Modal
        isOpen={!!selectedDay}
        onClose={() => setSelectedDay(null)}
        title={selectedDay ? `Reservas - ${selectedDay.getDate()} de ${MONTHS[selectedDay.getMonth()]}` : ''}
      >
        {selectedDay && (
          <div className="space-y-3">
            {getDayReservations(selectedDay).map((dayRes, idx) => (
              <div
                key={`${dayRes.reservation.id}-${idx}`}
                className={`p-4 rounded-lg ${dayRes.color.bg} border ${dayRes.color.border}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-medium ${dayRes.color.text}`}>
                    {dayRes.propertyName}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    dayRes.type === 'checkin' ? 'bg-emerald-500/20 text-emerald-400' :
                    dayRes.type === 'checkout' ? 'bg-red-500/20 text-red-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {dayRes.type === 'checkin' ? 'Check-in' : dayRes.type === 'checkout' ? 'Check-out' : 'Ocupado'}
                  </span>
                </div>
                {dayRes.reservation.guestName && (
                  <p className="text-sm text-slate-400">
                    Hospede: {dayRes.reservation.guestName}
                  </p>
                )}
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(dayRes.reservation.checkinDate).toLocaleDateString('pt-BR')} - {new Date(dayRes.reservation.checkoutDate).toLocaleDateString('pt-BR')}
                </p>
              </div>
            ))}
            {getDayReservations(selectedDay).length === 0 && (
              <p className="text-center text-slate-500 py-8">Nenhuma reserva neste dia</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CalendarView;
