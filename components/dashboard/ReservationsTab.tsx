import React, { useState, useEffect } from 'react';
import {
  Calendar,
  ChevronDown,
  RefreshCw,
  Clock,
  User,
  Home,
  CheckCircle,
  AlertCircle,
  Send,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { Button } from '../ui/Button';
import { ReservationCard } from './ReservationCard';
import * as api from '../../lib/api';
import type { Property, Reservation, TodayReservations } from '../../lib/api';

interface ReservationsTabProps {
  properties: Property[];
}

type TimeFilter = 'today' | 'week' | 'month';

export const ReservationsTab = ({ properties }: ReservationsTabProps) => {
  const [todayData, setTodayData] = useState<TodayReservations | null>(null);
  const [upcomingData, setUpcomingData] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');
  const [propertyFilter, setPropertyFilter] = useState<string>('all');

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const [today, upcoming] = await Promise.all([
        api.getReservationsToday(),
        api.getReservationsUpcoming()
      ]);
      setTodayData(today);
      setUpcomingData(upcoming);
    } catch (err) {
      console.error('Erro ao buscar reservas:', err);
    } finally {
      setLoading(false);
    }
  };

  // Group upcoming reservations by date
  const groupByDate = (reservations: Reservation[]) => {
    const groups: { [key: string]: { checkins: Reservation[], checkouts: Reservation[] } } = {};

    reservations.forEach(res => {
      const checkinDate = new Date(res.checkinDate).toDateString();
      const checkoutDate = new Date(res.checkoutDate).toDateString();

      // Add to checkin group
      if (!groups[checkinDate]) {
        groups[checkinDate] = { checkins: [], checkouts: [] };
      }
      groups[checkinDate].checkins.push(res);

      // Add to checkout group (if different day)
      if (checkinDate !== checkoutDate) {
        if (!groups[checkoutDate]) {
          groups[checkoutDate] = { checkins: [], checkouts: [] };
        }
        groups[checkoutDate].checkouts.push(res);
      }
    });

    return groups;
  };

  // Filter reservations by property
  const filterByProperty = (reservations: Reservation[]) => {
    if (propertyFilter === 'all') return reservations;
    return reservations.filter(r => r.property?.name === propertyFilter || r.propertyId.toString() === propertyFilter);
  };

  // Get filtered data
  const filteredCheckins = todayData ? filterByProperty(todayData.checkins) : [];
  const filteredCheckouts = todayData ? filterByProperty(todayData.checkouts) : [];
  const filteredUpcoming = filterByProperty(upcomingData);

  // Get next 7 days summary
  const getUpcomingSummary = () => {
    const summary: { date: Date; checkins: number; checkouts: number }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);

      const dayStr = date.toDateString();
      let checkins = 0;
      let checkouts = 0;

      filteredUpcoming.forEach(res => {
        if (new Date(res.checkinDate).toDateString() === dayStr) checkins++;
        if (new Date(res.checkoutDate).toDateString() === dayStr) checkouts++;
      });

      if (checkins > 0 || checkouts > 0) {
        summary.push({ date, checkins, checkouts });
      }
    }

    return summary;
  };

  const upcomingSummary = getUpcomingSummary();

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Hoje';
    if (date.toDateString() === tomorrow.toDateString()) return 'Amanhã';

    return date.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  // Get unique property names
  const uniqueProperties = [...new Set([
    ...filteredCheckins.map(r => r.property?.name || ''),
    ...filteredCheckouts.map(r => r.property?.name || ''),
    ...properties.map(p => p.name)
  ])].filter(Boolean);

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-white">Reservas</h3>
          <p className="text-sm text-slate-500">
            Acompanhe check-ins e checkouts
          </p>
        </div>
        <Button variant="secondary" onClick={fetchReservations} disabled={loading}>
          <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-[#0B0C15] border border-white/5 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          {/* Time Filter Tabs */}
          <div className="flex gap-1 bg-white/5 rounded-lg p-1">
            {[
              { id: 'today', label: 'Hoje' },
              { id: 'week', label: 'Esta Semana' },
              { id: 'month', label: 'Este Mês' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setTimeFilter(tab.id as TimeFilter)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  timeFilter === tab.id
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Property Filter */}
          <div className="relative">
            <select
              className="appearance-none bg-white/5 border border-white/10 rounded-lg px-4 py-2 pr-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer"
              value={propertyFilter}
              onChange={e => setPropertyFilter(e.target.value)}
            >
              <option value="all">Todos os imóveis</option>
              {uniqueProperties.map(prop => (
                <option key={prop} value={prop}>{prop}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-[#0B0C15] border border-white/5 rounded-xl p-12 text-center">
          <RefreshCw className="w-8 h-8 text-slate-600 mx-auto mb-3 animate-spin" />
          <p className="text-slate-500">Carregando reservas...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Checkouts Section */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-red-500/10">
                <ArrowLeft className="w-4 h-4 text-red-400" />
              </div>
              <h4 className="text-sm font-medium text-white uppercase tracking-wider">
                Checkouts Hoje
              </h4>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                {filteredCheckouts.length}
              </span>
            </div>

            {filteredCheckouts.length === 0 ? (
              <div className="bg-[#0B0C15] border border-white/5 rounded-xl p-8 text-center">
                <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">Nenhum checkout para hoje</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCheckouts.map(reservation => (
                  <ReservationCard
                    key={`checkout-${reservation.id}`}
                    reservation={reservation}
                    type="checkout"
                    properties={properties}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Check-ins Section */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </div>
              <h4 className="text-sm font-medium text-white uppercase tracking-wider">
                Check-ins Hoje
              </h4>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {filteredCheckins.length}
              </span>
            </div>

            {filteredCheckins.length === 0 ? (
              <div className="bg-[#0B0C15] border border-white/5 rounded-xl p-8 text-center">
                <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">Nenhum check-in para hoje</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCheckins.map(reservation => (
                  <ReservationCard
                    key={`checkin-${reservation.id}`}
                    reservation={reservation}
                    type="checkin"
                    properties={properties}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Upcoming Summary */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Calendar className="w-4 h-4 text-blue-400" />
              </div>
              <h4 className="text-sm font-medium text-white uppercase tracking-wider">
                Proximos 7 Dias
              </h4>
            </div>

            {upcomingSummary.length === 0 ? (
              <div className="bg-[#0B0C15] border border-white/5 rounded-xl p-8 text-center">
                <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">Nenhuma reserva nos próximos 7 dias</p>
              </div>
            ) : (
              <div className="bg-[#0B0C15] border border-white/5 rounded-xl overflow-hidden">
                <table className="w-full">
                  <tbody className="divide-y divide-white/5">
                    {upcomingSummary.map((day, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4">
                          <span className="text-sm font-medium text-white">
                            {formatDate(day.date)}
                          </span>
                          <span className="text-xs text-slate-500 ml-2">
                            {day.date.toLocaleDateString('pt-BR', { weekday: 'long' })}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-4">
                            {day.checkouts > 0 && (
                              <span className="flex items-center gap-1.5 text-sm">
                                <ArrowLeft className="w-3.5 h-3.5 text-red-400" />
                                <span className="text-red-400">{day.checkouts} checkout{day.checkouts > 1 ? 's' : ''}</span>
                              </span>
                            )}
                            {day.checkins > 0 && (
                              <span className="flex items-center gap-1.5 text-sm">
                                <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">{day.checkins} check-in{day.checkins > 1 ? 's' : ''}</span>
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default ReservationsTab;
