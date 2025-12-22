import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Check, Crown, ArrowRight, CreditCard } from 'lucide-react';
import { Button } from '../ui/Button';
import { createCheckout } from '../../lib/api';

interface SubscriptionRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason: 'no_subscription' | 'limit_reached';
  currentPlan?: string;
  currentLimit?: number;
  propertyCount?: number;
  onSuccess?: () => void;
}

export const SubscriptionRequiredModal: React.FC<SubscriptionRequiredModalProps> = ({
  isOpen,
  onClose,
  reason,
  currentPlan,
  currentLimit,
  propertyCount,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const isLimitReached = reason === 'limit_reached';

  const handleStartTrial = async () => {
    setLoading(true);
    try {
      const { checkoutUrl } = await createCheckout('pro', 'monthly');
      setRedirecting(true);
      setTimeout(() => {
        window.location.href = checkoutUrl;
      }, 800);
    } catch (err) {
      setLoading(false);
      alert('Erro ao iniciar checkout. Tente novamente.');
    }
  };

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      // Determinar próximo plano baseado no atual
      const nextPlan = currentPlan === 'starter' ? 'pro' : 'agency';
      const { checkoutUrl } = await createCheckout(nextPlan, 'monthly');
      setRedirecting(true);
      setTimeout(() => {
        window.location.href = checkoutUrl;
      }, 800);
    } catch (err) {
      setLoading(false);
      alert('Erro ao iniciar checkout. Tente novamente.');
    }
  };

  if (!isOpen) return null;

  // Full-screen redirect overlay
  if (redirecting) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-gradient-to-br from-[#050509] via-blue-900/30 to-[#050509]"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center space-y-4"
        >
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
            <CreditCard className="absolute inset-0 m-auto w-6 h-6 text-blue-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">Redirecionando para pagamento</h3>
            <p className="text-sm text-slate-400">Você será redirecionado para o Stripe...</p>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-gradient-to-b from-[#0B0C15] to-[#050509] border border-white/10 rounded-2xl p-8 shadow-2xl overflow-hidden"
        >
          {/* Glow effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-10"
          >
            <X size={20} />
          </button>

          {/* Content */}
          <div className="relative z-10">
            {/* Icon */}
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
              {isLimitReached ? (
                <Crown className="w-8 h-8 text-white" />
              ) : (
                <Sparkles className="w-8 h-8 text-white" />
              )}
            </div>

            {/* Title & Description */}
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-3">
                {isLimitReached
                  ? 'Limite de imóveis atingido'
                  : 'Comece seu trial gratuito'}
              </h3>
              <p className="text-slate-400">
                {isLimitReached
                  ? `Você atingiu o limite de ${currentLimit} imóveis do plano ${currentPlan === 'starter' ? 'Starter' : currentPlan === 'pro' ? 'Pro' : 'Agency'}. Faça upgrade para adicionar mais.`
                  : 'Para criar imóveis e automatizar suas operações, experimente o Mevo gratuitamente por 10 dias.'}
              </p>
            </div>

            {/* Features */}
            <div className="bg-[#050509]/50 rounded-xl p-5 mb-6">
              <p className="text-sm text-slate-400 mb-3">
                {isLimitReached ? 'No próximo plano você terá:' : 'Com o trial você terá acesso a:'}
              </p>
              <ul className="space-y-2">
                {(isLimitReached ? [
                  currentPlan === 'starter' ? 'Até 10 imóveis' : 'Até 30 imóveis',
                  'Webhooks para integrações',
                  'Suporte prioritário',
                  'Logs completos'
                ] : [
                  '10 dias grátis sem compromisso',
                  'Até 10 imóveis cadastrados',
                  'Automações de check-in/checkout',
                  'Integração WhatsApp + iCal'
                ]).map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="space-y-3">
              <Button
                variant="primary"
                className="w-full h-12 text-base"
                onClick={isLimitReached ? handleUpgrade : handleStartTrial}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {isLimitReached ? 'Fazer Upgrade' : 'Começar Trial Grátis'}
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>

              <button
                onClick={onClose}
                className="w-full py-2 text-sm text-slate-500 hover:text-slate-300 transition-colors"
              >
                Agora não
              </button>
            </div>

            {/* Footer */}
            <p className="mt-6 text-center text-xs text-slate-600">
              {isLimitReached
                ? 'Cancele quando quiser. Seus dados ficam salvos.'
                : 'Sem cartão de crédito. Cancele quando quiser.'}
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SubscriptionRequiredModal;
