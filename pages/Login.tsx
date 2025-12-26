import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { useTheme } from '../lib/ThemeContext';
import { getClerkAppearance } from '../lib/clerkTheme';

interface LoginPageProps {
  onBack?: () => void;
}

export const LoginPage = ({ onBack }: LoginPageProps) => {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden ${isDark ? 'bg-[#050509]' : 'bg-[#F8FAFC]'}`}>
      {/* Language/Theme Controls */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-1.5 sm:gap-2 z-10">
        <LanguageSwitcher compact />
        <ThemeToggle />
      </div>

      {/* Background gradient */}
      <div className={`absolute inset-0 -z-10 ${isDark ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#050509] to-[#050509]' : 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-[#F8FAFC] to-[#F8FAFC]'}`} />

      <div className="flex flex-col items-center">
        {/* Logo Mevo */}
        <div className="mb-8">
          <span className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#2563EB] to-[#22D3EE]">
            mevo
          </span>
        </div>

        {/* Clerk SignIn Component with custom theme */}
        <SignIn
          appearance={getClerkAppearance(isDark)}
          routing="path"
          path="/login"
          signUpUrl="/register"
          forceRedirectUrl="/dashboard"
        />
      </div>

      {/* Back to home link */}
      {onBack && (
        <button
          onClick={onBack}
          className={`absolute bottom-6 left-1/2 -translate-x-1/2 text-xs transition-colors ${isDark ? 'text-slate-500 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
        >
          &larr; Voltar para o início
        </button>
      )}
    </div>
  );
};

export default LoginPage;
