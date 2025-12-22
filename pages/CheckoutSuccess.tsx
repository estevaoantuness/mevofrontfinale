import React, { useEffect, useState } from 'react';
import { CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/Logo';

interface CheckoutSuccessProps {
  onGoToDashboard: () => void;
}

export const CheckoutSuccess: React.FC<CheckoutSuccessProps> = ({ onGoToDashboard }) => {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Hide confetti after 5 seconds
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050509] p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-green-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              <Sparkles
                size={16}
                className={`${
                  ['text-yellow-400', 'text-green-400', 'text-blue-400', 'text-purple-400'][
                    Math.floor(Math.random() * 4)
                  ]
                }`}
              />
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="w-full max-w-md text-center z-10">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        {/* Success Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Pagamento confirmado!
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-slate-400 mb-8">
          Seu plano está ativo. Você já pode começar a usar todas as funcionalidades.
        </p>

        {/* Summary Card */}
        <div className="bg-[#0B0C15] border border-white/10 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
            <span className="text-slate-400">Status</span>
            <span className="inline-flex items-center gap-1.5 text-green-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-green-400"></span>
              Ativo
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Proximos passos</span>
            <span className="text-slate-300">Configurar propriedades</span>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          variant="primary"
          className="w-full h-14 text-lg"
          onClick={onGoToDashboard}
        >
          Ir para o Dashboard
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>

        {/* Help Text */}
        <p className="mt-6 text-sm text-slate-500">
          Dúvidas? Entre em contato pelo email suporte@mevo.ai
        </p>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
