import React, { useState, useEffect } from 'react';
import { CreditCard, Download, ExternalLink, AlertTriangle, Check, Loader2, Sparkles } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';
import { CheckoutModal } from '../billing/CheckoutModal';
import {
  getSubscription,
  getInvoices,
  getUsage,
  openBillingPortal,
  cancelSubscription,
  Subscription,
  Invoice,
  UsageStats
} from '../../lib/api';

// Planos disponíveis
const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 67,
    yearlyPrice: 49,
    propertyLimit: 3,
    features: ['Até 3 propriedades', 'Sync iCal', 'Automações básicas', 'Integração WhatsApp'],
    hasTrial: false
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 197,
    yearlyPrice: 149,
    propertyLimit: 10,
    features: ['Até 10 propriedades', 'Tudo do Starter', 'Webhooks', 'Suporte prioritário'],
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
    features: ['Até 30 propriedades', 'Tudo do Pro', 'Multi-usuários', 'API completa'],
    hasTrial: false
  }
];

export const BillingTab: React.FC = () => {
  const location = useLocation();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isYearly, setIsYearly] = useState(true);
  const [highlightPlan, setHighlightPlan] = useState<string | null>(null);
  const [checkoutModal, setCheckoutModal] = useState<{ isOpen: boolean; plan: typeof PLANS[0] | null; interval: 'monthly' | 'yearly' }>({
    isOpen: false,
    plan: null,
    interval: 'yearly'
  });

  useEffect(() => {
    loadData();
  }, []);

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

  const loadData = async () => {
    try {
      const [sub, inv, use] = await Promise.all([
        getSubscription(),
        getInvoices(),
        getUsage()
      ]);
      setSubscription(sub);
      setInvoices(inv);
      setUsage(use);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados de assinatura');
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
      await loadData();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {/* Current Plan */}
      <div className="bg-[#0B0C15] border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Seu Plano</h3>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-white">{subscription?.planName || 'Starter'}</span>
              {getStatusBadge(subscription?.status || 'inactive')}
            </div>
          </div>
          {subscription?.hasStripeSubscription && (
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
          )}
        </div>

        {subscription?.currentPeriodEnd && (
          <p className="text-sm text-slate-400">
            {subscription.cancelAtPeriodEnd
              ? `Acesso até ${new Date(subscription.currentPeriodEnd).toLocaleDateString('pt-BR')}`
              : `Renova em ${new Date(subscription.currentPeriodEnd).toLocaleDateString('pt-BR')}`}
          </p>
        )}

        {subscription?.trialEndsAt && subscription.status === 'trialing' && (
          <p className="text-sm text-purple-400 mt-2">
            Trial termina em {new Date(subscription.trialEndsAt).toLocaleDateString('pt-BR')}
          </p>
        )}
      </div>

      {/* Usage */}
      {usage && (
        <div className="bg-[#0B0C15] border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Uso Atual</h3>

          {/* Properties Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Propriedades</span>
              <span className="text-sm text-white">{usage.properties.used} / {usage.properties.limit}</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  usage.properties.percentage >= 90 ? 'bg-red-500' :
                  usage.properties.percentage >= 70 ? 'bg-yellow-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(usage.properties.percentage, 100)}%` }}
              />
            </div>
            {usage.properties.percentage >= 90 && (
              <p className="text-xs text-yellow-400 mt-2 flex items-center gap-1">
                <AlertTriangle size={12} />
                Você está quase no limite. Considere fazer upgrade.
              </p>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#050509] rounded-lg p-4">
              <p className="text-2xl font-bold text-white">{usage.reservationsThisMonth}</p>
              <p className="text-sm text-slate-400">Reservas este mês</p>
            </div>
            <div className="bg-[#050509] rounded-lg p-4">
              <p className="text-2xl font-bold text-white">{usage.messagesThisMonth}</p>
              <p className="text-sm text-slate-400">Mensagens enviadas</p>
            </div>
          </div>
        </div>
      )}

      {/* Invoices */}
      <div className="bg-[#0B0C15] border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Histórico de Faturas</h3>

        {invoices.length === 0 ? (
          <p className="text-slate-400 text-sm">Nenhuma fatura encontrada.</p>
        ) : (
          <div className="space-y-3">
            {invoices.slice(0, 6).map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 bg-[#050509] rounded-lg"
              >
                <div>
                  <p className="text-white font-medium">{invoice.amountFormatted}</p>
                  <p className="text-sm text-slate-400">
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
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      <Download size={16} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Subscription */}
      {subscription?.hasStripeSubscription && subscription.status !== 'canceled' && (
        <div className="bg-[#0B0C15] border border-red-500/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Cancelar Assinatura</h3>
          <p className="text-sm text-slate-400 mb-4">
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
            <div className="bg-red-500/10 rounded-lg p-4">
              <p className="text-sm text-red-400 mb-4">
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

      {/* Upgrade / Choose Plan Section */}
      {(!subscription?.hasStripeSubscription || subscription?.status === 'canceled') && (
        <div className="bg-[#0B0C15] border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Escolha seu Plano</h3>
          </div>
          <p className="text-sm text-slate-400 mb-6">
            Desbloqueie todo o potencial do Mevo com um plano premium.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className={`text-sm ${!isYearly ? 'text-white' : 'text-slate-500'}`}>Mensal</span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="relative w-11 h-6 rounded-full bg-blue-600 transition-colors"
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${isYearly ? 'translate-x-5' : ''}`} />
            </button>
            <span className={`text-sm ${isYearly ? 'text-white' : 'text-slate-500'}`}>Anual</span>
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">-27%</span>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                id={`plan-card-${plan.id}`}
                className={`relative p-4 rounded-xl border transition-all ${
                  plan.isPopular
                    ? 'border-blue-500/50 bg-blue-500/5'
                    : 'border-white/10 bg-[#050509]'
                } ${highlightPlan === plan.id ? 'ring-2 ring-blue-500/70 shadow-[0_0_0_4px_rgba(59,130,246,0.15)] scale-[1.01]' : ''}`}
              >
                {plan.isPopular && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 text-xs font-medium bg-blue-600 text-white rounded-full">
                    Popular
                  </span>
                )}
                <h4 className="text-white font-semibold mb-1">{plan.name}</h4>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-2xl font-bold text-white">
                    R${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-slate-400 text-sm">/mês</span>
                </div>
                {plan.hasTrial && (
                  <span className="inline-block mb-3 px-2 py-0.5 text-xs bg-purple-500/20 text-purple-400 rounded">
                    {plan.trialDays} dias grátis
                  </span>
                )}
                <ul className="space-y-1.5 mb-4">
                  {plan.features.slice(0, 3).map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-slate-400">
                      <Check className="w-3 h-3 text-green-400" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.isPopular ? 'primary' : 'secondary'}
                  className="w-full text-sm"
                  onClick={() => openCheckout(plan)}
                >
                  {plan.hasTrial ? 'Começar Trial' : 'Assinar'}
                </Button>
              </div>
            ))}
          </div>
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

export default BillingTab;
