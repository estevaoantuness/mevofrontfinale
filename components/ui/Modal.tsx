import React from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../../lib/ThemeContext';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children?: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  const { isDark } = useTheme();

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4 ${isDark ? 'bg-black/60' : 'bg-black/40'}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`w-full max-w-md rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 ${
          isDark
            ? 'bg-[#0F1019] border border-white/10'
            : 'bg-white border border-slate-200'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex items-center justify-between px-4 md:px-6 py-4 border-b ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
          <h3 className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{title}</h3>
          <button onClick={onClose} className={`transition-colors ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}>
            <X size={18} />
          </button>
        </div>
        <div className="p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
