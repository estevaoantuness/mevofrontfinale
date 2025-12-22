import React from 'react';
import { Menu } from 'lucide-react';
import { Logo } from '../Logo';

interface MobileHeaderProps {
  onMenuClick: () => void;
  userName?: string;
}

export const MobileHeader = ({ onMenuClick, userName }: MobileHeaderProps) => {
  return (
    <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#080911]">
      {/* Menu Button */}
      <button
        onClick={onMenuClick}
        className="p-2 -ml-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
        aria-label="Abrir menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Logo */}
      <Logo size="text-lg" />

      {/* User Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">
        {userName?.charAt(0)?.toUpperCase() || 'U'}
      </div>
    </header>
  );
};

export default MobileHeader;
