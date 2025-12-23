import React from 'react';
import { Menu } from 'lucide-react';
import { Logo } from '../Logo';
import { useTheme } from '../../lib/ThemeContext';

interface MobileHeaderProps {
  onMenuClick: () => void;
  onGoToLanding?: () => void;
  userName?: string;
}

export const MobileHeader = ({ onMenuClick, onGoToLanding, userName }: MobileHeaderProps) => {
  const { isDark } = useTheme();

  return (
    <header className={`md:hidden flex items-center justify-between px-4 py-3 border-b ${
      isDark
        ? 'border-white/5 bg-[#080911]'
        : 'border-slate-200 bg-white'
    }`}>
      {/* Menu Button */}
      <button
        onClick={onMenuClick}
        className={`p-2 -ml-2 rounded-lg transition-colors ${
          isDark
            ? 'text-slate-400 hover:text-white hover:bg-white/5'
            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
        }`}
        aria-label="Abrir menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Logo - Clickable to go to landing */}
      <Logo size="text-lg" onClick={onGoToLanding} />

      {/* User Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">
        {userName?.charAt(0)?.toUpperCase() || 'U'}
      </div>
    </header>
  );
};

export default MobileHeader;
