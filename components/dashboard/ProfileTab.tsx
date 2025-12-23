import React, { useState, useEffect, useMemo } from 'react';
import {
  Loader2, AlertTriangle, Check, CreditCard, ChevronDown, ChevronRight,
  Lock, Eye, EyeOff, X, MessageCircle, Mail, Calendar, Pencil,
  Globe, Palette, Link2, HelpCircle, Headphones, LogOut
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CheckoutModal } from '../billing/CheckoutModal';
import {
  getProfile,
  updateProfile,
  Profile,
  getSubscription,
  getInvoices,
  getUsage,
  openBillingPortal,
  cancelSubscription,
  changePassword,
  getWhatsAppStatus,
  getPreferences,
  updatePreferences,
  Subscription,
  Invoice,
  UsageStats,
  WhatsAppStatus,
  UserPreferences,
  Property
} from '../../lib/api';
import { useTheme } from '../../lib/ThemeContext';

// Planos disponíveis com features explícitas
const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 67,
    yearlyPrice: 49,
    propertyLimit: 3,
    features: [
      'Até 3 propriedades',
      'Sync iCal (Airbnb/Booking)',
      'Integração WhatsApp',
      'Templates com placeholders',
      'Avisos de checkout',
      '1 usuário'
    ],
    hasTrial: false
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 197,
    yearlyPrice: 149,
    propertyLimit: 10,
    features: [
      'Até 10 propriedades',
      'Sync iCal (Airbnb/Booking)',
      'Integração WhatsApp',
      'Templates com placeholders',
      'Avisos de checkout',
      'Calculadora de Preços IA',
      'Webhooks personalizados',
      'Até 3 usuários',
      'Suporte prioritário'
    ],
    isPopular: true,
    hasTrial: true,
    trialDays: 10
  },
  {
    id: 'agency',
    name: 'Agency',
    monthlyPrice: 379,
    yearlyPrice: 289,
    propertyLimit: 30,
    features: [
      'Até 30 propriedades',
      'Sync iCal (Airbnb/Booking)',
      'Integração WhatsApp',
      'Templates com placeholders',
      'Avisos de checkout',
      'Calculadora de Preços IA',
      'Webhooks personalizados',
      'Maya IA (em breve)',
      'Multi-usuários (até 10)',
      'API Access',
      'Suporte dedicado',
      'Gerente dedicado'
    ],
    hasTrial: false
  }
];

interface ProfileTabProps {
  onLogout: () => void;
  properties?: Property[];
  onNavigateToWhatsApp?: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({ onLogout, properties = [], onNavigateToWhatsApp }) => {
  const { isDark, setTheme } = useTheme();
  const { i18n } = useTranslation();
  const location = useLocation();

  // Profile states
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Edit mode states
  const [editingName, setEditingName] = useState(false);
  const [editName, setEditName] = useState('');

  // WhatsApp status
  const [whatsappStatus, setWhatsappStatus] = useState<WhatsAppStatus | null>(null);

  // Subscription states
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isYearly, setIsYearly] = useState(true);
  const [showPlans, setShowPlans] = useState(false);
  const [highlightPlan, setHighlightPlan] = useState<string | null>(null);
  const [checkoutModal, setCheckoutModal] = useState<{ isOpen: boolean; plan: typeof PLANS[0] | null; interval: 'monthly' | 'yearly' }>({
    isOpen: false,
    plan: null,
    interval: 'yearly'
  });

  // Password change states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Calcular integrações iCal
  const integrations = useMemo(() => {
    const airbnb = properties.filter(p => p.ical_airbnb).length;
    const booking = properties.filter(p => p.ical_booking).length;
    return { airbnb, booking, total: airbnb + booking };
  }, [properties]);

  useEffect(() => {
    loadAllData();
  }, []);

  // Handle URL params for plan highlight
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const plan = params.get('plan');
    if (!plan || !['starter', 'pro', 'agency'].includes(plan)) return;

    setHighlightPlan(plan);
    setShowPlans(true);
    const scrollToPlan = () => {
      const element = document.getElementById(`plan-card-${plan}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    const scrollTimer = setTimeout(scrollToPlan, 150);
    const clearTimer = setTimeout(() => setHighlightPlan(null), 3000);

    return () => {
      clearTimeout(scrollTimer);
      clearTimeout(clearTimer);
    };
  }, [location.search]);

  const loadAllData = async () => {
    try {
      const [profileData, subData, invData, useData, whatsappData] = await Promise.all([
        getProfile(),
        getSubscription().catch(() => null),
        getInvoices().catch(() => []),
        getUsage().catch(() => null),
        getWhatsAppStatus().catch(() => null)
      ]);

      setProfile(profileData);
      setEditName(profileData.name || '');
      if (subData) setSubscription(subData);
      setInvoices(invData);
      if (useData) setUsage(useData);
      if (whatsappData) setWhatsappStatus(whatsappData);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPortal = async () => {
    setActionLoading('portal');
    try {
      const { portalUrl } = await openBillingPortal();
      window.open(portalUrl, '_blank');
    } catch (err: any) {
      setError(err.message || 'Erro ao abrir portal');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelSubscription = async () => {
    setActionLoading('cancel');
    try {
      await cancelSubscription(false);
      await loadAllData();
      setShowCancelConfirm(false);
    } catch (err: any) {
      setError(err.message || 'Erro ao cancelar assinatura');
    } finally {
      setActionLoading(null);
    }
  };

  const openCheckout = (plan: typeof PLANS[0]) => {
    setCheckoutModal({
      isOpen: true,
      plan,
      interval: isYearly ? 'yearly' : 'monthly'
    });
  };

  const closeCheckout = () => {
    setCheckoutModal({ isOpen: false, plan: null, interval: 'yearly' });
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; dot: string; label: string }> = {
      active: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400', label: 'Ativo' },
      trialing: { bg: 'bg-purple-500/20', text: 'text-purple-400', dot: 'bg-purple-400', label: 'Trial' },
      canceled: { bg: 'bg-red-500/20', text: 'text-red-400', dot: 'bg-red-400', label: 'Cancelado' },
      past_due: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', dot: 'bg-yellow-400', label: 'Pendente' },
      inactive: { bg: 'bg-slate-500/20', text: 'text-slate-400', dot: 'bg-slate-400', label: 'Inativo' }
    };
    const c = config[status] || config.inactive;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
        {c.label}
      </span>
    );
  };

  const handleSaveName = async () => {
    if (!editName.trim() || editName === profile?.name) {
      setEditingName(false);
      return;
    }

    setSaving(true);
    try {
      await updateProfile({ name: editName });
      setProfile(prev => prev ? { ...prev, name: editName } : null);
      setEditingName(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  // Password change functions
  const resetPasswordModal = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setPasswordSuccess(false);
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const openPasswordModal = () => {
    resetPasswordModal();
    setShowPasswordModal(true);
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    resetPasswordModal();
  };

  const getPasswordStrength = (password: string): { level: number; label: string; color: string } => {
    if (!password) return { level: 0, label: '', color: '' };
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return { level: 1, label: 'Fraca', color: 'bg-red-500' };
    if (strength <= 3) return { level: 2, label: 'Média', color: 'bg-yellow-500' };
    if (strength <= 4) return { level: 3, label: 'Boa', color: 'bg-blue-500' };
    return { level: 4, label: 'Forte', color: 'bg-green-500' };
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Preencha todos os campos');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Nova senha deve ter no mínimo 6 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('As senhas não coincidem');
      return;
    }
    if (currentPassword === newPassword) {
      setPasswordError('Nova senha deve ser diferente da atual');
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess(true);
      await loadAllData();
      setTimeout(closePasswordModal, 2000);
    } catch (err: any) {
      setPasswordError(err.message || 'Erro ao alterar senha');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLanguageChange = async (lang: string) => {
    try {
      i18n.changeLanguage(lang);
      await updatePreferences({ language: lang as 'pt-BR' | 'en' | 'es-419' });
    } catch (err) {
      console.error('Erro ao mudar idioma:', err);
    }
  };

  const handleThemeChange = (theme: 'dark' | 'light') => {
    setTheme(theme);
    updatePreferences({ theme }).catch(console.error);
  };

  // Calcular data de membro
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
    : '';

  // Próximo plano sugerido
  const getUpgradeHint = () => {
    if (!usage || !subscription) return null;
    const currentLimit = usage.properties.limit;
    const used = usage.properties.used;
    const remaining = currentLimit - used;

    if (subscription.planId === 'starter' && remaining <= 1) {
      return { nextPlan: 'Pro', limit: 10 };
    }
    if (subscription.planId === 'pro' && remaining <= 2) {
      return { nextPlan: 'Agency', limit: 30 };
    }
    return null;
  };

  const upgradeHint = getUpgradeHint();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const cardClass = `rounded-2xl p-5 ${isDark ? 'bg-[#0B0C15] border border-white/10' : 'bg-white border border-slate-200 shadow-sm'}`;
  const labelClass = `text-xs font-medium uppercase tracking-wide ${isDark ? 'text-slate-500' : 'text-slate-400'}`;
  const valueClass = `text-sm ${isDark ? 'text-white' : 'text-slate-900'}`;
  const mutedClass = `text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`;

  return (
    <div className="space-y-4 max-w-lg mx-auto pb-8">
      {/* Error */}
      {error && (
        <div className={`p-3 rounded-xl text-sm flex items-center gap-2 ${isDark ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-red-50 border border-red-200 text-red-600'}`}>
          <AlertTriangle size={16} />
          {error}
          <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {/* Saved Toast */}
      {saved && (
        <div className={`p-3 rounded-xl text-sm flex items-center gap-2 ${isDark ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border border-emerald-200 text-emerald-600'}`}>
          <Check size={16} />
          Salvo com sucesso!
        </div>
      )}

      {/* ========== HEADER ========== */}
      <div className="text-center pt-4 pb-2">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-3xl font-bold text-white mb-3">
          {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>

        {editingName ? (
          <div className="flex items-center justify-center gap-2 mb-1">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className={`text-xl font-semibold text-center bg-transparent border-b-2 outline-none ${isDark ? 'border-blue-500 text-white' : 'border-blue-500 text-slate-900'}`}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
            />
            <button onClick={handleSaveName} disabled={saving} className="text-blue-500 p-1">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            </button>
            <button onClick={() => { setEditingName(false); setEditName(profile?.name || ''); }} className="text-slate-400 p-1">
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditingName(true)}
            className={`text-xl font-semibold flex items-center justify-center gap-2 mx-auto ${isDark ? 'text-white' : 'text-slate-900'}`}
          >
            {profile?.name || 'Usuário'}
            <Pencil size={14} className="text-slate-400" />
          </button>
        )}

        <p className={mutedClass}>
          Anfitrião desde {memberSince} · {usage?.properties.used || 0} imóveis
        </p>
      </div>

      {/* ========== CARD: CONTA ========== */}
      <div className={cardClass}>
        <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          <Mail size={16} className="text-blue-500" />
          Conta
        </h3>

        <div className="space-y-4">
          {/* Email */}
          <div>
            <p className={labelClass}>E-mail</p>
            <p className={valueClass}>{profile?.email}</p>
          </div>

          {/* WhatsApp */}
          <div className="flex items-center justify-between">
            <div>
              <p className={labelClass}>WhatsApp</p>
              {whatsappStatus?.connected ? (
                <div className="flex items-center gap-2">
                  <p className={valueClass}>{whatsappStatus.phone || 'Conectado'}</p>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" title="Online" />
                </div>
              ) : (
                <p className={mutedClass}>Não conectado</p>
              )}
            </div>
            {!whatsappStatus?.connected && onNavigateToWhatsApp && (
              <Button variant="secondary" size="sm" onClick={onNavigateToWhatsApp}>
                Conectar
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ========== CARD: PLANO ========== */}
      <div className={cardClass}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-sm font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <CreditCard size={16} className="text-blue-500" />
            Seu Plano
          </h3>
          {subscription?.hasStripeSubscription && (
            <Button variant="ghost" size="sm" onClick={handleOpenPortal} disabled={actionLoading === 'portal'}>
              {actionLoading === 'portal' ? <Loader2 size={14} className="animate-spin" /> : 'Gerenciar'}
            </Button>
          )}
        </div>

        {/* Plano atual */}
        <div className="flex items-center gap-3 mb-4">
          <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {subscription?.planName || 'Free'}
          </span>
          {subscription?.status && getStatusBadge(subscription.status)}
        </div>

        {/* Trial info */}
        {subscription?.trialEndsAt && subscription.status === 'trialing' && (
          <p className="text-sm text-purple-400 mb-3">
            Trial termina em {new Date(subscription.trialEndsAt).toLocaleDateString('pt-BR')}
          </p>
        )}

        {/* Barra de progresso */}
        {usage && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Imóveis</span>
              <span className={`text-xs font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {usage.properties.used} / {usage.properties.limit}
              </span>
            </div>
            <div className={`h-2.5 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}>
              <div
                className={`h-full rounded-full transition-all ${
                  usage.properties.percentage >= 90 ? 'bg-red-500' :
                  usage.properties.percentage >= 70 ? 'bg-yellow-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(usage.properties.percentage, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Upgrade hint */}
        {upgradeHint && (
          <div className={`p-3 rounded-xl mb-4 ${isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-100'}`}>
            <p className={`text-xs ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
              💡 Com o plano <strong>{upgradeHint.nextPlan}</strong> você terá até {upgradeHint.limit} imóveis
            </p>
          </div>
        )}

        {/* Toggle ver planos */}
        <button
          onClick={() => setShowPlans(!showPlans)}
          className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
            isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-50 hover:bg-slate-100'
          }`}
        >
          <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {showPlans ? 'Ocultar planos' : 'Ver todos os planos'}
          </span>
          <ChevronDown size={16} className={`transition-transform ${showPlans ? 'rotate-180' : ''} ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
        </button>

        {/* Planos expandidos */}
        {showPlans && (
          <div className="mt-4 space-y-3">
            {/* Toggle mensal/anual */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className={`text-sm ${!isYearly ? (isDark ? 'text-white' : 'text-slate-900') : 'text-slate-500'}`}>Mensal</span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className="relative w-12 h-6 rounded-full bg-blue-600 transition-colors"
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${isYearly ? 'translate-x-6' : ''}`} />
              </button>
              <span className={`text-sm ${isYearly ? (isDark ? 'text-white' : 'text-slate-900') : 'text-slate-500'}`}>Anual</span>
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">-27%</span>
            </div>

            {PLANS.map((plan) => {
              const isCurrentPlan = subscription?.planId === plan.id && subscription?.status === 'active';
              return (
                <div
                  key={plan.id}
                  id={`plan-card-${plan.id}`}
                  className={`relative p-4 rounded-xl border transition-all ${
                    plan.isPopular
                      ? 'border-blue-500/50 bg-blue-500/5'
                      : isDark
                        ? 'border-white/10 bg-[#050509]'
                        : 'border-slate-200 bg-slate-50'
                  } ${highlightPlan === plan.id ? 'ring-2 ring-blue-500' : ''}`}
                >
                  {plan.isPopular && (
                    <span className="absolute -top-2 left-4 px-2 py-0.5 text-[10px] font-medium bg-blue-600 text-white rounded-full">
                      Popular
                    </span>
                  )}

                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h4>
                    <div className="text-right">
                      <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        R${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                      </span>
                      <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>/mês</span>
                    </div>
                  </div>

                  {plan.hasTrial && !subscription?.hasStripeSubscription && (
                    <span className="inline-block mb-2 px-2 py-0.5 text-[10px] bg-purple-500/20 text-purple-400 rounded">
                      {plan.trialDays} dias grátis
                    </span>
                  )}

                  <ul className="space-y-1.5 mb-3">
                    {plan.features.slice(0, 4).map((f, i) => (
                      <li key={i} className={`flex items-start gap-2 text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        <Check className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                    {plan.features.length > 4 && (
                      <li className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        +{plan.features.length - 4} recursos
                      </li>
                    )}
                  </ul>

                  <Button
                    variant={isCurrentPlan ? 'secondary' : plan.isPopular ? 'primary' : 'secondary'}
                    className="w-full text-sm"
                    onClick={() => !isCurrentPlan && openCheckout(plan)}
                    disabled={isCurrentPlan}
                  >
                    {isCurrentPlan ? 'Plano Atual' : plan.hasTrial && !subscription?.hasStripeSubscription ? 'Começar Trial' : 'Assinar'}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========== CARD: PREFERÊNCIAS ========== */}
      <div className={cardClass}>
        <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          <Globe size={16} className="text-blue-500" />
          Preferências
        </h3>

        <div className="space-y-4">
          {/* Idioma */}
          <div className="flex items-center justify-between">
            <span className={mutedClass}>Idioma</span>
            <select
              value={i18n.language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className={`text-sm px-3 py-1.5 rounded-lg border outline-none ${
                isDark
                  ? 'bg-[#050509] border-white/10 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <option value="pt-BR">Português (BR)</option>
              <option value="en">English</option>
              <option value="es-419">Español</option>
            </select>
          </div>

          {/* Tema */}
          <div className="flex items-center justify-between">
            <span className={mutedClass}>Tema</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleThemeChange('light')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  !isDark
                    ? 'bg-blue-500 text-white'
                    : isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Claro
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  isDark
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                Escuro
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========== CARD: INTEGRAÇÕES ========== */}
      <div className={cardClass}>
        <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          <Link2 size={16} className="text-blue-500" />
          Integrações
        </h3>

        <div className="space-y-3">
          {/* Airbnb */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-[#FF5A5F]/10' : 'bg-[#FF5A5F]/10'}`}>
                <span className="text-[#FF5A5F] font-bold text-xs">Air</span>
              </div>
              <div>
                <p className={valueClass}>Airbnb</p>
                <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {integrations.airbnb} imóveis sincronizados
                </p>
              </div>
            </div>
            {integrations.airbnb > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </div>

          {/* Booking */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-[#003580]/10' : 'bg-[#003580]/10'}`}>
                <span className="text-[#003580] font-bold text-xs">B.</span>
              </div>
              <div>
                <p className={valueClass}>Booking.com</p>
                <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {integrations.booking} imóveis sincronizados
                </p>
              </div>
            </div>
            {integrations.booking > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </div>
        </div>
      </div>

      {/* ========== CARD: SEGURANÇA ========== */}
      <div className={cardClass}>
        <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          <Lock size={16} className="text-blue-500" />
          Segurança
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <p className={valueClass}>Senha</p>
            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              {profile?.passwordChangedAt
                ? `Alterada em ${new Date(profile.passwordChangedAt).toLocaleDateString('pt-BR')}`
                : 'Nunca alterada'}
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={openPasswordModal}>
            Alterar
          </Button>
        </div>
      </div>

      {/* ========== FOOTER LINKS ========== */}
      <div className={`${cardClass} space-y-0`}>
        <a
          href="https://mevo.com.br/ajuda"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-between p-3 -mx-5 px-5 transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}
        >
          <span className={`flex items-center gap-3 ${mutedClass}`}>
            <HelpCircle size={18} />
            Central de ajuda
          </span>
          <ChevronRight size={16} className="text-slate-400" />
        </a>

        <a
          href="https://wa.me/5511999999999"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-between p-3 -mx-5 px-5 transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}
        >
          <span className={`flex items-center gap-3 ${mutedClass}`}>
            <Headphones size={18} />
            Falar com suporte
          </span>
          <ChevronRight size={16} className="text-slate-400" />
        </a>

        <div className={`border-t ${isDark ? 'border-white/10' : 'border-slate-200'} my-2`} />

        <button
          onClick={onLogout}
          className={`flex items-center justify-between p-3 -mx-5 px-5 w-[calc(100%+2.5rem)] transition-colors text-red-400 ${isDark ? 'hover:bg-red-500/10' : 'hover:bg-red-50'}`}
        >
          <span className="flex items-center gap-3">
            <LogOut size={18} />
            Sair da conta
          </span>
        </button>
      </div>

      {/* Cancelar assinatura - discreto */}
      {subscription?.hasStripeSubscription && subscription.status !== 'canceled' && (
        <div className="text-center pt-4">
          {!showCancelConfirm ? (
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="text-xs text-slate-500 hover:text-red-400 transition-colors"
            >
              Cancelar assinatura
            </button>
          ) : (
            <div className={`p-4 rounded-xl ${isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'}`}>
              <p className={`text-sm mb-3 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                Tem certeza? Você perderá acesso às funcionalidades premium.
              </p>
              <div className="flex gap-2 justify-center">
                <Button
                  variant="secondary"
                  size="sm"
                  className="border-red-500/30 text-red-400"
                  onClick={handleCancelSubscription}
                  disabled={actionLoading === 'cancel'}
                >
                  {actionLoading === 'cancel' ? <Loader2 size={14} className="animate-spin" /> : 'Confirmar'}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowCancelConfirm(false)}>
                  Manter
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========== MODALS ========== */}

      {/* Checkout Modal */}
      {checkoutModal.plan && (
        <CheckoutModal
          isOpen={checkoutModal.isOpen}
          onClose={closeCheckout}
          plan={checkoutModal.plan}
          interval={checkoutModal.interval}
        />
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closePasswordModal} />

          <div className={`relative w-full max-w-sm rounded-2xl shadow-2xl ${isDark ? 'bg-[#0B0C15] border border-white/10' : 'bg-white'}`}>
            <div className={`flex items-center justify-between p-5 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Alterar Senha</h3>
              <button onClick={closePasswordModal} className="text-slate-400 hover:text-slate-300">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="p-5 space-y-4">
              {passwordError && (
                <div className="p-3 rounded-xl text-sm flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400">
                  <AlertTriangle size={16} />
                  {passwordError}
                </div>
              )}

              {passwordSuccess ? (
                <div className="p-3 rounded-xl text-sm flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Check size={16} />
                  Senha alterada com sucesso!
                </div>
              ) : (
                <>
                  {/* Current Password */}
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Senha atual
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className={`w-full px-4 py-2.5 pr-10 rounded-xl border ${
                          isDark ? 'bg-[#050509] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500/40`}
                        placeholder="Senha atual"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                      >
                        {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Nova senha
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={`w-full px-4 py-2.5 pr-10 rounded-xl border ${
                          isDark ? 'bg-[#050509] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500/40`}
                        placeholder="Nova senha"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {newPassword && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className={`flex-1 h-1.5 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'} overflow-hidden`}>
                          <div
                            className={`h-full ${getPasswordStrength(newPassword).color}`}
                            style={{ width: `${getPasswordStrength(newPassword).level * 25}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-400">{getPasswordStrength(newPassword).label}</span>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Confirmar senha
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full px-4 py-2.5 pr-10 rounded-xl border ${
                          isDark ? 'bg-[#050509] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500/40`}
                        placeholder="Confirme a senha"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {confirmPassword && (
                      <p className={`mt-1.5 text-xs flex items-center gap-1 ${newPassword === confirmPassword ? 'text-emerald-400' : 'text-red-400'}`}>
                        {newPassword === confirmPassword ? <Check size={12} /> : <X size={12} />}
                        {newPassword === confirmPassword ? 'Senhas coincidem' : 'Senhas não coincidem'}
                      </p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={passwordLoading}>
                    {passwordLoading ? <><Loader2 size={16} className="animate-spin mr-2" />Alterando...</> : 'Alterar Senha'}
                  </Button>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileTab;
