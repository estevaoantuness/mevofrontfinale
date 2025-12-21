import React, { useState } from 'react';
import { Logo } from '../components/Logo';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../lib/AuthContext';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onBack: () => void;
  onGoToRegister?: () => void;
}

export const LoginPage = ({ onLoginSuccess, onBack, onGoToRegister }: LoginPageProps) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Credenciais invalidas');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050509] p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#050509] to-[#050509] -z-10" />

      <div className="w-full max-w-sm bg-[#0B0C15] border border-white/10 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="mb-6 flex justify-center"><Logo /></div>
          <h2 className="text-xl font-medium text-white mb-2">Entrar na sua conta</h2>
          <p className="text-sm text-slate-500">Acesse o painel do Mevo</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email"
            type="email"
            placeholder="admin@mevo.app"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Senha"
            type="password"
            placeholder="******"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
              {error}
            </div>
          )}

          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? 'Entrando...' : 'Fazer Login'}
          </Button>
        </form>

        <div className="mt-6 text-center space-y-3">
          {onGoToRegister && (
            <p className="text-sm text-slate-500">
              Ainda nao tem conta?{' '}
              <button onClick={onGoToRegister} className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
                Criar conta gratis
              </button>
            </p>
          )}
          <button onClick={onBack} className="text-xs text-slate-500 hover:text-white transition-colors">
            &larr; Voltar para Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
