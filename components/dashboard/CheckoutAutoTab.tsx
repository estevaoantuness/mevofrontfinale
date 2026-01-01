import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  Phone,
  Clock,
  Home,
  Settings2,
  AlertCircle,
  CheckCircle,
  X,
  Pencil,
  Info,
  Calendar,
  Loader2,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  MessageSquare,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Save
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useTheme } from '../../lib/ThemeContext';
import { useToast } from '../ui/ToastContext';
import * as api from '../../lib/api';
import type { Property } from '../../lib/api';

// ============================================
// MESSAGE EDITOR COMPONENT
// ============================================

const DEFAULT_TEMPLATE = `Olá {nome}! 👋

Lembrando que seu checkout é hoje às 10h.
Por favor, deixe as chaves na recepção.

Obrigado pela estadia! 🏠`;

interface MessageEditorProps {
  expanded: boolean;
  onToggle: () => void;
}

const MessageEditor = ({ expanded, onToggle }: MessageEditorProps) => {
  const { isDark } = useTheme();
  const { showError, showSuccess } = useToast();
  const [template, setTemplate] = useState('');
  const [originalTemplate, setOriginalTemplate] = useState('');
  const [isDefault, setIsDefault] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Load current template
  useEffect(() => {
    if (expanded) {
      loadTemplate();
    }
  }, [expanded]);

  const loadTemplate = async () => {
    try {
      setLoading(true);
      const data = await api.getCheckoutMessage();
      setTemplate(data.template);
      setOriginalTemplate(data.template);
      setIsDefault(data.isDefault);
    } catch (err) {
      console.error('Erro ao carregar template:', err);
      setTemplate(DEFAULT_TEMPLATE);
      setOriginalTemplate(DEFAULT_TEMPLATE);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!template.includes('{nome}')) {
      showError('A mensagem deve conter {nome} para incluir o nome do hóspede');
      return;
    }

    if (template.length > 2000) {
      showError('Mensagem muito longa (máximo 2000 caracteres)');
      return;
    }

    try {
      setSaving(true);
      const result = await api.saveCheckoutMessage(template);
      setOriginalTemplate(template);
      setIsDefault(template === DEFAULT_TEMPLATE);
      showSuccess(result.message || 'Mensagem salva! Seus imóveis serão atualizados automaticamente.');
    } catch (err: any) {
      showError(err.message || 'Erro ao salvar mensagem');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      setResetting(true);
      const result = await api.resetCheckoutMessage();
      setTemplate(result.template);
      setOriginalTemplate(result.template);
      setIsDefault(true);
      showSuccess(result.message || 'Mensagem restaurada para o padrão');
    } catch (err: any) {
      showError(err.message || 'Erro ao restaurar mensagem');
    } finally {
      setResetting(false);
    }
  };

  const hasChanges = template !== originalTemplate;
  const charCount = template.length;

  return (
    <div className={`rounded-xl border overflow-hidden transition-all ${
      isDark ? 'bg-[#0B0C15] border-white/10' : 'bg-white border-slate-200 shadow-sm'
    }`}>
      {/* Header - Always visible */}
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-4 transition-colors ${
          isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isDark ? 'bg-purple-500/10' : 'bg-purple-50'
          }`}>
            <MessageSquare className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
          </div>
          <div className="text-left">
            <h3 className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Mensagem de Checkout
            </h3>
            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              Edite a mensagem que será enviada nos checkouts
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isDefault && (
            <span className={`text-xs px-2 py-1 rounded-full ${
              isDark ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600'
            }`}>
              Personalizada
            </span>
          )}
          {expanded ? (
            <ChevronUp className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
          ) : (
            <ChevronDown className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className={`px-4 pb-4 border-t ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
            </div>
          ) : (
            <div className="pt-4 space-y-4">
              {/* Info box */}
              <div className={`rounded-lg p-3 flex items-start gap-3 ${
                isDark ? 'bg-purple-500/5 border border-purple-500/20' : 'bg-purple-50 border border-purple-100'
              }`}>
                <Sparkles className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Escreva uma mensagem exemplo. Nossa IA adaptará automaticamente para cada imóvel,
                  incluindo horários e detalhes específicos. Use <code className={`px-1 rounded ${isDark ? 'bg-white/10' : 'bg-purple-100'}`}>{'{nome}'}</code> onde quiser o nome do hóspede.
                </p>
              </div>

              {/* Textarea */}
              <div>
                <textarea
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  rows={6}
                  className={`w-full px-4 py-3 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/40 resize-none ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white placeholder-slate-500'
                      : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                  placeholder="Olá {nome}! Lembrando que seu checkout é hoje..."
                />
                <div className="flex justify-between mt-1.5">
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    {!template.includes('{nome}') && (
                      <span className="text-amber-500">⚠ Inclua {'{nome}'} na mensagem</span>
                    )}
                  </p>
                  <p className={`text-xs ${charCount > 2000 ? 'text-red-500' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    {charCount}/2000
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  disabled={resetting || isDefault}
                  className={isDefault ? 'opacity-50' : ''}
                >
                  {resetting ? (
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  ) : (
                    <RotateCcw className="w-4 h-4 mr-1.5" />
                  )}
                  Restaurar padrão
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={saving || !hasChanges || !template.includes('{nome}') || charCount > 2000}
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-1.5" />
                  )}
                  Salvar mensagem
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Props interface for CheckoutAutoTab
interface CheckoutAutoTabProps {
  // Callback to notify parent (Dashboard) when a property is updated
  onPropertyUpdate?: (updatedProperty: Property) => void;
}

// ============================================
// TOGGLE COMPONENT
// ============================================

interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
  loading?: boolean;
}

const Toggle = ({ enabled, onChange, disabled, loading }: ToggleProps) => {
  const { isDark } = useTheme();

  return (
    <button
      type="button"
      onClick={() => !disabled && !loading && onChange(!enabled)}
      disabled={disabled || loading}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${
        enabled
          ? 'bg-blue-500'
          : isDark ? 'bg-white/10' : 'bg-slate-200'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      >
        {loading && (
          <Loader2 className="w-3 h-3 m-1 animate-spin text-blue-500" />
        )}
      </span>
    </button>
  );
};

// ============================================
// PROPERTY CARD COMPONENT
// ============================================

interface PropertyCardProps {
  property: Property & {
    hasIcal: boolean;
    status: 'active' | 'inactive' | 'unconfigured' | 'no_ical';
  };
  onToggle: (enabled: boolean) => void;
  onEdit: () => void;
  onHide: () => void;
  isHidden?: boolean;
  loading?: boolean;
}

const PropertyCard = ({ property, onToggle, onEdit, onHide, isHidden, loading }: PropertyCardProps) => {
  const { isDark } = useTheme();

  const statusConfig = {
    active: {
      color: 'green',
      icon: CheckCircle,
      text: 'Ativo',
      bgClass: isDark ? 'bg-green-500/10 border-green-500/20' : 'bg-green-50 border-green-200'
    },
    inactive: {
      color: 'slate',
      icon: Bell,
      text: 'Desativado',
      bgClass: isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
    },
    unconfigured: {
      color: 'yellow',
      icon: AlertCircle,
      text: 'Não configurado',
      bgClass: isDark ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-yellow-50 border-yellow-200'
    },
    no_ical: {
      color: 'red',
      icon: AlertCircle,
      text: 'Sem calendário',
      bgClass: isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200'
    }
  };

  const status = statusConfig[property.status];
  const StatusIcon = status.icon;
  const canToggle = property.hasIcal;

  return (
    <div className={`rounded-xl border p-5 transition-all ${
      isDark ? 'bg-[#0B0C15] border-white/10' : 'bg-white border-slate-200 shadow-sm'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center ${
            isDark ? 'bg-blue-500/10' : 'bg-blue-50'
          }`}>
            <Home className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
          <div className="min-w-0">
            <h3 className={`font-medium truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {property.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <StatusIcon className={`w-3.5 h-3.5 flex-shrink-0 text-${status.color}-500`} />
              <span className={`text-xs text-${status.color}-500`}>{status.text}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onHide}
            className={`p-1.5 rounded-lg transition-colors ${
              isHidden
                ? isDark
                  ? 'text-slate-500 hover:text-green-400 hover:bg-green-500/10'
                  : 'text-slate-400 hover:text-green-600 hover:bg-green-50'
                : isDark
                  ? 'text-slate-500 hover:text-red-400 hover:bg-red-500/10'
                  : 'text-slate-400 hover:text-red-500 hover:bg-red-50'
            }`}
            title={isHidden ? 'Restaurar na lista' : 'Remover da lista'}
          >
            {isHidden ? <Eye className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
          </button>
          <Toggle
            enabled={property.checkout_auto_enabled}
            onChange={onToggle}
            disabled={!canToggle}
            loading={loading}
          />
        </div>
      </div>

      {/* Content based on status */}
      {property.status === 'no_ical' ? (
        <div className={`rounded-lg p-3 ${status.bgClass}`}>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Configure um calendário iCal em "Meus Imóveis" para ativar o checkout automático.
          </p>
        </div>
      ) : property.status === 'unconfigured' ? (
        <div className={`rounded-lg p-3 ${status.bgClass}`}>
          <p className={`text-xs mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Configure um telefone para receber as notificações.
          </p>
          <Button size="sm" variant="secondary" onClick={onEdit}>
            <Phone className="w-3.5 h-3.5 mr-1.5" />
            Configurar telefone
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Phone */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {property.checkout_notify_phone || 'Não configurado'}
              </span>
            </div>
            <button
              onClick={onEdit}
              className={`p-1.5 rounded-lg transition-colors ${
                isDark
                  ? 'text-slate-500 hover:text-white hover:bg-white/5'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>

          {/* Time + Dispatch Window */}
          <div className="flex items-center gap-2">
            <Clock className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Janela: {DISPATCH_WINDOWS[property.checkout_dispatch_window ?? 0]?.label || '08:00 - 08:10'}
            </span>
          </div>

          {/* iCal status */}
          <div className="flex items-center gap-2">
            <Calendar className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              {property.ical_airbnb && 'Airbnb'}
              {property.ical_airbnb && property.ical_booking && ' + '}
              {property.ical_booking && 'Booking'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// CONFIG MODAL COMPONENT
// ============================================

// Dispatch window options
const DISPATCH_WINDOWS = [
  { id: 0, label: '08:00 - 08:10' },
  { id: 1, label: '08:10 - 08:20' },
  { id: 2, label: '08:20 - 08:30' },
  { id: 3, label: '08:30 - 08:40' },
  { id: 4, label: '08:40 - 08:50' },
  { id: 5, label: '08:50 - 09:00' },
];

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
  onSave: (phone: string, dispatchWindow: number) => Promise<void>;
}

const ConfigModal = ({ isOpen, onClose, property, onSave }: ConfigModalProps) => {
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const [phone, setPhone] = useState('');
  const [dispatchWindow, setDispatchWindow] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Reset form when property changes
  useEffect(() => {
    if (property) {
      // Use checkout_notify_phone, fallback to employee_phone from "Meus Imóveis"
      setPhone(property.checkout_notify_phone || property.employee_phone || '');
      setDispatchWindow(property.checkout_dispatch_window ?? 0);
      setError('');
    }
  }, [property]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError(t('property.checkoutAutoPhoneRequired') || 'Digite um número de telefone');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await onSave(phone, dispatchWindow);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 4) return `${numbers.slice(0, 2)} (${numbers.slice(2)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 2)} (${numbers.slice(2, 4)}) ${numbers.slice(4)}`;
    return `${numbers.slice(0, 2)} (${numbers.slice(2, 4)}) ${numbers.slice(4, 9)}-${numbers.slice(9, 13)}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Configurar ${property?.name || 'Imóvel'}`}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Phone */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            Telefone para notificações
          </label>
          <div className="relative">
            <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              placeholder="55 41 99999-9999"
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white placeholder-slate-500'
                  : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>
          <p className={`text-xs mt-1.5 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
            Este número receberá os avisos de checkout diários
          </p>
        </div>

        {/* Dispatch Window */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            Janela de disparo
          </label>
          <div className="relative">
            <Bell className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            <select
              value={dispatchWindow}
              onChange={(e) => setDispatchWindow(Number(e.target.value))}
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40 appearance-none ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white'
                  : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              {DISPATCH_WINDOWS.map((window) => (
                <option key={window.id} value={window.id} className={isDark ? 'bg-[#1a1b26]' : ''}>
                  {window.label}
                </option>
              ))}
            </select>
            <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <p className={`text-xs mt-1.5 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
            As mensagens serão enviadas dentro desta janela de 10 minutos
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const CheckoutAutoTab: React.FC<CheckoutAutoTabProps> = ({ onPropertyUpdate }) => {
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const { showError, showSuccess } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [showHidden, setShowHidden] = useState(false);
  const [messageEditorExpanded, setMessageEditorExpanded] = useState(false);

  // Config Modal State
  const [configModal, setConfigModal] = useState<{
    isOpen: boolean;
    property: Property | null;
  }>({ isOpen: false, property: null });

  // Load properties
  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const data = await api.getProperties();
      setProperties(data);
      if (isRefresh) {
        showSuccess('Lista atualizada');
      }
    } catch (err) {
      console.error('Erro ao carregar imóveis:', err);
      if (isRefresh) {
        showError('Erro ao atualizar lista');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    if (!refreshing) {
      fetchProperties(true);
    }
  };

  // Toggle checkout auto
  const handleToggle = async (property: Property, enabled: boolean) => {
    // If enabling without phone, open config modal
    if (enabled && !property.checkout_notify_phone) {
      setConfigModal({ isOpen: true, property });
      return;
    }

    setSavingId(property.id);
    try {
      const updated = await api.updatePropertyCheckoutAuto(property.id, { enabled });
      const fullUpdatedProperty = { ...property, checkout_auto_enabled: enabled, ...updated };
      setProperties(prev => prev.map(p =>
        p.id === property.id ? fullUpdatedProperty : p
      ));
      // Notify parent (Dashboard) about the update
      onPropertyUpdate?.(fullUpdatedProperty);
    } catch (err: any) {
      console.error('Erro ao atualizar:', err);
      showError(t('notifications.error.settingsSave'));
    } finally {
      setSavingId(null);
    }
  };

  // Save config from modal
  const handleSaveConfig = async (phone: string, dispatchWindow: number) => {
    if (!configModal.property) return;

    const updated = await api.updatePropertyCheckoutAuto(configModal.property.id, {
      enabled: true,
      phone,
      dispatch_window: dispatchWindow
    });

    const fullUpdatedProperty = { ...configModal.property, ...updated };
    setProperties(prev => prev.map(p =>
      p.id === configModal.property!.id ? fullUpdatedProperty : p
    ));
    // Notify parent (Dashboard) about the update
    onPropertyUpdate?.(fullUpdatedProperty);
  };

  // Open edit modal
  const handleEdit = (property: Property) => {
    setConfigModal({ isOpen: true, property });
  };

  // Hide property from checkout auto
  const handleHide = async (property: Property) => {
    setSavingId(property.id);
    try {
      await api.hidePropertyFromCheckoutAuto(property.id, true);
      const fullUpdatedProperty = { ...property, checkout_auto_hidden: true };
      setProperties(prev => prev.map(p =>
        p.id === property.id ? fullUpdatedProperty : p
      ));
      // Notify parent (Dashboard) about the update
      onPropertyUpdate?.(fullUpdatedProperty);
      showSuccess('Imóvel removido da lista');
    } catch (err: any) {
      console.error('Erro ao esconder imóvel:', err);
      showError('Erro ao remover imóvel da lista');
    } finally {
      setSavingId(null);
    }
  };

  // Unhide property
  const handleUnhide = async (property: Property) => {
    setSavingId(property.id);
    try {
      await api.hidePropertyFromCheckoutAuto(property.id, false);
      const fullUpdatedProperty = { ...property, checkout_auto_hidden: false };
      setProperties(prev => prev.map(p =>
        p.id === property.id ? fullUpdatedProperty : p
      ));
      // Notify parent (Dashboard) about the update
      onPropertyUpdate?.(fullUpdatedProperty);
      showSuccess('Imóvel restaurado');
    } catch (err: any) {
      console.error('Erro ao restaurar imóvel:', err);
      showError('Erro ao restaurar imóvel');
    } finally {
      setSavingId(null);
    }
  };

  // Transform properties with status
  const propertiesWithStatus = properties.map(p => ({
    ...p,
    hasIcal: !!(p.ical_airbnb || p.ical_booking),
    status: getPropertyStatus(p)
  }));

  // Filter visible/hidden properties
  const visibleProperties = propertiesWithStatus.filter(p => !p.checkout_auto_hidden);
  const hiddenProperties = propertiesWithStatus.filter(p => p.checkout_auto_hidden);
  const displayedProperties = showHidden ? hiddenProperties : visibleProperties;

  // Stats
  const activeCount = visibleProperties.filter(p => p.status === 'active').length;
  const totalConfigurable = visibleProperties.filter(p => p.hasIcal).length;

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Checkout Automático
          </h2>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Configure notificações automáticas de checkout por imóvel
          </p>
        </div>

        {/* Refresh Button + Stats Badge + Hidden Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`p-2 rounded-lg transition-colors ${
              isDark
                ? 'text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-50'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-50'
            }`}
            title="Atualizar lista"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm ${
            isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'
          }`}>
            <CheckCircle className="w-4 h-4" />
            {activeCount} de {totalConfigurable} ativos
          </div>

          {hiddenProperties.length > 0 && (
            <button
              onClick={() => setShowHidden(!showHidden)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-colors ${
                showHidden
                  ? isDark
                    ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                    : 'bg-red-50 text-red-600 hover:bg-red-100'
                  : isDark
                    ? 'bg-white/5 text-slate-400 hover:bg-white/10'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {showHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {hiddenProperties.length} oculto{hiddenProperties.length > 1 ? 's' : ''}
            </button>
          )}
        </div>
      </div>

      {/* Message Editor */}
      <MessageEditor
        expanded={messageEditorExpanded}
        onToggle={() => setMessageEditorExpanded(!messageEditorExpanded)}
      />

      {/* Properties Grid */}
      {properties.length === 0 ? (
        <div className={`text-center py-12 rounded-xl ${
          isDark ? 'bg-[#0B0C15] border border-white/10' : 'bg-white border border-slate-200'
        }`}>
          <Home className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
          <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Nenhum imóvel cadastrado
          </p>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
            Cadastre imóveis na aba "Meus Imóveis" para configurar o checkout automático.
          </p>
        </div>
      ) : displayedProperties.length === 0 ? (
        <div className={`text-center py-12 rounded-xl ${
          isDark ? 'bg-[#0B0C15] border border-white/10' : 'bg-white border border-slate-200'
        }`}>
          {showHidden ? (
            <>
              <EyeOff className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
              <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Nenhum imóvel oculto
              </p>
              <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                Imóveis removidos da lista aparecerão aqui.
              </p>
            </>
          ) : (
            <>
              <Home className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
              <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Todos os imóveis estão ocultos
              </p>
              <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                Clique em "{hiddenProperties.length} oculto{hiddenProperties.length > 1 ? 's' : ''}" para ver.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayedProperties.map(property => (
            <PropertyCard
              key={property.id}
              property={property}
              onToggle={(enabled) => handleToggle(property, enabled)}
              onEdit={() => handleEdit(property)}
              onHide={() => showHidden ? handleUnhide(property) : handleHide(property)}
              isHidden={showHidden}
              loading={savingId === property.id}
            />
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className={`rounded-xl p-4 ${
        isDark ? 'bg-blue-500/5 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'
      }`}>
        <div className="flex gap-3">
          <Info className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          <div className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <p className="font-medium mb-1">Como funciona?</p>
            <ul className="space-y-1 text-xs opacity-80">
              <li>• O sistema verifica seus calendários iCal todos os dias</li>
              <li>• Quando detecta um checkout, envia uma mensagem no horário configurado</li>
              <li>• Cada imóvel pode ter seu próprio telefone e horário</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Config Modal */}
      <ConfigModal
        isOpen={configModal.isOpen}
        onClose={() => setConfigModal({ isOpen: false, property: null })}
        property={configModal.property}
        onSave={handleSaveConfig}
      />
    </div>
  );
};

// Helper function
function getPropertyStatus(property: Property): 'active' | 'inactive' | 'unconfigured' | 'no_ical' {
  const hasIcal = !!(property.ical_airbnb || property.ical_booking);
  if (!hasIcal) return 'no_ical';
  if (!property.checkout_notify_phone) return 'unconfigured';
  if (!property.checkout_auto_enabled) return 'inactive';
  return 'active';
}

export default CheckoutAutoTab;
