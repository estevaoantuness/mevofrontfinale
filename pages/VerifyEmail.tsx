import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, ArrowRight, Mail } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/Logo';
import { verifyEmail } from '../lib/api';

interface VerifyEmailProps {
  onGoToDashboard: () => void;
  onGoToLogin: () => void;
}

export const VerifyEmailPage: React.FC<VerifyEmailProps> = ({ onGoToDashboard, onGoToLogin }) => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'no-token'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('no-token');
      setMessage('Token de verificação não encontrado na URL.');
      return;
    }

    const verify = async () => {
      try {
        const result = await verifyEmail(token);
        if (result.success) {
          setStatus('success');
          setMessage(result.message || 'Email verificado com sucesso!');
        } else {
          setStatus('error');
          setMessage(result.message || 'Erro ao verificar email.');
        }
      } catch (error: unknown) {
        setStatus('error');
        const errorMessage = error instanceof Error ? error.message : 'Erro ao verificar email. O link pode estar expirado.';
        setMessage(errorMessage);
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050509] p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] ${
        status === 'success' ? 'bg-green-600/10' : status === 'error' ? 'bg-red-600/10' : 'bg-blue-600/10'
      } rounded-full blur-[120px] pointer-events-none`} />

      {/* Content */}
      <div className="w-full max-w-md text-center z-10">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        {/* Status Icon */}
        <div className="mb-6">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${
            status === 'loading' ? 'bg-blue-500/20' :
            status === 'success' ? 'bg-green-500/20' :
            'bg-red-500/20'
          }`}>
            {status === 'loading' && (
              <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle className="w-10 h-10 text-green-400" />
            )}
            {(status === 'error' || status === 'no-token') && (
              <XCircle className="w-10 h-10 text-red-400" />
            )}
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          {status === 'loading' && 'Verificando email...'}
          {status === 'success' && 'Email verificado!'}
          {status === 'error' && 'Erro na verificação'}
          {status === 'no-token' && 'Link inválido'}
        </h1>

        {/* Message */}
        <p className="text-lg text-slate-400 mb-8">
          {message || (status === 'loading' ? 'Aguarde enquanto verificamos seu email...' : '')}
        </p>

        {/* Card for success */}
        {status === 'success' && (
          <div className="bg-[#0B0C15] border border-white/10 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
              <span className="text-slate-400">Status</span>
              <span className="inline-flex items-center gap-1.5 text-green-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-green-400"></span>
                Verificado
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Próximos passos</span>
              <span className="text-slate-300">Ativar seu plano</span>
            </div>
          </div>
        )}

        {/* CTA Buttons */}
        {status === 'success' && (
          <Button
            variant="primary"
            className="w-full h-14 text-lg"
            onClick={onGoToDashboard}
          >
            Ir para o Dashboard
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        )}

        {(status === 'error' || status === 'no-token') && (
          <div className="space-y-3">
            <Button
              variant="primary"
              className="w-full h-14 text-lg"
              onClick={onGoToLogin}
            >
              <Mail className="w-5 h-5 mr-2" />
              Fazer Login
            </Button>
            <p className="text-sm text-slate-500">
              Faça login para solicitar um novo link de verificação
            </p>
          </div>
        )}

        {/* Help Text */}
        <p className="mt-6 text-sm text-slate-500">
          Dúvidas? Entre em contato pelo email suporte@mevo.ai
        </p>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
