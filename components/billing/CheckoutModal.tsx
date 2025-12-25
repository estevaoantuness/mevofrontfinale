import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Loader2, CreditCard, Mail, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { createCheckout, getVerificationStatus, sendVerificationEmail, activateTrial } from '../../lib/api';

interface Plan {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  hasTrial?: boolean;
  trialDays?: number;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan;
  interval: 'monthly' | 'yearly';
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  plan,
  interval
}) => {
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState('');
  const [trialSuccess, setTrialSuccess] = useState(false);

  // Email verification state
  const [checkingEmail, setCheckingEmail] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  // Check email verification status when modal opens
  useEffect(() => {
    if (isOpen) {
      checkEmailVerification();
    }
  }, [isOpen]);

  const checkEmailVerification = async () => {
    setCheckingEmail(true);
    try {
      const status = await getVerificationStatus();
      setEmailVerified(status.verified);
    } catch (err) {
      console.error('Error checking email verification:', err);
      setEmailVerified(false);
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleSendVerification = async () => {
    setSendingVerification(true);
    setError('');
    try {
      await sendVerificationEmail();
      setVerificationSent(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar email de verificação');
    } finally {
      setSendingVerification(false);
    }
  };

  if (!isOpen) return null;

  const price = interval === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;

  const handleCheckout = async () => {
    // Double-check email verification before proceeding
    if (!emailVerified) {
      setError('Você precisa verificar seu email antes de continuar');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // If plan has trial, activate trial directly (no Stripe)
      if (plan.hasTrial) {
        const result = await activateTrial();
        if (result.success) {
          setTrialSuccess(true);
          // Close modal after 2 seconds
          setTimeout(() => {
            onClose();
            window.location.reload(); // Refresh to show updated subscription
          }, 2000);
        }
      } else {
        // No trial - go to Stripe checkout
        const { checkoutUrl } = await createCheckout(plan.id, interval);
        setRedirecting(true);
        setTimeout(() => {
          window.location.href = checkoutUrl;
        }, 800);
      }
    } catch (err: any) {
      const errorCode = err.code || err.response?.data?.code;
      if (errorCode === 'EMAIL_NOT_VERIFIED') {
        setEmailVerified(false);
        setError('Você precisa verificar seu email antes de continuar');
      } else {
        setError(err.message || 'Erro ao iniciar pagamento');
      }
      setLoading(false);
    }
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-md bg-[#0B0C15] border border-white/10 rounded-2xl p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-white mb-2">
            Assinar {plan.name}
          </h3>
          <p className="text-slate-400">
            {interval === 'yearly' ? 'Plano anual' : 'Plano mensal'}
          </p>
        </div>

        {/* Price Summary */}
        <div className="bg-[#050509] rounded-xl p-6 mb-6">
          <div className="flex items-baseline justify-center gap-1 mb-2">
            <span className="text-slate-400 text-lg">R$</span>
            <span className="text-4xl font-bold text-white">{price}</span>
            <span className="text-slate-400">/mês</span>
          </div>
          {plan.hasTrial && (
            <div className="mt-4 text-center">
              <span className="inline-block px-3 py-1.5 text-sm font-medium bg-purple-500/20 text-purple-400 rounded-lg">
                {plan.trialDays} dias grátis
              </span>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mb-8">
          <p className="text-sm text-slate-400 mb-3">Inclui:</p>
          <ul className="space-y-2">
            {plan.features.slice(0, 4).map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-slate-300">
                <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {checkingEmail ? (
            <div className="flex items-center justify-center py-3">
              <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
            </div>
          ) : !emailVerified ? (
            // Email not verified - show verification button
            <>
              {!verificationSent ? (
                <Button
                  variant="primary"
                  className="w-full bg-yellow-600 hover:bg-yellow-500"
                  onClick={handleSendVerification}
                  disabled={sendingVerification}
                >
                  {sendingVerification ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Email não verificado - Clique para verificar
                    </>
                  )}
                </Button>
              ) : (
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
                  <Mail className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-green-400 font-medium">Email enviado!</p>
                  <p className="text-sm text-slate-400 mt-1">
                    Verifique sua caixa de entrada e clique no link de confirmação.
                  </p>
                  <button
                    onClick={() => {
                      setVerificationSent(false);
                      checkEmailVerification();
                    }}
                    className="mt-3 text-sm text-blue-400 hover:text-blue-300"
                  >
                    Já verifiquei, continuar
                  </button>
                </div>
              )}
            </>
          ) : (
            // Email verified - show checkout button
            <Button
              variant="primary"
              className="w-full"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Redirecionando...
                </>
              ) : plan.hasTrial ? (
                'Começar Trial Grátis'
              ) : (
                'Ir para Pagamento'
              )}
            </Button>
          )}
          <button
            onClick={onClose}
            className="w-full py-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            Cancelar
          </button>
        </div>

        {/* Secure Badge */}
        <p className="mt-6 text-center text-xs text-slate-500">
          Pagamento seguro via Stripe. Cancele quando quiser.
        </p>
      </motion.div>
    </div>
  );
};

export default CheckoutModal;
