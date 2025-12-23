import React, { useState } from 'react';
import { Logo } from '../components/Logo';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useTheme } from '../lib/ThemeContext';
import { useTranslatedError } from '../hooks/useTranslatedError';
import * as api from '../lib/api';

interface ForgotPasswordPageProps {
  onBack: () => void;
  onGoToLogin: () => void;
}

export const ForgotPasswordPage = ({ onBack, onGoToLogin }: ForgotPasswordPageProps) => {
  const { isDark } = useTheme();
  const { translateError } = useTranslatedError();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(translateError(err));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050509] p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#050509] to-[#050509] -z-10" />

        <div className="w-full max-w-sm bg-[#0B0C15] border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 mx-auto flex items-center justify-center mb-6">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>

          <h2 className="text-xl font-medium text-white mb-2">Email enviado!</h2>
          <p className="text-sm text-slate-400 mb-6">
            Se o email <span className="text-white font-medium">{email}</span> estiver cadastrado,
            você receberá um link para redefinir sua senha.
          </p>

          <div className="bg-white/5 rounded-lg p-4 mb-6 text-left">
            <p className="text-xs text-slate-500 mb-2">Não recebeu o email?</p>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>- Verifique sua pasta de spam</li>
              <li>- Confirme se o email está correto</li>
              <li>- Aguarde alguns minutos</li>
            </ul>
          </div>

          <Button onClick={onGoToLogin} className="w-full">
            Voltar para Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050509] p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#050509] to-[#050509] -z-10" />

      <div className="w-full max-w-sm bg-[#0B0C15] border border-white/10 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="mb-6 flex justify-center"><Logo /></div>

          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 mx-auto flex items-center justify-center mb-4">
            <Mail className="w-7 h-7 text-blue-400" />
          </div>

          <h2 className="text-xl font-medium text-white mb-2">Esqueceu sua senha?</h2>
          <p className="text-sm text-slate-500">
            Digite seu email e enviaremos um link para criar uma nova senha
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
              {error}
            </div>
          )}

          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
          </Button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <button
            onClick={onGoToLogin}
            className="text-sm text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2 w-full"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Login
          </button>
          <button onClick={onBack} className="text-xs text-slate-500 hover:text-white transition-colors">
            Voltar para Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
