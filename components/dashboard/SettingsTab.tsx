import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Plus,
  Edit3,
  Trash2,
  Copy,
  Eye,
  CheckCircle,
  XCircle,
  X,
  Save,
  Info,
  Clock,
  Loader2
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import * as api from '../../lib/api';
import type { MessageTemplate, TemplateType, TemplatePlaceholder } from '../../lib/api';

// Template type labels for display
const TYPE_LABELS: Record<string, { label: string; description: string; icon: string }> = {
  cleaning: { label: 'Aviso de Limpeza', description: 'Enviado para funcionarios no dia do checkout', icon: 'cleaning' },
  checkout_reminder: { label: 'Lembrete de Checkout', description: 'Enviado 1 dia antes do checkout', icon: 'reminder' },
  checkin_reminder: { label: 'Lembrete de Check-in', description: 'Enviado 1 dia antes do check-in', icon: 'reminder' },
  welcome: { label: 'Boas-vindas', description: 'Enviado ao criar reserva', icon: 'welcome' },
  review_request: { label: 'Solicitacao de Avaliacao', description: 'Enviado 1 dia apos o checkout', icon: 'review' },
  custom: { label: 'Personalizado', description: 'Template customizado para uso manual', icon: 'custom' }
};

// Placeholders for team messages
const TEAM_PLACEHOLDERS = [
  { placeholder: '{{employee_name}}', description: 'Nome do funcionario' },
  { placeholder: '{{property_name}}', description: 'Nome do imovel' },
  { placeholder: '{{checkout_time}}', description: 'Horario de checkout' },
  { placeholder: '{{checkin_time}}', description: 'Horario de check-in' },
  { placeholder: '{{checkout_date}}', description: 'Data de checkout' },
  { placeholder: '{{checkin_date}}', description: 'Data de check-in' },
  { placeholder: '{{guest_name}}', description: 'Nome do hospede' }
];

interface TemplateEditorProps {
  template?: MessageTemplate;
  onSave: (data: { name: string; type: string; content: string; isActive: boolean }) => Promise<void>;
  onClose: () => void;
}

const TemplateEditor = ({ template, onSave, onClose }: TemplateEditorProps) => {
  const [name, setName] = useState(template?.name || '');
  const [type, setType] = useState(template?.type || 'cleaning');
  const [content, setContent] = useState(template?.content || '');
  const [isActive, setIsActive] = useState(template?.isActive ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) {
      setError('Nome e conteudo sao obrigatorios');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await onSave({ name, type, content, isActive });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar template');
    } finally {
      setSaving(false);
    }
  };

  const insertPlaceholder = (placeholder: string) => {
    setContent(prev => prev + placeholder);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-[#0B0C15] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h3 className="text-lg font-semibold text-white">
            {template ? 'Editar Template' : 'Novo Template'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          <Input
            label="Nome do Template"
            placeholder="Ex: Aviso de Checkout Padrao"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Tipo</label>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="cleaning">Notificacao de Limpeza</option>
              <option value="checkout_reminder">Lembrete de Checkout</option>
              <option value="checkin_reminder">Lembrete de Check-in</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Mensagem</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
              placeholder="Digite sua mensagem aqui..."
              required
            />
          </div>

          {/* Placeholders */}
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-medium text-slate-400">Variaveis disponiveis (clique para inserir)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {TEAM_PLACEHOLDERS.map(p => (
                <button
                  key={p.placeholder}
                  type="button"
                  onClick={() => insertPlaceholder(p.placeholder)}
                  className="px-2.5 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-md hover:bg-blue-500/20 transition-colors border border-blue-500/20"
                  title={p.description}
                >
                  {p.placeholder}
                </button>
              ))}
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-lg border border-white/5">
            <div>
              <span className="text-sm font-medium text-white">Template Ativo</span>
              <p className="text-xs text-slate-500 mt-0.5">Templates ativos serao usados no envio automatico</p>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                isActive ? 'bg-emerald-500' : 'bg-white/10'
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                isActive ? 'left-7' : 'left-1'
              }`} />
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5 bg-black/20">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" />
                Salvar Template
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export const SettingsTab = () => {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<MessageTemplate | null>(null);
  const [previewContent, setPreviewContent] = useState<string>('');
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await api.getTemplates({ channel: 'whatsapp' });
      setTemplates(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar templates');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async (data: { name: string; type: string; content: string; isActive: boolean }) => {
    await api.createTemplate({
      ...data,
      channel: 'whatsapp'
    });
    await loadTemplates();
  };

  const handleUpdateTemplate = async (data: { name: string; type: string; content: string; isActive: boolean }) => {
    if (!editingTemplate) return;
    await api.updateTemplate(editingTemplate.id, data);
    await loadTemplates();
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este template?')) return;
    try {
      await api.deleteTemplate(id);
      await loadTemplates();
    } catch (err: any) {
      alert('Erro ao excluir: ' + err.message);
    }
  };

  const handleDuplicateTemplate = async (id: number) => {
    try {
      await api.duplicateTemplate(id);
      await loadTemplates();
    } catch (err: any) {
      alert('Erro ao duplicar: ' + err.message);
    }
  };

  const handleToggleActive = async (template: MessageTemplate) => {
    try {
      await api.updateTemplate(template.id, { isActive: !template.isActive });
      await loadTemplates();
    } catch (err: any) {
      alert('Erro ao alternar: ' + err.message);
    }
  };

  const handlePreview = async (template: MessageTemplate) => {
    setPreviewTemplate(template);
    setPreviewLoading(true);
    try {
      const result = await api.previewTemplate(template.id);
      setPreviewContent(result.content);
    } catch {
      setPreviewContent(template.content);
    } finally {
      setPreviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Templates de Mensagem</h2>
          <p className="text-sm text-slate-400 mt-1">Configure os templates de mensagem para sua equipe</p>
        </div>
        <Button onClick={() => { setEditingTemplate(null); setShowEditor(true); }}>
          <Plus size={16} className="mr-2" />
          Novo Template
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Templates List */}
      <div className="space-y-4">
        {templates.length === 0 ? (
          <div className="text-center py-12 bg-white/[0.02] rounded-xl border border-white/5">
            <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Nenhum template ainda</h3>
            <p className="text-sm text-slate-500 mb-4">Crie seu primeiro template de mensagem</p>
            <Button onClick={() => { setEditingTemplate(null); setShowEditor(true); }}>
              <Plus size={16} className="mr-2" />
              Criar Template
            </Button>
          </div>
        ) : (
          templates.map(template => {
            const typeInfo = TYPE_LABELS[template.type] || TYPE_LABELS.custom;

            return (
              <div
                key={template.id}
                className="bg-[#0B0C15] border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-colors"
              >
                {/* Template Header */}
                <div className="flex items-start justify-between p-4 border-b border-white/5">
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-lg ${template.isActive ? 'bg-emerald-500/10' : 'bg-white/5'}`}>
                      <MessageSquare className={`w-5 h-5 ${template.isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-white">{template.name}</h4>
                        {template.isActive ? (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs rounded-full border border-emerald-500/20">
                            <CheckCircle className="w-3 h-3" />
                            Ativo
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-white/5 text-slate-500 text-xs rounded-full border border-white/10">
                            <XCircle className="w-3 h-3" />
                            Inativo
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500">{typeInfo.label}</span>
                        <span className="text-slate-700">|</span>
                        <span className="text-xs text-slate-500">{typeInfo.description}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handlePreview(template)}
                      className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                      title="Visualizar"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicateTemplate(template.id)}
                      className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                      title="Duplicar"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { setEditingTemplate(template); setShowEditor(true); }}
                      className="p-2 text-slate-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Template Content Preview */}
                <div className="p-4">
                  <div className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
                    <pre className="text-sm text-slate-400 whitespace-pre-wrap font-sans line-clamp-3">
                      {template.content}
                    </pre>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 py-3 bg-black/20 border-t border-white/5">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    Atualizado em {new Date(template.updatedAt).toLocaleDateString('pt-BR')}
                  </div>
                  <button
                    onClick={() => handleToggleActive(template)}
                    className={`text-xs font-medium px-3 py-1 rounded-md transition-colors ${
                      template.isActive
                        ? 'text-yellow-400 hover:bg-yellow-500/10'
                        : 'text-emerald-400 hover:bg-emerald-500/10'
                    }`}
                  >
                    {template.isActive ? 'Desativar' : 'Ativar'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Placeholders Reference */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-400" />
          Variaveis Disponiveis (Equipe)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {TEAM_PLACEHOLDERS.map(p => (
            <div key={p.placeholder} className="p-3 bg-black/20 rounded-lg">
              <code className="text-xs text-blue-400 font-mono">{p.placeholder}</code>
              <p className="text-xs text-slate-500 mt-1">{p.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Template Editor Modal */}
      {showEditor && (
        <TemplateEditor
          template={editingTemplate || undefined}
          onSave={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
          onClose={() => { setShowEditor(false); setEditingTemplate(null); }}
        />
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#0B0C15] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <h3 className="text-lg font-semibold text-white">Preview: {previewTemplate.name}</h3>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {previewLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                </div>
              ) : (
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-sm font-medium text-emerald-400">WhatsApp</span>
                  </div>
                  <p className="text-sm text-white whitespace-pre-wrap">{previewContent}</p>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-white/5 bg-black/20">
              <Button variant="secondary" className="w-full" onClick={() => setPreviewTemplate(null)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsTab;
