import React, { useState, useEffect } from 'react';
import { X, Info } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import * as api from '../../lib/api';
import type { MessageTemplate, TemplateType, Placeholder } from '../../lib/api';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<MessageTemplate>) => Promise<void>;
  template: MessageTemplate | null;
  types: TemplateType[];
}

export const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  template,
  types
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('welcome');
  const [channel, setChannel] = useState('whatsapp');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [placeholders, setPlaceholders] = useState<Placeholder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load placeholders on mount
  useEffect(() => {
    api.getPlaceholders().then(setPlaceholders).catch(console.error);
  }, []);

  // Reset form when template changes
  useEffect(() => {
    if (template) {
      setName(template.name);
      setType(template.type);
      setChannel(template.channel);
      setSubject(template.subject || '');
      setContent(template.content);
      setIsActive(template.isActive);
    } else {
      setName('');
      setType('welcome');
      setChannel('whatsapp');
      setSubject('');
      setContent('');
      setIsActive(true);
    }
    setError('');
  }, [template, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Nome é obrigatório');
      return;
    }

    if (!content.trim()) {
      setError('Conteúdo é obrigatório');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        name: name.trim(),
        type,
        channel,
        subject: channel === 'email' ? subject.trim() : undefined,
        content: content.trim(),
        isActive
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar template';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const insertPlaceholder = (placeholder: string) => {
    const textarea = document.getElementById('template-content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.substring(0, start) + placeholder + content.substring(end);
      setContent(newContent);
      // Focus and set cursor position after placeholder
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + placeholder.length, start + placeholder.length);
      }, 0);
    } else {
      setContent(content + placeholder);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0B0C15] border border-white/10 rounded-xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-[#0B0C15] border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
          <h3 className="text-lg font-medium text-white">
            {template ? 'Editar Template' : 'Novo Template'}
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
            label="Nome do Template"
            placeholder="Ex: Boas-vindas WhatsApp"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Tipo</label>
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                {types.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Canal</label>
              <select
                value={channel}
                onChange={e => setChannel(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
              </select>
            </div>
          </div>

          {/* Type description */}
          {types.find(t => t.value === type)?.description && (
            <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <Info size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-400">
                {types.find(t => t.value === type)?.description}
              </p>
            </div>
          )}

          {/* Subject for email */}
          {channel === 'email' && (
            <Input
              label="Assunto do Email"
              placeholder="Ex: Sua reserva foi confirmada!"
              value={subject}
              onChange={e => setSubject(e.target.value)}
            />
          )}

          {/* Content */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Conteúdo da Mensagem</label>
            <textarea
              id="template-content"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all resize-none"
              rows={6}
              placeholder="Digite o conteúdo do template..."
              value={content}
              onChange={e => setContent(e.target.value)}
              required
            />
          </div>

          {/* Placeholders */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">
              Placeholders disponiveis (clique para inserir)
            </label>
            <div className="flex flex-wrap gap-2">
              {placeholders.map(p => (
                <button
                  key={p.placeholder}
                  type="button"
                  onClick={() => insertPlaceholder(p.placeholder)}
                  className="px-2 py-1 text-xs bg-white/5 border border-white/10 rounded hover:bg-white/10 hover:border-blue-500/30 text-slate-300 hover:text-blue-400 transition-all"
                  title={p.description}
                >
                  {p.placeholder}
                </button>
              ))}
            </div>
          </div>

          {/* Active toggle */}
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
            <span className="text-sm text-slate-300">Template ativo</span>
          </label>

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
              {loading ? 'Salvando...' : template ? 'Atualizar' : 'Criar Template'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TemplateModal;
