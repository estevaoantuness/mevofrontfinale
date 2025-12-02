import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = ({ label, ...props }: InputProps) => (
  <div className="space-y-1.5">
    {label && <label className="text-xs font-medium text-slate-400 ml-1">{label}</label>}
    <input
      className="flex h-10 w-full rounded-md border border-white/10 bg-[#0B0C15] px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors"
      {...props}
    />
  </div>
);

export default Input;
