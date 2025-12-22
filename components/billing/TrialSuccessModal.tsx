import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Sparkles, ArrowRight, Calendar, MessageCircle, Bell, Brush } from 'lucide-react';
import { Button } from '../ui/Button';

interface TrialSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToDashboard: () => void;
  trialDays?: number;
  trialEndsAt?: string;
}

export const TrialSuccessModal: React.FC<TrialSuccessModalProps> = ({
  isOpen,
  onClose,
  onGoToDashboard,
  trialDays = 10,
  trialEndsAt
}) => {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const features = [
    { icon: Calendar, text: 'Sincronizacao de calendarios' },
    { icon: Bell, text: 'Notificacoes automaticas' },
    { icon: MessageCircle, text: 'Mensagens para hospedes' },
    { icon: Brush, text: 'Avisos de limpeza' }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Confetti Effect */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(40)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  y: -20,
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 800),
                  opacity: 1,
                  rotate: 0
                }}
                animate={{
                  y: typeof window !== 'undefined' ? window.innerHeight + 100 : 900,
                  rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
                  opacity: 0
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  delay: Math.random() * 0.5,
                  ease: 'easeOut'
                }}
                className="absolute"
              >
                <Sparkles
                  size={16 + Math.random() * 12}
                  className={`${
                    ['text-yellow-400', 'text-green-400', 'text-blue-400', 'text-purple-400', 'text-pink-400'][
                      Math.floor(Math.random() * 5)
                    ]
                  }`}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          transition={{ duration: 0.3, type: 'spring', bounce: 0.3 }}
          className="relative w-full max-w-md bg-gradient-to-b from-[#0B0C15] to-[#050509] border border-white/10 rounded-2xl p-8 shadow-2xl overflow-hidden"
        >
          {/* Glow effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-green-600/20 rounded-full blur-[120px] pointer-events-none" />

          {/* Content */}
          <div className="relative z-10">
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30"
            >
              <CheckCircle className="w-10 h-10 text-white" />
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-6"
            >
              <h2 className="text-3xl font-bold text-white mb-2">
                Pronto!
              </h2>
              <p className="text-xl text-green-400 font-semibold mb-3">
                Seu Airbnb esta automatizado!
              </p>
              <p className="text-slate-400">
                Seu periodo de teste de {trialDays} dias comecou agora.
              </p>
            </motion.div>

            {/* Trial Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-[#050509]/50 rounded-xl p-5 mb-6 border border-white/5"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <span className="text-slate-400">Plano</span>
                <span className="text-white font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400"></span>
                  Pro (Trial)
                </span>
              </div>
              {trialEndsAt && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Valido ate</span>
                  <span className="text-slate-300">{formatDate(trialEndsAt)}</span>
                </div>
              )}
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-6"
            >
              <p className="text-sm text-slate-400 mb-3">Aproveite todos os recursos:</p>
              <div className="grid grid-cols-2 gap-2">
                {features.map(({ icon: Icon, text }, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-sm text-slate-300 bg-white/5 rounded-lg px-3 py-2"
                  >
                    <Icon className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                variant="primary"
                className="w-full h-14 text-lg"
                onClick={() => {
                  onGoToDashboard();
                  onClose();
                }}
              >
                Ir para o Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>

            {/* Footer */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-6 text-center text-xs text-slate-600"
            >
              Aproveite! Apos o trial, escolha o plano ideal para voce.
            </motion.p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TrialSuccessModal;
