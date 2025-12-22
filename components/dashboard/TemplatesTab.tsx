import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Copy, Trash2, Eye, MessageSquare, Mail, Smartphone, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { TemplateModal } from './TemplateModal';
import * as api from '../../lib/api';
import type { MessageTemplate, TemplateType } from '../../lib/api';

export const TemplatesTab: React.FC = () => {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [types, setTypes] = useState<TemplateType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [filterType, setFilterType] = useState<string>('');
  const [filterChannel, setFilterChannel] = useState<string>('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);

  // Preview state
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [templatesData, typesData] = await Promise.all([
        api.getTemplates(),
        api.getTemplateTypes()
      ]);
      setTemplates(templatesData);
      setTypes(typesData);
    } catch (err) {
      setError('Erro ao carregar templates');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingTemplate(null);
    setModalOpen(true);
  };

  const handleEdit = (template: MessageTemplate) => {
    setEditingTemplate(template);
    setModalOpen(true);
  };

  const handleDuplicate = async (template: MessageTemplate) => {
    try {
      const duplicated = await api.duplicateTemplate(template.id);
      setTemplates([duplicated, ...templates]);
    } catch (err) {
      alert('Erro ao duplicar template');
    }
  };

  const handleDelete = async (template: MessageTemplate) => {
    if (!confirm(`Tem certeza que deseja excluir o template "${template.name}"?`)) return;

    try {
      await api.deleteTemplate(template.id);
      setTemplates(templates.filter(t => t.id !== template.id));
    } catch (err) {
      alert('Erro ao excluir template');
    }
  };

  const handleToggleActive = async (template: MessageTemplate) => {
    try {
      const updated = await api.updateTemplate(template.id, { isActive: !template.isActive });
      setTemplates(templates.map(t => t.id === template.id ? updated : t));
    } catch (err) {
      alert('Erro ao atualizar template');
    }
  };

  const handlePreview = async (template: MessageTemplate) => {
    setPreviewLoading(template.id);
    try {
      const result = await api.previewTemplate(template.id);
      setPreviewContent(result.content);
    } catch (err) {
      alert('Erro ao gerar preview');
    } finally {
      setPreviewLoading(null);
    }
  };

  const handleSave = async (data: Partial<MessageTemplate>) => {
    try {
      if (editingTemplate) {
        const updated = await api.updateTemplate(editingTemplate.id, data);
        setTemplates(templates.map(t => t.id === editingTemplate.id ? updated : t));
      } else {
        const created = await api.createTemplate(data);
        setTemplates([created, ...templates]);
      }
      setModalOpen(false);
      setEditingTemplate(null);
    } catch (err) {
      throw err;
    }
  };

  const getTypeLabel = (type: string) => {
    const found = types.find(t => t.value === type);
    return found?.label || type;
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp': return <MessageSquare size={14} className="text-green-400" />;
      case 'email': return <Mail size={14} className="text-blue-400" />;
      case 'sms': return <Smartphone size={14} className="text-purple-400" />;
      default: return <MessageSquare size={14} className="text-slate-400" />;
    }
  };

  const getChannelLabel = (channel: string) => {
    switch (channel) {
      case 'whatsapp': return 'WhatsApp';
      case 'email': return 'Email';
      case 'sms': return 'SMS';
      default: return channel;
    }
  };

  const filteredTemplates = templates.filter(t => {
    if (filterType && t.type !== filterType) return false;
    if (filterChannel && t.channel !== filterChannel) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-white">Templates de Mensagens</h3>
          <p className="text-sm text-slate-500">Personalize as mensagens automáticas enviadas aos hóspedes e funcionários</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus size={16} className="mr-2" /> Novo Template
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        >
          <option value="">Todos os tipos</option>
          {types.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>

        <select
          value={filterChannel}
          onChange={e => setFilterChannel(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        >
          <option value="">Todos os canais</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="email">Email</option>
          <option value="sms">SMS</option>
        </select>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Templates List */}
      <div className="space-y-3">
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12 bg-[#0B0C15] border border-white/5 rounded-xl">
            <MessageSquare size={48} className="mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400">Nenhum template encontrado</p>
            <p className="text-sm text-slate-500 mt-1">Crie seu primeiro template para começar</p>
          </div>
        ) : (
          filteredTemplates.map(template => (
            <div
              key={template.id}
              className={`bg-[#0B0C15] border rounded-xl p-5 transition-all ${
                template.isActive ? 'border-white/10' : 'border-white/5 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-white truncate">{template.name}</h4>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 text-xs">
                      {getChannelIcon(template.channel)}
                      <span className="text-slate-400">{getChannelLabel(template.channel)}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                      template.isActive
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                    }`}>
                      {template.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {getTypeLabel(template.type)}
                    </span>
                    {!template.userId && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        Global
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-slate-400 line-clamp-2">
                    {template.content.substring(0, 150)}{template.content.length > 150 ? '...' : ''}
                  </p>
                </div>

                <div className="flex items-center gap-1 ml-4">
                  <button
                    onClick={() => handlePreview(template)}
                    className="p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-all"
                    title="Preview"
                    disabled={previewLoading === template.id}
                  >
                    {previewLoading === template.id ? (
                      <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                  <button
                    onClick={() => handleToggleActive(template)}
                    className="p-2 text-slate-500 hover:text-yellow-400 hover:bg-yellow-500/10 rounded transition-all"
                    title={template.isActive ? 'Desativar' : 'Ativar'}
                  >
                    {template.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                  </button>
                  {template.userId && (
                    <>
                      <button
                        onClick={() => handleEdit(template)}
                        className="p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-all"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDuplicate(template)}
                        className="p-2 text-slate-500 hover:text-green-400 hover:bg-green-500/10 rounded transition-all"
                        title="Duplicar"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(template)}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-all"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                  {!template.userId && (
                    <button
                      onClick={() => handleDuplicate(template)}
                      className="p-2 text-slate-500 hover:text-green-400 hover:bg-green-500/10 rounded transition-all"
                      title="Criar copia editavel"
                    >
                      <Copy size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Template Modal */}
      <TemplateModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTemplate(null);
        }}
        onSave={handleSave}
        template={editingTemplate}
        types={types}
      />

      {/* Preview Modal */}
      {previewContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setPreviewContent(null)}
          />
          <div className="relative w-full max-w-lg bg-[#0B0C15] border border-white/10 rounded-xl p-6 shadow-2xl">
            <h3 className="text-lg font-medium text-white mb-4">Preview da Mensagem</h3>
            <div className="bg-white/5 rounded-lg p-4 text-sm text-slate-300 whitespace-pre-wrap">
              {previewContent}
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="secondary" onClick={() => setPreviewContent(null)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplatesTab;
