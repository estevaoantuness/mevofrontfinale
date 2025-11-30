import React from 'react';
import { GlowingButton } from './ui/glowing-button';

export function Hero() {
  return (
    <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center select-none">
      {/* Logo */}
      <div className="mb-12 text-2xl font-medium text-white tracking-wide">
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

      {/* CTA */}
      <div className="mt-12">
        <GlowingButton>
          Começar Grátis
        </GlowingButton>
      </div>
    </section>
  );
}