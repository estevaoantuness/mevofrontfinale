import React, { useState, useEffect } from 'react';
import { Logo } from '../components/Logo';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Lock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import * as api from '../lib/api';

interface ResetPasswordPageProps {
  token: string;
  onGoToLogin: () => void;
  onBack: () => void;
}

export const ResetPasswordPage = ({ token, onGoToLogin, onBack }: ResetPasswordPageProps) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Verificar token ao carregar
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const result = await api.verifyResetToken(token);
        setTokenValid(result.valid);
        if (!result.valid) {
          setError(result.error || 'Token inválido ou expirado');
        }
      } catch (err: any) {
        setTokenValid(false);
        setError('Erro ao verificar token');
      } finally {
        setVerifying(false);
      }
    };

    if (token) {
      verifyToken();
    } else {
      setVerifying(false);
      setTokenValid(false);
      setError('Token não fornecido');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    setLoading(true);

    try {
      await api.resetPassword(token, password);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao redefinir senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050509] p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#050509] to-[#050509] -z-10" />

        <div className="w-full max-w-sm bg-[#0B0C15] border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Verificando link...</p>
        </div>
      </div>
    );
  }

  // Token invalid
  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050509] p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#050509] to-[#050509] -z-10" />

        <div className="w-full max-w-sm bg-[#0B0C15] border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 mx-auto flex items-center justify-center mb-6">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>

          <h2 className="text-xl font-medium text-white mb-2">Link inválido</h2>
          <p className="text-sm text-slate-400 mb-6">
            {error || 'Este link de recuperação de senha é inválido ou já expirou.'}
          </p>

          <div className="space-y-3">
            <Button onClick={onGoToLogin} className="w-full">
              Solicitar novo link
            </Button>
            <button onClick={onBack} className="text-xs text-slate-500 hover:text-white transition-colors w-full">
              Voltar para Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050509] p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#050509] to-[#050509] -z-10" />

        <div className="w-full max-w-sm bg-[#0B0C15] border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 mx-auto flex items-center justify-center mb-6">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>

          <h2 className="text-xl font-medium text-white mb-2">Senha redefinida!</h2>
          <p className="text-sm text-slate-400 mb-6">
            Sua senha foi alterada com sucesso. Agora você pode fazer login com sua nova senha.
          </p>

          <Button onClick={onGoToLogin} className="w-full">
            Fazer Login
          </Button>
        </div>
      </div>
    );
  }

  // Reset form
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050509] p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#050509] to-[#050509] -z-10" />

      <div className="w-full max-w-sm bg-[#0B0C15] border border-white/10 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="mb-6 flex justify-center"><Logo /></div>

          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 mx-auto flex items-center justify-center mb-4">
            <Lock className="w-7 h-7 text-blue-400" />
          </div>

          <h2 className="text-xl font-medium text-white mb-2">Nova senha</h2>
          <p className="text-sm text-slate-500">
            Digite sua nova senha abaixo
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Nova senha"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Input
            label="Confirmar senha"
            type="password"
            placeholder="Digite novamente"
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
            {loading ? 'Salvando...' : 'Redefinir Senha'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={onBack} className="text-xs text-slate-500 hover:text-white transition-colors">
            Voltar para Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
