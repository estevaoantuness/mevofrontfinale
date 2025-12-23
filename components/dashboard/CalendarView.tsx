import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Filter,
  Download,
  Home,
  Search,
  X,
  Lock,
  Sparkles,
  DollarSign,
  RefreshCw
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useTheme } from '../../lib/ThemeContext';
import * as api from '../../lib/api';
import type { Reservation, Property, DashboardStats, TodayReservations, Subscription, Holiday, CalendarDay as CalendarPriceDay } from '../../lib/api';

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
  subscription: Subscription | null;
  onActivateTrial?: () => void;
  onSelectPlan?: (planId: 'starter' | 'pro') => void;
}

interface DayReservation {
  reservation: Reservation;
  type: 'checkin' | 'checkout' | 'stay';
  color: typeof PROPERTY_COLORS[0];
  propertyName: string;
}

interface GroupedDayEvents {
  checkins: DayReservation[];
  checkouts: DayReservation[];
  stays: DayReservation[];
}

// Tooltip component for showing properties on hover
interface TooltipProps {
  items: DayReservation[];
  type: 'checkin' | 'checkout' | 'stay';
  isDark: boolean;
}

const EventTooltip: React.FC<TooltipProps> = ({ items, type, isDark }) => {
  const typeLabels = {
    checkin: 'Check-ins',
    checkout: 'Check-outs',
    stay: 'Ocupados'
  };

  return (
    <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 min-w-[140px] max-w-[200px] p-2 rounded-lg shadow-xl text-xs ${
      isDark ? 'bg-[#1a1b26] border border-white/10' : 'bg-white border border-slate-200 shadow-lg'
    }`}>
      <div className={`font-semibold mb-1.5 ${
        type === 'checkin' ? 'text-emerald-400' : type === 'checkout' ? 'text-red-400' : 'text-blue-400'
      }`}>
        {typeLabels[type]} ({items.length})
      </div>
      <div className="space-y-1">
        {items.map((item, idx) => (
          <div key={idx} className={`truncate ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            • {item.propertyName}
          </div>
        ))}
      </div>
      {/* Arrow */}
      <div className={`absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${
        isDark ? 'border-t-[#1a1b26]' : 'border-t-white'
      }`} />
    </div>
  );
};

// Event indicator component with hover tooltip
interface EventIndicatorProps {
  items: DayReservation[];
  type: 'checkin' | 'checkout' | 'stay';
  isDark: boolean;
}

const EventIndicator: React.FC<EventIndicatorProps> = ({ items, type, isDark }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (items.length === 0) return null;

  const count = items.length;
  const label = type === 'checkin' ? 'in' : type === 'checkout' ? 'out' : '';
  const colorClass = type === 'checkin'
    ? 'text-emerald-400 bg-emerald-500/10'
    : type === 'checkout'
    ? 'text-red-400 bg-red-500/10'
    : 'text-blue-400 bg-blue-500/10';

  // For stays, show a small dot indicator instead of text
  if (type === 'stay') {
    return (
      <div
        className="relative"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className={`flex items-center justify-center gap-0.5 px-1.5 py-0.5 rounded ${colorClass}`}>
          {items.slice(0, 4).map((_, idx) => (
            <div key={idx} className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          ))}
          {count > 4 && <span className="text-[9px] ml-0.5">+{count - 4}</span>}
        </div>
        {showTooltip && <EventTooltip items={items} type={type} isDark={isDark} />}
      </div>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-bold text-[10px] cursor-default ${colorClass}`}>
        {count > 1 && <span>{count}</span>}
        <span className="uppercase">{label}</span>
      </div>
      {showTooltip && <EventTooltip items={items} type={type} isDark={isDark} />}
    </div>
  );
};

export const CalendarView: React.FC<CalendarViewProps> = ({ properties, stats, subscription, onActivateTrial, onSelectPlan }) => {
  const { isDark } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [todayData, setTodayData] = useState<TodayReservations | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [filterPropertyId, setFilterPropertyId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [calendarPricing, setCalendarPricing] = useState<Record<string, CalendarPriceDay>>({});
  const [showPrices, setShowPrices] = useState(false);
  const [viewMode, setViewMode] = useState<'compact' | 'stacked' | 'details'>('stacked');
  const [syncing, setSyncing] = useState(false);

  // Verificar se usuário tem acesso ao calendário sincronizado
  const hasCalendarAccess = subscription && ['active', 'trialing'].includes(subscription.status);

  // Buscar reservas do mês atual (apenas se tiver acesso)
  useEffect(() => {
    if (hasCalendarAccess) {
      fetchReservations();
    } else {
      setLoading(false);
    }
  }, [currentDate, filterPropertyId, hasCalendarAccess]);

  // Buscar feriados ao montar
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const currentYear = new Date().getFullYear();
        const response = await api.getHolidays({ startYear: currentYear, endYear: currentYear + 3 });
        setHolidays(response.holidays);
      } catch (error) {
        console.error('Erro ao buscar feriados:', error);
      }
    };
    fetchHolidays();
  }, []);

  // Buscar preços do calendário quando filtrar por imóvel
  useEffect(() => {
    const fetchPricing = async () => {
      if (!filterPropertyId) {
        setCalendarPricing({});
        setShowPrices(false); // Reset when no property selected
        return;
      }
      try {
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        const response = await api.getCalendarPricing(filterPropertyId, month, year);
        const pricingMap: Record<string, CalendarPriceDay> = {};
        response.calendar.forEach(day => {
          pricingMap[day.date] = day;
        });
        setCalendarPricing(pricingMap);
        // Auto-enable prices when property is selected and has pricing config
        if (response.hasPricingConfig) {
          setShowPrices(true);
        }
      } catch (error) {
        console.error('Erro ao buscar preços:', error);
        setCalendarPricing({});
      }
    };
    fetchPricing();
  }, [filterPropertyId, currentDate]);

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
      const propertyName = reservation.property?.name || `Imóvel ${reservation.propertyId}`;
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

  // Calcular estatísticas do mês atual
  const monthlyStats = useMemo(() => {
    let checkinsCount = 0;
    let checkoutsCount = 0;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    reservations.forEach(reservation => {
      const checkin = new Date(reservation.checkinDate);
      const checkout = new Date(reservation.checkoutDate);

      // Contar check-ins deste mês
      if (checkin.getFullYear() === year && checkin.getMonth() === month) {
        checkinsCount++;
      }

      // Contar checkouts deste mês
      if (checkout.getFullYear() === year && checkout.getMonth() === month) {
        checkoutsCount++;
      }
    });

    return { checkinsCount, checkoutsCount };
  }, [reservations, currentDate]);

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

  // Sincronizar todos os iCals
  const handleSyncAll = async () => {
    setSyncing(true);
    try {
      const result = await api.syncAllIcals();
      // Recarregar reservas após sync
      await fetchReservations();

      // Mostrar resultado
      const totalCreated = result.details.reduce((sum, d) => sum + d.reservationsCreated, 0);
      const totalUpdated = result.details.reduce((sum, d) => sum + d.reservationsUpdated, 0);

      if (totalCreated > 0 || totalUpdated > 0) {
        alert(`✅ Sincronizado!\n${totalCreated} nova(s) reserva(s)\n${totalUpdated} atualizada(s)`);
      } else {
        alert('✅ Calendários sincronizados!\nNenhuma alteração encontrada.');
      }
    } catch (err: any) {
      alert(`❌ Erro ao sincronizar: ${err.message}`);
    } finally {
      setSyncing(false);
    }
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

  // Agrupar reservas por tipo (checkin, checkout, stay)
  const getGroupedDayEvents = (date: Date | null): GroupedDayEvents => {
    const reservations = getDayReservations(date);
    return {
      checkins: reservations.filter(r => r.type === 'checkin'),
      checkouts: reservations.filter(r => r.type === 'checkout'),
      stays: reservations.filter(r => r.type === 'stay')
    };
  };

  // Filtrar propriedades pela busca
  const filteredProperties = properties.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Verificar se uma data é feriado
  const getHolidayInfo = (date: Date | null): Holiday | null => {
    if (!date) return null;
    const dateStr = date.toISOString().split('T')[0];
    return holidays.find(h => h.date === dateStr) || null;
  };

  // Obter preço para uma data
  const getPriceForDate = (date: Date | null): CalendarPriceDay | null => {
    if (!date || !filterPropertyId) return null;
    const dateStr = date.toISOString().split('T')[0];
    return calendarPricing[dateStr] || null;
  };

  // Verificar se o dia está disponível (sem reserva/estadia para o imóvel filtrado)
  const isDayAvailable = (date: Date | null): boolean => {
    if (!date || !filterPropertyId) return false;
    const dayReservations = getDayReservations(date);
    // Dia disponível = não tem check-in, checkout ou estadia para este imóvel
    const hasReservationForProperty = dayReservations.some(
      r => r.reservation.propertyId === filterPropertyId && (r.type === 'checkin' || r.type === 'stay')
    );
    return !hasReservationForProperty;
  };

  // Formatar preço
  const formatPrice = (price: number): string => {
    return `R$${price}`;
  };

  // Cor do preço baseado no tipo
  const getPriceColor = (priceType: string): string => {
    switch (priceType) {
      case 'holiday':
        return isDark ? 'text-amber-400' : 'text-amber-600';
      case 'highSeason':
        return isDark ? 'text-orange-400' : 'text-orange-600';
      case 'weekend':
        return isDark ? 'text-purple-400' : 'text-purple-600';
      default:
        return isDark ? 'text-emerald-400' : 'text-emerald-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner para não-assinantes */}
      {!hasCalendarAccess && (
        <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 border border-blue-500/20 rounded-xl p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Lock size={24} className="text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Calendário Sincronizado
                </h3>
                <p className="text-sm text-slate-400">
                  Visualize seus check-ins e check-outs automaticamente sincronizados do Airbnb e Booking.
                  Disponível no plano{' '}
                  <button
                    type="button"
                    onClick={() => onSelectPlan?.('starter')}
                    className="text-blue-400 font-medium hover:text-blue-300 transition-colors"
                  >
                    Starter
                  </button>{' '}
                  ou{' '}
                  <button
                    type="button"
                    onClick={() => onSelectPlan?.('pro')}
                    className="text-purple-400 font-medium hover:text-purple-300 transition-colors"
                  >
                    Trial Gratuito
                  </button>.
                </p>
              </div>
            </div>
            {onActivateTrial && (
              <Button
                onClick={() => (onSelectPlan ? onSelectPlan('pro') : onActivateTrial())}
                className="flex-shrink-0"
              >
                <Sparkles size={16} className="mr-2" />
                Ativar Trial Grátis
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Header do Calendário */}
      <div className={`rounded-xl p-4 md:p-6 ${isDark ? 'bg-[#0B0C15] border border-white/5' : 'bg-white border border-slate-200 shadow-sm'}`}>
        <div className="flex flex-col gap-3 mb-4 md:mb-6">
          {/* Linha 1: Título + Navegação */}
          <div className="flex items-center justify-between">
            <h2 className={`text-2xl md:text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={goToPreviousMonth}
                className={`p-1.5 md:p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/5 active:bg-white/10' : 'hover:bg-slate-100 active:bg-slate-200'}`}
              >
                <ChevronLeft size={18} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
              </button>
              <button
                onClick={goToNextMonth}
                className={`p-1.5 md:p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/5 active:bg-white/10' : 'hover:bg-slate-100 active:bg-slate-200'}`}
              >
                <ChevronRight size={18} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
              </button>
            </div>
          </div>

          {/* Linha 2: Controles */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                onClick={goToToday}
                className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded-lg transition-colors ${
                  isDark
                    ? 'bg-white/5 hover:bg-white/10 text-slate-300'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Hoje
              </button>

              {/* View Mode Toggle - Segmented Control */}
              <div className={`flex rounded-lg p-0.5 text-[10px] md:text-xs ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                {(['compact', 'stacked', 'details'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-2 md:px-3 py-1 md:py-1.5 rounded-md transition-all capitalize ${
                      viewMode === mode
                        ? 'bg-blue-500 text-white shadow-sm'
                        : isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {mode === 'compact' ? '•••' : mode === 'stacked' ? 'Pills' : 'Texto'}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtros - apenas para assinantes */}
            {hasCalendarAccess && (
              <div className="flex items-center gap-2">
                {/* Toggle de Preços */}
                {filterPropertyId && (
                  <button
                    onClick={() => setShowPrices(!showPrices)}
                    className={`p-1.5 md:p-2 rounded-lg transition-colors flex items-center gap-1 ${
                      isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100'
                    } ${showPrices ? 'text-emerald-400' : isDark ? 'text-slate-400' : 'text-slate-500'}`}
                    title={showPrices ? 'Ocultar preços' : 'Mostrar preços'}
                  >
                    <DollarSign size={16} />
                    {showPrices && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />}
                  </button>
                )}

                {/* Botão de Sync */}
                <button
                  onClick={handleSyncAll}
                  disabled={syncing}
                  className={`p-1.5 md:p-2 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100'
                  } ${syncing ? 'text-blue-400' : isDark ? 'text-slate-400' : 'text-slate-500'}`}
                  title="Sincronizar calendários"
                >
                  <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
                </button>

                {/* Busca - escondida no mobile */}
                <div className="relative hidden md:block">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`pl-8 pr-3 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 w-32 ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder-slate-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`p-1.5 md:p-2 rounded-lg transition-colors flex items-center gap-1 ${
                      isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100'
                    } ${filterPropertyId ? 'text-blue-400' : isDark ? 'text-slate-400' : 'text-slate-500'}`}
                  >
                    <Filter size={16} />
                    {filterPropertyId && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />}
                  </button>

                  {showFilters && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowFilters(false)} />
                      <div className={`absolute right-0 mt-2 w-64 rounded-xl shadow-xl z-50 p-3 max-h-64 overflow-y-auto ${
                        isDark ? 'bg-[#0B0C15] border border-white/10' : 'bg-white border border-slate-200'
                      }`}>
                        <button
                          onClick={() => { setFilterPropertyId(null); setShowFilters(false); }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            !filterPropertyId
                              ? 'bg-blue-500/20 text-blue-400'
                              : isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          Todos os imóveis
                        </button>
                        {filteredProperties.map((property, index) => (
                          <button
                            key={property.id}
                            onClick={() => { setFilterPropertyId(property.id); setShowFilters(false); }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                              filterPropertyId === property.id
                                ? 'bg-blue-500/20 text-blue-400'
                                : isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-100'
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
            )}
          </div>
        </div>

        {/* Grade do Calendário */}
        <div className={`rounded-xl overflow-hidden ${isDark ? 'border border-white/5' : 'border border-slate-200'}`}>
          {/* Header dos dias da semana */}
          <div className={`grid grid-cols-7 ${isDark ? 'bg-white/[0.02]' : 'bg-slate-50'}`}>
            {WEEKDAYS.map((day) => (
              <div key={day} className={`py-2 md:py-3 text-center text-[10px] md:text-xs font-medium text-slate-500 uppercase tracking-wider border-b ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
                {day}
              </div>
            ))}
          </div>

          {/* Dias do mês */}
          <div className="grid grid-cols-7">
            {calendarDays.map((date, index) => {
              const dayReservations = hasCalendarAccess ? getDayReservations(date) : [];
              const groupedEvents = hasCalendarAccess ? getGroupedDayEvents(date) : { checkins: [], checkouts: [], stays: [] };
              const allEvents = [...groupedEvents.checkouts, ...groupedEvents.checkins, ...groupedEvents.stays];
              const today = isToday(date);
              const hasEvents = dayReservations.length > 0;
              const holiday = getHolidayInfo(date);
              const priceInfo = getPriceForDate(date);
              const isWeekend = date ? (date.getDay() === 0 || date.getDay() === 6) : false;
              const isAvailable = isDayAvailable(date);
              const isPastDate = date ? date < new Date(new Date().setHours(0, 0, 0, 0)) : false;

              return (
                <div
                  key={index}
                  onClick={() => hasCalendarAccess && date && hasEvents && setSelectedDay(date)}
                  className={`
                    min-h-[70px] md:min-h-[100px] p-1 md:p-2 border-b border-r transition-colors relative
                    ${isDark ? 'border-white/5' : 'border-slate-200'}
                    ${date ? (hasCalendarAccess && hasEvents ? (isDark ? 'hover:bg-white/[0.02] active:bg-white/[0.04]' : 'hover:bg-slate-50 active:bg-slate-100') + ' cursor-pointer' : '') : isDark ? 'bg-white/[0.01]' : 'bg-slate-50'}
                    ${today ? 'ring-2 ring-inset ring-blue-500/50' : ''}
                    ${holiday ? (isDark ? 'bg-amber-500/5' : 'bg-amber-50') : ''}
                    ${filterPropertyId && isAvailable && !isPastDate && showPrices ? (isDark ? 'bg-emerald-500/5' : 'bg-emerald-50/50') : ''}
                    ${index % 7 === 6 ? 'border-r-0' : ''}
                  `}
                >
                  {date && (
                    <>
                      {/* Número do dia + indicador de feriado/disponível */}
                      <div className="flex items-center justify-between mb-0.5 md:mb-1">
                        <div className={`text-[10px] md:text-sm font-medium ${
                          today ? 'text-blue-400' :
                          holiday ? (isDark ? 'text-amber-400' : 'text-amber-600') :
                          isWeekend ? (isDark ? 'text-purple-400' : 'text-purple-600') :
                          isDark ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          {date.getDate()}
                        </div>
                        <div className="flex items-center gap-0.5">
                          {holiday && (
                            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-amber-500" title={holiday.name} />
                          )}
                          {filterPropertyId && isAvailable && !isPastDate && (
                            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500" title="Disponível" />
                          )}
                        </div>
                      </div>

                      {/* Nome do feriado - escondido no mobile */}
                      {holiday && (
                        <div className={`hidden md:block text-[8px] truncate mb-1 ${isDark ? 'text-amber-400/70' : 'text-amber-600/70'}`}>
                          {holiday.name}
                        </div>
                      )}

                      {/* Preço do dia - APENAS em dias disponíveis quando imóvel selecionado */}
                      {showPrices && filterPropertyId && priceInfo && priceInfo.price > 0 && isAvailable && !isPastDate && (
                        <div className={`text-[9px] md:text-xs font-bold mb-0.5 md:mb-1 px-1 py-0.5 rounded ${
                          isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {formatPrice(priceInfo.price)}
                        </div>
                      )}

                      {/* Eventos de reservas - por modo */}
                      {hasCalendarAccess && hasEvents && (
                        <>
                          {/* Modo Compact: apenas dots coloridos */}
                          {viewMode === 'compact' && (
                            <div className="flex flex-wrap gap-0.5 mt-0.5">
                              {allEvents.slice(0, 5).map((e, i) => (
                                <div
                                  key={i}
                                  className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${
                                    e.type === 'checkin' ? 'bg-emerald-500' :
                                    e.type === 'checkout' ? 'bg-red-500' :
                                    'bg-blue-500'
                                  }`}
                                  title={`${e.type === 'checkin' ? '→' : e.type === 'checkout' ? '←' : '•'} ${e.propertyName}`}
                                />
                              ))}
                              {allEvents.length > 5 && (
                                <span className="text-[7px] md:text-[8px] text-slate-500">+{allEvents.length - 5}</span>
                              )}
                            </div>
                          )}

                          {/* Modo Stacked: pills empilhadas com cores vivas */}
                          {viewMode === 'stacked' && (
                            <div className="space-y-0.5 mt-0.5">
                              {allEvents.slice(0, 3).map((e, i) => (
                                <div
                                  key={i}
                                  className={`h-3.5 md:h-4 rounded text-[7px] md:text-[8px] px-1 flex items-center truncate font-semibold ${
                                    e.type === 'checkin'
                                      ? 'text-emerald-500 bg-emerald-500/10'
                                      : e.type === 'checkout'
                                      ? 'text-red-500 bg-red-500/10'
                                      : `${e.color.text} ${e.color.bg}`
                                  }`}
                                >
                                  <span className="flex-shrink-0 text-[9px] md:text-[10px]">
                                    {e.type === 'checkin' ? '→' : e.type === 'checkout' ? '←' : '•'}
                                  </span>
                                  <span className="ml-0.5 truncate hidden sm:inline font-medium">{e.propertyName}</span>
                                </div>
                              ))}
                              {allEvents.length > 3 && (
                                <div className="text-[7px] md:text-[8px] text-slate-500 pl-1">+{allEvents.length - 3}</div>
                              )}
                            </div>
                          )}

                          {/* Modo Details: títulos visíveis com cores vivas */}
                          {viewMode === 'details' && (
                            <div className="space-y-px mt-0.5 text-[6px] md:text-[8px] font-medium">
                              {allEvents.slice(0, 4).map((e, i) => (
                                <div key={i} className={`truncate ${
                                  e.type === 'checkin'
                                    ? 'text-emerald-500'
                                    : e.type === 'checkout'
                                    ? 'text-red-500'
                                    : e.color.text
                                }`}>
                                  <span className="text-[8px] md:text-[10px]">
                                    {e.type === 'checkin' ? '→' : e.type === 'checkout' ? '←' : '•'}
                                  </span> {e.propertyName}
                                </div>
                              ))}
                              {allEvents.length > 4 && (
                                <div className="text-slate-500">+{allEvents.length - 4}</div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legenda - Colapsável no Mobile */}
        <details className={`md:hidden mt-3 pt-3 border-t ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
          <summary className="text-[10px] text-slate-500 cursor-pointer select-none">
            Ver legenda
          </summary>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] text-slate-400">Check-in</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span className="text-[10px] text-slate-400">Check-out</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span className="text-[10px] text-slate-400">Ocupado</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span className="text-[10px] text-slate-400">Feriado</span>
            </div>
            {filterPropertyId && (
              <div className="flex items-center gap-1">
                <div className={`w-1.5 h-1.5 rounded-full bg-emerald-500 ring-1 ring-emerald-500/50`} />
                <span className="text-[10px] text-slate-400">Disponível</span>
              </div>
            )}
          </div>
        </details>

        {/* Legenda - Sempre visível no Desktop */}
        <div className={`hidden md:flex flex-wrap items-center gap-4 mt-4 pt-4 border-t ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
          <span className="text-xs text-slate-500">Legenda:</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs text-slate-400">Check-in</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-xs text-slate-400">Check-out</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-xs text-slate-400">Ocupado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-xs text-slate-400">Feriado</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>6</span>
            <span className="text-xs text-slate-400">Fim de semana</span>
          </div>
          {filterPropertyId && (
            <>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30`} />
                <span className="text-xs text-slate-400">Disponível</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>R$</span>
                <span className="text-xs text-slate-400">Preço sugerido</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards - 2x2 no mobile, 4 colunas no desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        <div className={`p-3 md:p-5 rounded-xl ${isDark ? 'bg-[#0B0C15] border border-white/5' : 'bg-white border border-slate-200 shadow-sm'}`}>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <Home size={16} className="text-blue-400 md:w-5 md:h-5" />
            </div>
            <div className="min-w-0">
              <p className={`text-lg md:text-2xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{stats.totalProperties}</p>
              <p className="text-[10px] md:text-xs text-slate-500 truncate">Imóveis</p>
            </div>
          </div>
        </div>

        <div className={`p-3 md:p-5 rounded-xl ${isDark ? 'bg-[#0B0C15] border border-white/5' : 'bg-white border border-slate-200 shadow-sm'}`}>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
              <span className="text-red-400 font-bold text-[10px] md:text-sm">←</span>
            </div>
            <div className="min-w-0">
              <p className={`text-lg md:text-2xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {hasCalendarAccess ? monthlyStats.checkoutsCount : '-'}
              </p>
              <p className="text-[10px] md:text-xs text-slate-500 truncate">Checkouts</p>
            </div>
          </div>
        </div>

        <div className={`p-3 md:p-5 rounded-xl ${isDark ? 'bg-[#0B0C15] border border-white/5' : 'bg-white border border-slate-200 shadow-sm'}`}>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
              <span className="text-emerald-400 font-bold text-[10px] md:text-sm">→</span>
            </div>
            <div className="min-w-0">
              <p className={`text-lg md:text-2xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {hasCalendarAccess ? monthlyStats.checkinsCount : '-'}
              </p>
              <p className="text-[10px] md:text-xs text-slate-500 truncate">Check-ins</p>
            </div>
          </div>
        </div>

        <div className={`p-3 md:p-5 rounded-xl ${isDark ? 'bg-[#0B0C15] border border-white/5' : 'bg-white border border-slate-200 shadow-sm'}`}>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
              <Calendar size={16} className="text-purple-400 md:w-5 md:h-5" />
            </div>
            <div className="min-w-0">
              <p className={`text-lg md:text-2xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {hasCalendarAccess ? stats.messagesThisMonth : '-'}
              </p>
              <p className="text-[10px] md:text-xs text-slate-500 truncate">Mensagens</p>
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
                    Funcionário: {dayRes.reservation.guestName}
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
