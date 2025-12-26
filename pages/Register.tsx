import React from 'react';
import { SignUp } from '@clerk/clerk-react';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { useTheme } from '../lib/ThemeContext';
import { getClerkAppearance } from '../lib/clerkTheme';

interface RegisterPageProps {
  onRegisterSuccess?: () => void;
  onGoToLogin?: () => void;
}

export const RegisterPage = ({}: RegisterPageProps) => {
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

      {/* Clerk SignUp Component with custom theme */}
      <SignUp
        appearance={getClerkAppearance(isDark)}
        routing="path"
        path="/register"
        signInUrl="/login"
        forceRedirectUrl="/dashboard"
      />
    </div>
  );
};

export default RegisterPage;
