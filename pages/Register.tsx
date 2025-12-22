import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Logo } from '../components/Logo';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { CheckoutModal } from '../components/billing/CheckoutModal';
import { useAuth } from '../lib/AuthContext';
import { useTheme } from '../lib/ThemeContext';
import { useTranslatedError } from '../hooks/useTranslatedError';

// Planos para o CheckoutModal
const PLANS_DATA = {
  starter: { id: 'starter', name: 'Starter', monthlyPrice: 67, yearlyPrice: 49, features: ['Até 3 propriedades', 'Sync iCal', 'Automações básicas', 'Integração WhatsApp'], hasTrial: false },
  pro: { id: 'pro', name: 'Pro', monthlyPrice: 197, yearlyPrice: 149, features: ['Até 10 propriedades', 'Tudo do Starter', 'Webhooks', 'Suporte prioritário'], hasTrial: true, trialDays: 10 },
  agency: { id: 'agency', name: 'Agency', monthlyPrice: 379, yearlyPrice: 289, features: ['Até 30 propriedades', 'Tudo do Pro', 'Multi-usuários', 'API completa'], hasTrial: false }
};

interface RegisterPageProps {
  onRegisterSuccess: () => void;
  onGoToLogin: () => void;
}

export const RegisterPage = ({ onRegisterSuccess, onGoToLogin }: RegisterPageProps) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const { register } = useAuth();
  const { translateError } = useTranslatedError();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkoutModal, setCheckoutModal] = useState<{
    isOpen: boolean;
    plan: typeof PLANS_DATA.starter | null;
    interval: 'monthly' | 'yearly';
  }>({ isOpen: false, plan: null, interval: 'yearly' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validations
    if (!name || !email || !password || !confirmPassword) {
      setError(t('errors.validation.required'));
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError(t('errors.validation.passwordMatch'));
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(t('errors.auth.weakPassword'));
      setLoading(false);
      return;
    }

    try {
      await register(name, email, password);

      // Check for pending plan (selected on landing page)
      const pendingPlan = localStorage.getItem('mevo_pending_plan');
      if (pendingPlan) {
        const { planId, interval } = JSON.parse(pendingPlan);
        const plan = PLANS_DATA[planId as keyof typeof PLANS_DATA];
        if (plan) {
          localStorage.removeItem('mevo_pending_plan');
          setCheckoutModal({ isOpen: true, plan, interval });
          setLoading(false);
          return;
        }
      }

      onRegisterSuccess();
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
          <h2 className={`text-xl font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('auth.register.title')}</h2>
          <p className="text-sm text-slate-500">{t('auth.register.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('auth.register.name')}
            type="text"
            placeholder={t('auth.register.namePlaceholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label={t('auth.register.email')}
            type="email"
            placeholder={t('auth.register.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label={t('auth.register.password')}
            type="password"
            placeholder={t('auth.register.passwordPlaceholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Input
            label={t('auth.register.confirmPassword')}
            type="password"
            placeholder={t('auth.register.confirmPasswordPlaceholder')}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {error && (
            <div className={`p-3 rounded-lg text-xs text-center ${isDark ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-red-50 border border-red-200 text-red-600'}`}>
              {error}
            </div>
          )}

          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? t('auth.register.submitting') : t('auth.register.submit')}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            {t('auth.register.hasAccount')}{' '}
            <button onClick={onGoToLogin} className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
              {t('auth.register.login')}
            </button>
          </p>
        </div>
      </div>

      {/* Checkout Modal (após registro com plano pendente) */}
      {checkoutModal.plan && (
        <CheckoutModal
          isOpen={checkoutModal.isOpen}
          onClose={() => {
            setCheckoutModal({ isOpen: false, plan: null, interval: 'yearly' });
            onRegisterSuccess();
          }}
          plan={checkoutModal.plan}
          interval={checkoutModal.interval}
        />
      )}
    </div>
  );
};

export default RegisterPage;
