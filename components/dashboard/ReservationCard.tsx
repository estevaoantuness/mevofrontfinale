import React, { useState } from 'react';
import {
  Home,
  User,
  Clock,
  Phone,
  CheckCircle,
  AlertCircle,
  Send,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '../ui/Button';
import type { Property, Reservation } from '../../lib/api';

interface ReservationCardProps {
  reservation: Reservation;
  type: 'checkin' | 'checkout';
  properties: Property[];
}

export const ReservationCard = ({ reservation, type, properties }: ReservationCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [sending, setSending] = useState(false);

  // Find property details
  const property = properties.find(p => p.id === reservation.propertyId);
  const propertyName = reservation.property?.name || property?.name || 'Imóvel';
  const employeeName = property?.employee_name || 'Responsável';
  const employeePhone = property?.employee_phone || '';

  // Format time
  const time = type === 'checkin'
    ? reservation.checkinTime || '15:00'
    : reservation.checkoutTime || '11:00';

  // Notification status from backend flags
  const notificationSent = type === 'checkin'
    ? Boolean(reservation.checkinReminderSent || reservation.welcomeMessageSent)
    : Boolean(reservation.checkoutReminderSent);

  const handleSendNotification = async () => {
    setSending(true);
    try {
      // TODO: Call API to send notification
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Notificacao enviada!');
    } catch (err) {
      alert('Erro ao enviar notificacao');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={`bg-[#0B0C15] border rounded-xl overflow-hidden transition-all ${
      expanded ? 'border-blue-500/30' : 'border-white/5 hover:border-white/10'
    }`}>
      {/* Main Content */}
      <div
        className="p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between">
          {/* Left Side */}
          <div className="flex items-start gap-4">
            {/* Property Icon */}
            <div className={`p-3 rounded-xl ${
              type === 'checkout' ? 'bg-red-500/10' : 'bg-emerald-500/10'
            }`}>
              <Home className={`w-5 h-5 ${
                type === 'checkout' ? 'text-red-400' : 'text-emerald-400'
              }`} />
            </div>

            {/* Info */}
            <div>
              <h4 className="font-medium text-white mb-1">{propertyName}</h4>
              <div className="flex items-center gap-4 text-sm">
                {reservation.guestName && (
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <User className="w-3.5 h-3.5" />
                    {reservation.guestName}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  {type === 'checkout' ? 'Check-out' : 'Check-in'}: {time}
                </span>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Notification Status */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
              notificationSent
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
            }`}>
              {notificationSent ? (
                <>
                  <CheckCircle className="w-3 h-3" />
                  Notificado
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3" />
                  Pendente
                </>
              )}
            </div>

            {/* Expand Icon */}
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-slate-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-500" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-white/5 pt-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Responsible */}
            <div className="bg-white/[0.02] rounded-lg p-3">
              <span className="text-xs text-slate-500 block mb-1">Responsável</span>
              <span className="text-sm text-white font-medium">{employeeName}</span>
            </div>

            {/* Phone */}
            <div className="bg-white/[0.02] rounded-lg p-3">
              <span className="text-xs text-slate-500 block mb-1">Telefone</span>
              <span className="text-sm text-white font-mono">{employeePhone || 'Não informado'}</span>
            </div>

            {/* Check-in Date */}
            <div className="bg-white/[0.02] rounded-lg p-3">
              <span className="text-xs text-slate-500 block mb-1">Check-in</span>
              <span className="text-sm text-white">
                {new Date(reservation.checkinDate).toLocaleDateString('pt-BR')}
                {reservation.checkinTime && ` as ${reservation.checkinTime}`}
              </span>
            </div>

            {/* Checkout Date */}
            <div className="bg-white/[0.02] rounded-lg p-3">
              <span className="text-xs text-slate-500 block mb-1">Checkout</span>
              <span className="text-sm text-white">
                {new Date(reservation.checkoutDate).toLocaleDateString('pt-BR')}
                {reservation.checkoutTime && ` as ${reservation.checkoutTime}`}
              </span>
            </div>
          </div>

          {/* Guest Info */}
          {(reservation.guestName || reservation.guestEmail || reservation.guestPhone) && (
            <div className="bg-white/[0.02] rounded-lg p-3 mb-4">
              <span className="text-xs text-slate-500 block mb-2">Funcionário</span>
              <div className="space-y-1">
                {reservation.guestName && (
                  <p className="text-sm text-white">{reservation.guestName}</p>
                )}
                {reservation.guestEmail && (
                  <p className="text-xs text-slate-400">{reservation.guestEmail}</p>
                )}
                {reservation.guestPhone && (
                  <p className="text-xs text-slate-400 font-mono">{reservation.guestPhone}</p>
                )}
              </div>
            </div>
          )}

          {/* Source Badge */}
          {reservation.source && (
            <div className="mb-4">
              <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${
                reservation.source.toLowerCase().includes('airbnb')
                  ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
                  : reservation.source.toLowerCase().includes('booking')
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
              }`}>
                {reservation.source}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              ID: {reservation.id}
            </span>

            {!notificationSent && employeePhone && (
              <Button
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSendNotification();
                }}
                disabled={sending}
              >
                {sending ? (
                  <>Enviando...</>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Notificacao
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationCard;
