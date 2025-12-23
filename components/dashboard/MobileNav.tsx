import React, { useEffect } from 'react';
import {
  X,
  LayoutGrid,
  Home,
  Calendar,
  Calculator,
  MessageCircle,
  CreditCard,
  User,
  Settings,
  LogOut,
  ExternalLink
} from 'lucide-react';
import { Logo } from '../Logo';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  onGoToLanding?: () => void;
  userName?: string;
  userEmail?: string;
}

const navItems = [
  { id: 'overview', icon: LayoutGrid, label: 'Visão Geral' },
  { id: 'reservations', icon: Calendar, label: 'Reservas' },
  { id: 'pricing', icon: Calculator, label: 'Precificação' },
  { id: 'properties', icon: Home, label: 'Meus Imóveis' },
  { id: 'whatsapp', icon: MessageCircle, label: 'WhatsApp' },
  { id: 'billing', icon: CreditCard, label: 'Assinatura' },
  { id: 'profile', icon: User, label: 'Meu Perfil' },
  { id: 'settings', icon: Settings, label: 'Configurações' },
];

export const MobileNav = ({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  onLogout,
  onGoToLanding,
  userName,
  userEmail
}: MobileNavProps) => {
  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleNavClick = (tabId: string) => {
    onTabChange(tabId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-72 bg-[#080911] border-r border-white/5 z-50 md:hidden flex flex-col animate-in slide-in-from-left duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/5">
          <Logo size="text-lg" />
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 overflow-y-auto">
          <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
            Menu
          </div>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all mb-1 ${
                activeTab === item.id
                  ? 'bg-white/5 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
              }`}
            >
              <item.icon
                size={18}
                className={`mr-3 ${activeTab === item.id ? 'text-blue-400' : 'text-slate-500'}`}
              />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/5">
          {/* User Info */}
          <div className="flex items-center mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-sm font-bold text-white shadow-lg">
              {userName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{userName || 'Usuario'}</p>
              <p className="text-xs text-slate-500 truncate">{userEmail || ''}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-1">
            {onGoToLanding && (
              <button
                onClick={() => {
                  onGoToLanding();
                  onClose();
                }}
                className="w-full flex items-center px-3 py-2.5 text-sm text-slate-400 hover:text-blue-400 hover:bg-white/[0.02] rounded-lg transition-colors"
              >
                <ExternalLink size={16} className="mr-3" />
                Ver Site
              </button>
            )}
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full flex items-center px-3 py-2.5 text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-colors"
            >
              <LogOut size={16} className="mr-3" />
              Sair da conta
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileNav;
