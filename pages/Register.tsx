import React, { useState } from 'react';
import { Logo } from '../components/Logo';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { CheckoutModal } from '../components/billing/CheckoutModal';
import { useAuth } from '../lib/AuthContext';

// Planos para o CheckoutModal
const PLANS_DATA = {
  starter: { id: 'starter', name: 'Starter', monthlyPrice: 67, yearlyPrice: 49, features: ['Ate 3 propriedades', 'Sync iCal', 'Automacoes basicas', 'Integracao WhatsApp'], hasTrial: false },
  pro: { id: 'pro', name: 'Pro', monthlyPrice: 197, yearlyPrice: 149, features: ['Ate 10 propriedades', 'Tudo do Starter', 'Webhooks', 'Suporte prioritario'], hasTrial: true, trialDays: 10 },
  agency: { id: 'agency', name: 'Agency', monthlyPrice: 379, yearlyPrice: 289, features: ['Ate 30 propriedades', 'Tudo do Pro', 'Multi-usuarios', 'API completa'], hasTrial: false }
};

interface RegisterPageProps {
  onRegisterSuccess: () => void;
  onGoToLogin: () => void;
}

export const RegisterPage = ({ onRegisterSuccess, onGoToLogin }: RegisterPageProps) => {
  const { register } = useAuth();
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

    // Validacoes
    if (!name || !email || !password || !confirmPassword) {
      setError('Preencha todos os campos');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas nao coincidem');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter no minimo 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      await register(name, email, password);

      // Verificar se há plano pendente (selecionado na landing page)
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
      setError(err.message || 'Erro ao criar conta');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050509] p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#050509] to-[#050509] -z-10" />

      <div className="w-full max-w-sm bg-[#0B0C15] border border-white/10 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="mb-6 flex justify-center"><Logo /></div>
          <h2 className="text-xl font-medium text-white mb-2">Crie sua conta gratis</h2>
          <p className="text-sm text-slate-500">Comece agora - e gratis!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome completo"
            type="text"
            placeholder="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Senha"
            type="password"
            placeholder="Minimo 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Input
            label="Confirmar senha"
            type="password"
            placeholder="Digite a senha novamente"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
              {error}
            </div>
          )}

          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? 'Criando conta...' : 'Criar Minha Conta'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            Ja tem uma conta?{' '}
            <button onClick={onGoToLogin} className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
              Fazer login
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
