import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Logo } from '../components/Logo';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { useAuth } from '../lib/AuthContext';
import { useTheme } from '../lib/ThemeContext';
import { useTranslatedError } from '../hooks/useTranslatedError';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onBack: () => void;
  onGoToRegister?: () => void;
  onGoToForgotPassword?: () => void;
}

export const LoginPage = ({ onLoginSuccess, onBack, onGoToRegister, onGoToForgotPassword }: LoginPageProps) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const { login } = useAuth();
  const { translateError } = useTranslatedError();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      onLoginSuccess();
    } catch (err: any) {
      setError(translateError(err));
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden ${isDark ? 'bg-[#050509]' : 'bg-[#F8FAFC]'}`}>
      {/* Language/Theme Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <LanguageSwitcher compact />
        <ThemeToggle />
      </div>

      <div className={`absolute inset-0 -z-10 ${isDark ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#050509] to-[#050509]' : 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-[#F8FAFC] to-[#F8FAFC]'}`} />

      <div className={`w-full max-w-sm border rounded-2xl p-8 shadow-2xl ${isDark ? 'bg-[#0B0C15] border-white/10' : 'bg-white border-slate-200'}`}>
        <div className="text-center mb-8">
          <div className="mb-6 flex justify-center"><Logo /></div>
          <h2 className={`text-xl font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('auth.login.title')}</h2>
          <p className="text-sm text-slate-500">{t('auth.login.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label={t('auth.login.email')}
            type="email"
            placeholder="admin@mevo.app"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div>
            <Input
              label={t('auth.login.password')}
              type="password"
              placeholder="******"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {onGoToForgotPassword && (
              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={onGoToForgotPassword}
                  className="text-xs text-slate-500 hover:text-blue-400 transition-colors"
                >
                  {t('auth.login.forgotPassword')}
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className={`p-3 rounded-lg text-xs text-center ${isDark ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-red-50 border border-red-200 text-red-600'}`}>
              {error}
            </div>
          )}

          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? t('auth.login.submitting') : t('auth.login.submit')}
          </Button>
        </form>

        <div className="mt-6 text-center space-y-3">
          {onGoToRegister && (
            <p className="text-sm text-slate-500">
              {t('auth.login.noAccount')}{' '}
              <button onClick={onGoToRegister} className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
                {t('auth.login.createAccount')}
              </button>
            </p>
          )}
          <button onClick={onBack} className={`text-xs transition-colors ${isDark ? 'text-slate-500 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
            &larr; {t('nav.backToHome')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
