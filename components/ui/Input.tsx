import React from 'react';
import { useTheme } from '../../lib/ThemeContext';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = ({ label, ...props }: InputProps) => {
  const { isDark } = useTheme();

  return (
    <div className="space-y-1.5">
      {label && <label className={`text-xs font-medium ml-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{label}</label>}
      <input
        className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors ${
          isDark
            ? 'border-white/10 bg-[#0B0C15] text-slate-200 placeholder:text-slate-600'
            : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400'
        }`}
        {...props}
      />
    </div>
  );
};

export default Input;
