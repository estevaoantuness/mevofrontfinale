import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { sendVerificationEmail } from '../../lib/api';

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  onEmailSent?: () => void;
}

export const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  isOpen,
  onClose,
  userEmail,
  onEmailSent
}) => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSendEmail = async () => {
    setLoading(true);
    setError('');
    try {
      await sendVerificationEmail();
      setSent(true);
      onEmailSent?.();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao enviar email. Tente novamente.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSent(false);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-gradient-to-b from-[#0B0C15] to-[#050509] border border-white/10 rounded-2xl p-8 shadow-2xl overflow-hidden"
        >
          {/* Glow effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-10"
          >
            <X size={20} />
          </button>

          {/* Content */}
          <div className="relative z-10">
            {/* Icon */}
            <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center ${
              sent ? 'bg-gradient-to-br from-green-600 to-emerald-500' : 'bg-gradient-to-br from-blue-600 to-cyan-500'
            }`}>
              {sent ? (
                <CheckCircle className="w-8 h-8 text-white" />
              ) : (
                <Mail className="w-8 h-8 text-white" />
              )}
            </div>

            {/* Title & Description */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-3">
                {sent ? 'Email enviado!' : 'Confirme seu email'}
              </h3>
              <p className="text-slate-400">
                {sent
                  ? 'Verifique sua caixa de entrada e clique no link de confirmação.'
                  : 'Para continuar, confirme seu email. Enviaremos um link de verificação.'}
              </p>
            </div>

            {/* Email Display */}
            <div className="bg-[#050509]/50 rounded-xl p-4 mb-6">
              <p className="text-sm text-slate-400 mb-1">Enviaremos para:</p>
              <p className="text-white font-medium">{userEmail}</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* CTA */}
            <div className="space-y-3">
              {!sent ? (
                <Button
                  variant="primary"
                  className="w-full h-12 text-base"
                  onClick={handleSendEmail}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Enviando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Enviar Email de Verificação
                    </div>
                  )}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  className="w-full h-12 text-base"
                  onClick={handleSendEmail}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Reenviando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Reenviar Email
                    </div>
                  )}
                </Button>
              )}

              <button
                onClick={handleClose}
                className="w-full py-2 text-sm text-slate-500 hover:text-slate-300 transition-colors"
              >
                Fechar
              </button>
            </div>

            {/* Footer */}
            <p className="mt-6 text-center text-xs text-slate-600">
              Não recebeu? Verifique sua caixa de spam ou tente reenviar.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EmailVerificationModal;
