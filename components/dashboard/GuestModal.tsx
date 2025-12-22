import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import type { GuestFull } from '../../lib/api';

interface GuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<GuestFull>) => Promise<void>;
  guest: GuestFull | null;
}

export const GuestModal: React.FC<GuestModalProps> = ({
  isOpen,
  onClose,
  onSave,
  guest
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [document, setDocument] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [nationality, setNationality] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('pt-BR');
  const [notes, setNotes] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset form when guest changes
  useEffect(() => {
    if (guest) {
      setName(guest.name);
      setEmail(guest.email || '');
      setPhone(guest.phone || '');
      setWhatsapp(guest.whatsapp || '');
      setDocument(guest.document || '');
      setDocumentType(guest.documentType || '');
      setNationality(guest.nationality || '');
      setPreferredLanguage(guest.preferredLanguage || 'pt-BR');
      setNotes(guest.notes || '');
      setIsActive(guest.isActive);
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setWhatsapp('');
      setDocument('');
      setDocumentType('');
      setNationality('');
      setPreferredLanguage('pt-BR');
      setNotes('');
      setIsActive(true);
    }
    setError('');
  }, [guest, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Nome e obrigatorio');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        whatsapp: whatsapp.trim() || phone.trim() || undefined,
        document: document.trim() || undefined,
        documentType: documentType || undefined,
        nationality: nationality.trim() || undefined,
        preferredLanguage: preferredLanguage || undefined,
        notes: notes.trim() || undefined,
        isActive
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar hospede';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#0B0C15] border border-white/10 rounded-xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-[#0B0C15] border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
          <h3 className="text-lg font-medium text-white">
            {guest ? 'Editar Hóspede' : 'Novo Hóspede'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <Input
            label="Nome *"
            placeholder="Nome completo do hóspede"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="email@exemplo.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <Input
              label="Telefone"
              placeholder="+55 11 99999-9999"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>

          <Input
            label="WhatsApp"
            placeholder="Deixe em branco para usar o telefone"
            value={whatsapp}
            onChange={e => setWhatsapp(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Documento"
              placeholder="CPF, RG ou Passaporte"
              value={document}
              onChange={e => setDocument(e.target.value)}
            />
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Tipo de Documento</label>
              <select
                value={documentType}
                onChange={e => setDocumentType(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                <option value="">Selecione...</option>
                <option value="cpf">CPF</option>
                <option value="rg">RG</option>
                <option value="passport">Passaporte</option>
                <option value="other">Outro</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nacionalidade"
              placeholder="Ex: Brasileiro"
              value={nationality}
              onChange={e => setNationality(e.target.value)}
            />
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Idioma Preferido</label>
              <select
                value={preferredLanguage}
                onChange={e => setPreferredLanguage(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en">Inglês</option>
                <option value="es">Espanhol</option>
                <option value="fr">Francês</option>
                <option value="de">Alemão</option>
                <option value="it">Italiano</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Notas</label>
            <textarea
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all resize-none"
              rows={3}
              placeholder="Observações sobre o hóspede..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          {/* Active toggle */}
          {guest && (
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setIsActive(!isActive)}
                className={`w-10 h-6 rounded-full transition-colors relative ${
                  isActive ? 'bg-green-500' : 'bg-slate-600'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    isActive ? 'left-5' : 'left-1'
                  }`}
                />
              </div>
              <span className="text-sm text-slate-300">Hóspede ativo</span>
            </label>
          )}

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : guest ? 'Atualizar' : 'Criar Hóspede'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GuestModal;
