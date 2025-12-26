import React from 'react';
import { X, AlertTriangle, Trash2, Info } from 'lucide-react';
import { useTheme } from '../../lib/ThemeContext';
import { Button } from './Button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  loading = false
}: ConfirmModalProps) => {
  const { isDark } = useTheme();

  if (!isOpen) return null;

  const Icon = variant === 'danger' ? Trash2 : variant === 'info' ? Info : AlertTriangle;
  const iconBg = variant === 'danger'
    ? 'bg-red-500/10 text-red-500'
    : variant === 'info'
    ? 'bg-blue-500/10 text-blue-500'
    : 'bg-yellow-500/10 text-yellow-500';
  const confirmBtnClass = variant === 'danger'
    ? 'bg-red-600 hover:bg-red-700 text-white'
    : variant === 'info'
    ? 'bg-blue-600 hover:bg-blue-700 text-white'
    : 'bg-yellow-600 hover:bg-yellow-700 text-white';

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4 ${isDark ? 'bg-black/60' : 'bg-black/40'}`}>
      <div className={`w-full max-w-sm rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 ${
        isDark
          ? 'bg-[#0F1019] border border-white/10'
          : 'bg-white border border-slate-200'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
          <h3 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
          <button
            onClick={onClose}
            disabled={loading}
            className={`p-1 rounded-lg transition-colors ${isDark ? 'text-slate-500 hover:text-slate-300 hover:bg-white/5' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg}`}>
              <Icon size={20} />
            </div>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {message}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-end gap-3 px-5 py-4 border-t ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${confirmBtnClass}`}
          >
            {loading ? 'Aguarde...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
