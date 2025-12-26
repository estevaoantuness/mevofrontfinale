import React from 'react';
import { useTheme } from '../lib/ThemeContext';

export const AppLoader = () => {
  const { isDark } = useTheme();

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center ${
        isDark ? 'bg-[#050509]' : 'bg-[#F8FAFC]'
      }`}
    >
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl animate-pulse ${
            isDark
              ? 'bg-gradient-to-r from-blue-600/20 to-cyan-400/20'
              : 'bg-gradient-to-r from-blue-400/30 to-cyan-300/30'
          }`}
        />
      </div>

      {/* Logo */}
      <div className="relative mb-8">
        <span className="text-5xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#2563EB] to-[#22D3EE]">
          mevo
        </span>
      </div>

      {/* Loading spinner */}
      <div className="relative">
        <div
          className={`w-8 h-8 border-2 rounded-full animate-spin ${
            isDark
              ? 'border-white/10 border-t-blue-500'
              : 'border-slate-200 border-t-blue-600'
          }`}
        />
      </div>
    </div>
  );
};

export default AppLoader;
