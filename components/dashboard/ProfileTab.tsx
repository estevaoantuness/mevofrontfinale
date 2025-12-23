import React, { useState, useEffect, useCallback } from 'react';
import { Mail, Calendar, Loader2, AlertTriangle, Check, CreditCard, Download, ChevronDown, Sparkles } from 'lucide-react';
import { useLocation } from 'react-router-dom';
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
  Subscription,
  Invoice,
  UsageStats
} from '../../lib/api';
import { useTheme } from '../../lib/ThemeContext';

// Planos disponíveis com features slim e completas
const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 67,
    yearlyPrice: 49,
    propertyLimit: 3,
    featuresSlim: ['Até 3 propriedades', 'Sync iCal', 'Integração WhatsApp', 'Templates'],
    features: ['Até 3 propriedades', 'Sync iCal (Airbnb/Booking/VRBO)', 'Avisos de checkout automáticos', 'Integração WhatsApp', 'Templates com placeholders', '1 usuário', 'Suporte por email'],
    hasTrial: false
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 197,
    yearlyPrice: 149,
    propertyLimit: 10,
    featuresSlim: ['Até 10 propriedades', 'Tudo do Starter', 'Calculadora de Preços IA', 'Suporte prioritário'],
    features: ['Até 10 propriedades', 'Tudo do Starter', 'Calculadora de Preços com IA', 'Multi-canais iCal avançados', 'Webhooks para integrações', 'Prioridade de execução', 'Suporte prioritário'],
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
    featuresSlim: ['Até 30 propriedades', 'Tudo do Pro', 'Maya IA (em breve)', 'Multi-usuários'],
    features: ['Até 30 propriedades', 'Tudo do Pro', 'Maya - Consultora IA (em breve)', 'Múltiplos usuários e permissões', 'Relatórios avançados', 'Gerente de conta dedicado'],
    hasTrial: false
  }
];

interface ProfileTabProps {
  onLogout: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({ onLogout }) => {
  const { isDark } = useTheme();
  const location = useLocation();

  // Profile states
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Subscription states
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isYearly, setIsYearly] = useState(true);
  const [showFullFeatures, setShowFullFeatures] = useState(false);
  const [highlightPlan, setHighlightPlan] = useState<string | null>(null);
  const [checkoutModal, setCheckoutModal] = useState<{ isOpen: boolean; plan: typeof PLANS[0] | null; interval: 'monthly' | 'yearly' }>({
    isOpen: false,
    plan: null,
    interval: 'yearly'
  });

  useEffect(() => {
    loadAllData();
  }, []);

  // Handle URL params for plan highlight
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const plan = params.get('plan');
    if (!plan || !['starter', 'pro', 'agency'].includes(plan)) return;

    setHighlightPlan(plan);
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
      const [profileData, subData, invData, useData] = await Promise.all([
        getProfile(),
        getSubscription().catch(() => null),
        getInvoices().catch(() => []),
        getUsage().catch(() => null)
      ]);

      setProfile(profileData);
      setName(profileData.name || '');
      setPhone(profileData.phone || '');
      if (subData) setSubscription(subData);
      setInvoices(invData);
      if (useData) setUsage(useData);
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
    const styles: Record<string, string> = {
      active: 'bg-green-500/20 text-green-400',
      trialing: 'bg-purple-500/20 text-purple-400',
      canceled: 'bg-red-500/20 text-red-400',
      past_due: 'bg-yellow-500/20 text-yellow-400',
      inactive: 'bg-slate-500/20 text-slate-400'
    };
    const labels: Record<string, string> = {
      active: 'Ativo',
      trialing: 'Trial',
      canceled: 'Cancelado',
      past_due: 'Pagamento pendente',
      inactive: 'Inativo'
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || styles.inactive}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${status === 'active' ? 'bg-green-400' : status === 'trialing' ? 'bg-purple-400' : 'bg-slate-400'}`}></span>
        {labels[status] || status}
      </span>
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError('');

    try {
      const updated = await updateProfile({ name, phone: phone || undefined });
      setProfile(prev => prev ? { ...prev, ...updated } : null);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Error */}
      {error && (
        <div className={`p-4 rounded-lg text-sm flex items-center gap-2 ${isDark ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-red-50 border border-red-200 text-red-600'}`}>
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {/* Profile Info */}
      <div className={`rounded-xl p-6 ${isDark ? 'bg-[#0B0C15] border border-white/10' : 'bg-white border border-slate-200 shadow-sm'}`}>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-2xl font-bold text-white">
            {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{profile?.name || 'Usuário'}</h3>
            <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>{profile?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
            />
            <Input
              label="Telefone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="flex items-center gap-4">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
            {saved && (
              <span className="text-sm text-green-400 flex items-center gap-1">
                <Check size={16} />
                Salvo!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Account Info */}
      <div className={`rounded-xl p-6 ${isDark ? 'bg-[#0B0C15] border border-white/10' : 'bg-white border border-slate-200 shadow-sm'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Informações da Conta</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={`flex items-center gap-3 p-4 rounded-lg ${isDark ? 'bg-[#050509]' : 'bg-slate-50'}`}>
            <Mail className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            <div>
              <p className="text-xs text-slate-500">Email</p>
              <p className={isDark ? 'text-white' : 'text-slate-900'}>{profile?.email}</p>
            </div>
          </div>

          <div className={`flex items-center gap-3 p-4 rounded-lg ${isDark ? 'bg-[#050509]' : 'bg-slate-50'}`}>
            <Calendar className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            <div>
              <p className="text-xs text-slate-500">Membro desde</p>
              <p className={isDark ? 'text-white' : 'text-slate-900'}>
                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString('pt-BR', {
                      month: 'long',
                      year: 'numeric'
                    })
                  : '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================ */}
      {/* SUBSCRIPTION SECTION */}
      {/* ================================================ */}

      {/* Current Plan Header */}
      {subscription?.hasStripeSubscription && (
        <div className={`rounded-xl p-6 ${isDark ? 'bg-[#0B0C15] border border-white/10' : 'bg-white border border-slate-200 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Seu Plano</h3>
              <div className="flex items-center gap-3">
                <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{subscription?.planName || 'Starter'}</span>
                {getStatusBadge(subscription?.status || 'inactive')}
              </div>
            </div>
            <Button variant="secondary" onClick={handleOpenPortal} disabled={actionLoading === 'portal'}>
              {actionLoading === 'portal' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Gerenciar
                </>
              )}
            </Button>
          </div>

          {subscription?.trialEndsAt && subscription.status === 'trialing' && (
            <p className="text-sm text-purple-400 mt-2">
              Trial termina em {new Date(subscription.trialEndsAt).toLocaleDateString('pt-BR')}
            </p>
          )}
        </div>
      )}

      {/* Usage Stats */}
      {usage && subscription?.hasStripeSubscription && (
        <div className={`rounded-xl p-6 ${isDark ? 'bg-[#0B0C15] border border-white/10' : 'bg-white border border-slate-200 shadow-sm'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Uso Atual</h3>

          {/* Properties Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Propriedades</span>
              <span className={`text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{usage.properties.used} / {usage.properties.limit}</span>
            </div>
            <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
              <div
                className={`h-full rounded-full transition-all ${
                  usage.properties.percentage >= 90 ? 'bg-red-500' :
                  usage.properties.percentage >= 70 ? 'bg-yellow-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(usage.properties.percentage, 100)}%` }}
              />
            </div>
            {usage.properties.percentage >= 90 && (
              <p className={`text-xs mt-2 flex items-center gap-1 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                <AlertTriangle size={12} />
                Você está quase no limite. Considere fazer upgrade.
              </p>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`rounded-lg p-4 ${isDark ? 'bg-[#050509]' : 'bg-slate-50'}`}>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{usage.reservationsThisMonth}</p>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Reservas este mês</p>
            </div>
            <div className={`rounded-lg p-4 ${isDark ? 'bg-[#050509]' : 'bg-slate-50'}`}>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{usage.messagesThisMonth}</p>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Mensagens enviadas</p>
            </div>
          </div>
        </div>
      )}

      {/* Meu Plano - Plan Selection */}
      <div id="subscription-plans" className={`rounded-xl p-6 ${isDark ? 'bg-[#0B0C15] border border-white/10' : 'bg-white border border-slate-200 shadow-sm'}`}>
        {/* Header with toggles */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Meu Plano</h3>
          </div>

          <div className="flex items-center gap-4">
            {/* Ver mais toggle */}
            <button
              onClick={() => setShowFullFeatures(!showFullFeatures)}
              className={`text-sm flex items-center gap-1 transition-colors ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
            >
              {showFullFeatures ? 'Ver menos' : 'Ver mais'}
              <ChevronDown className={`w-4 h-4 transition-transform ${showFullFeatures ? 'rotate-180' : ''}`} />
            </button>

            {/* Billing Toggle */}
            <div className="flex items-center gap-2">
              <span className={`text-sm ${!isYearly ? (isDark ? 'text-white' : 'text-slate-900') : 'text-slate-500'}`}>Mensal</span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className="relative w-11 h-6 rounded-full bg-blue-600 transition-colors"
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${isYearly ? 'translate-x-5' : ''}`} />
              </button>
              <span className={`text-sm ${isYearly ? (isDark ? 'text-white' : 'text-slate-900') : 'text-slate-500'}`}>Anual</span>
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">-27%</span>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((plan) => {
            const isCurrentPlan = subscription?.planId === plan.id && subscription?.status === 'active';
            const featuresToShow = showFullFeatures ? plan.features : plan.featuresSlim;

            return (
              <div
                key={plan.id}
                id={`plan-card-${plan.id}`}
                className={`relative p-5 rounded-xl border transition-all ${
                  plan.isPopular
                    ? 'border-blue-500/50 bg-blue-500/5'
                    : isDark
                      ? 'border-white/10 bg-[#050509]'
                      : 'border-slate-200 bg-slate-50'
                } ${highlightPlan === plan.id ? 'ring-2 ring-blue-500/70 shadow-[0_0_0_4px_rgba(59,130,246,0.15)] scale-[1.01]' : ''}`}
              >
                {plan.isPopular && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 text-xs font-medium bg-blue-600 text-white rounded-full">
                    Popular
                  </span>
                )}

                <h4 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h4>

                <div className="flex items-baseline gap-1 mb-3">
                  <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    R${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>/mês</span>
                </div>

                {plan.hasTrial && !subscription?.hasStripeSubscription && (
                  <span className="inline-block mb-3 px-2 py-0.5 text-xs bg-purple-500/20 text-purple-400 rounded">
                    {plan.trialDays} dias grátis
                  </span>
                )}

                <ul className={`space-y-2 mb-4 transition-all ${showFullFeatures ? 'min-h-[180px]' : 'min-h-[100px]'}`}>
                  {featuresToShow.map((f, i) => (
                    <li key={i} className={`flex items-start gap-2 text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      <Check className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
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
      </div>

      {/* Invoices */}
      {invoices.length > 0 && (
        <div className={`rounded-xl p-6 ${isDark ? 'bg-[#0B0C15] border border-white/10' : 'bg-white border border-slate-200 shadow-sm'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Histórico de Faturas</h3>

          <div className="space-y-3">
            {invoices.slice(0, 6).map((invoice) => (
              <div
                key={invoice.id}
                className={`flex items-center justify-between p-4 rounded-lg ${isDark ? 'bg-[#050509]' : 'bg-slate-50'}`}
              >
                <div>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{invoice.amountFormatted}</p>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {new Date(invoice.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    invoice.status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {invoice.status === 'paid' ? 'Pago' : 'Pendente'}
                  </span>
                  {invoice.invoicePdf && (
                    <a
                      href={invoice.invoicePdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                      <Download size={16} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cancel Subscription */}
      {subscription?.hasStripeSubscription && subscription.status !== 'canceled' && (
        <div className={`rounded-xl p-6 ${isDark ? 'bg-[#0B0C15] border border-red-500/20' : 'bg-white border border-red-200 shadow-sm'}`}>
          <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Cancelar Assinatura</h3>
          <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Você pode cancelar a qualquer momento. O acesso continua até o fim do período pago.
          </p>

          {!showCancelConfirm ? (
            <Button
              variant="secondary"
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              onClick={() => setShowCancelConfirm(true)}
            >
              Cancelar Assinatura
            </Button>
          ) : (
            <div className={`rounded-lg p-4 ${isDark ? 'bg-red-500/10' : 'bg-red-50'}`}>
              <p className={`text-sm mb-4 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                Tem certeza? Você perderá acesso às funcionalidades premium ao final do período.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  onClick={handleCancelSubscription}
                  disabled={actionLoading === 'cancel'}
                >
                  {actionLoading === 'cancel' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Sim, cancelar'
                  )}
                </Button>
                <Button variant="ghost" onClick={() => setShowCancelConfirm(false)}>
                  Manter assinatura
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Checkout Modal */}
      {checkoutModal.plan && (
        <CheckoutModal
          isOpen={checkoutModal.isOpen}
          onClose={closeCheckout}
          plan={checkoutModal.plan}
          interval={checkoutModal.interval}
        />
      )}
    </div>
  );
};

export default ProfileTab;
