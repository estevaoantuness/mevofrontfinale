import React from 'react';
import { X, Pencil, Mail, Phone, FileText, Globe, Calendar, Home } from 'lucide-react';
import { Button } from '../ui/Button';
import type { GuestFull } from '../../lib/api';

interface GuestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  guest: GuestFull | null;
  loading: boolean;
  onEdit: (guest: GuestFull) => void;
}

export const GuestDetailModal: React.FC<GuestDetailModalProps> = ({
  isOpen,
  onClose,
  guest,
  loading,
  onEdit
}) => {
  if (!isOpen || !guest) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'completed': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      confirmed: 'Confirmada',
      pending: 'Pendente',
      cancelled: 'Cancelada',
      completed: 'Finalizada'
    };
    return labels[status] || status;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0B0C15] border border-white/10 rounded-xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-[#0B0C15] border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-lg font-bold text-white">
              {guest.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">{guest.name}</h3>
              {guest.nationality && (
                <p className="text-sm text-slate-500">{guest.nationality}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => onEdit(guest)}>
              <Pencil size={14} className="mr-2" /> Editar
            </Button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-2"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Contact Info */}
            <div>
              <h4 className="text-sm font-medium text-slate-400 mb-3">Informacoes de Contato</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <Mail size={18} className="text-slate-500" />
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="text-sm text-white">{guest.email || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <Phone size={18} className="text-slate-500" />
                  <div>
                    <p className="text-xs text-slate-500">Telefone</p>
                    <p className="text-sm text-white">{guest.phone || '-'}</p>
                  </div>
                </div>
                {guest.whatsapp && guest.whatsapp !== guest.phone && (
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <Phone size={18} className="text-green-500" />
                    <div>
                      <p className="text-xs text-slate-500">WhatsApp</p>
                      <p className="text-sm text-white">{guest.whatsapp}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Document Info */}
            {(guest.document || guest.preferredLanguage) && (
              <div>
                <h4 className="text-sm font-medium text-slate-400 mb-3">Documentacao</h4>
                <div className="grid grid-cols-2 gap-4">
                  {guest.document && (
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                      <FileText size={18} className="text-slate-500" />
                      <div>
                        <p className="text-xs text-slate-500">
                          {guest.documentType === 'cpf' ? 'CPF' :
                           guest.documentType === 'rg' ? 'RG' :
                           guest.documentType === 'passport' ? 'Passaporte' : 'Documento'}
                        </p>
                        <p className="text-sm text-white font-mono">{guest.document}</p>
                      </div>
                    </div>
                  )}
                  {guest.preferredLanguage && (
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                      <Globe size={18} className="text-slate-500" />
                      <div>
                        <p className="text-xs text-slate-500">Idioma Preferido</p>
                        <p className="text-sm text-white">
                          {guest.preferredLanguage === 'pt-BR' ? 'Portugues' :
                           guest.preferredLanguage === 'en' ? 'Ingles' :
                           guest.preferredLanguage === 'es' ? 'Espanhol' :
                           guest.preferredLanguage}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            {guest.notes && (
              <div>
                <h4 className="text-sm font-medium text-slate-400 mb-3">Notas</h4>
                <div className="p-4 bg-white/5 rounded-lg text-sm text-slate-300 whitespace-pre-wrap">
                  {guest.notes}
                </div>
              </div>
            )}

            {/* Reservations History */}
            <div>
              <h4 className="text-sm font-medium text-slate-400 mb-3">
                Histórico de Reservas ({guest.reservations?.length || 0})
              </h4>
              {!guest.reservations || guest.reservations.length === 0 ? (
                <div className="text-center py-8 bg-white/5 rounded-lg">
                  <Calendar size={32} className="mx-auto text-slate-600 mb-2" />
                  <p className="text-sm text-slate-500">Nenhuma reserva encontrada</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {guest.reservations.map(reservation => (
                    <div
                      key={reservation.id}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                          <Home size={18} className="text-slate-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {reservation.property?.name || 'Propriedade'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatDate(reservation.checkinDate)} - {formatDate(reservation.checkoutDate)}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(reservation.status)}`}>
                        {getStatusLabel(reservation.status)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Meta Info */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-600">
              <span>Cadastrado em {formatDate(guest.createdAt)}</span>
              {!guest.isActive && (
                <span className="px-2 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                  Inativo
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestDetailModal;
