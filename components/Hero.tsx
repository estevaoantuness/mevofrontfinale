import React from 'react';
import { GlowingButton } from './ui/glowing-button';

type ApiStatus = 'checking' | 'online' | 'offline';

interface HeroProps {
  apiStatus: ApiStatus;
}

function getStatusLabel(status: ApiStatus) {
  if (status === 'online') return 'API online';
  if (status === 'offline') return 'API indisponível';
  return 'Verificando API...';
}

export function Hero({ apiStatus }: HeroProps) {
  const badgeStyles = {
    online: 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10',
    offline: 'border-rose-500/40 text-rose-300 bg-rose-500/10',
    checking: 'border-slate-500/40 text-slate-300 bg-slate-500/10'
  }[apiStatus];

  return (
    <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center select-none">
      {/* Logo */}
      <div className="mb-12 text-3xl font-bold text-white tracking-tight">
        mevo.ai
      </div>

      {/* Headline */}
      <h1 className="max-w-4xl text-[clamp(48px,8vw,80px)] font-semibold leading-[1.1] tracking-tight text-white">
        Seu Airbnb no
        <br />
        piloto automático.
      </h1>

      {/* Subtitle */}
      <p className="mt-6 text-lg text-gray-600">
        Automação de limpeza para anfitriões.
      </p>

      {/* API Status */}
      <div className={`mt-6 inline-flex items-center gap-2 rounded-full px-4 py-2 border text-sm ${badgeStyles}`}>
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
        </span>
        {getStatusLabel(apiStatus)}
      </div>

      {/* CTA */}
      <div className="mt-12">
        <GlowingButton>
          Começar Grátis
        </GlowingButton>
      </div>
    </section>
  );
}
