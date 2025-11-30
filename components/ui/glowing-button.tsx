import React from 'react';
import { ArrowRight } from 'lucide-react';
import { GlowingEffect } from './glowing-effect';

interface GlowingButtonProps {
  // Made children optional to fix error: Property 'children' is missing in type '{}'
  children?: React.ReactNode;
  onClick?: () => void;
}

export function GlowingButton({ children, onClick }: GlowingButtonProps) {
  return (
    <button
      onClick={onClick}
      className="relative rounded-xl border border-white/10 bg-black px-8 py-4 text-base font-medium text-white transition-colors hover:bg-white/5 cursor-pointer"
    >
      <GlowingEffect
        spread={40}
        glow={true}
        disabled={false}
        proximity={64}
        inactiveZone={0.01}
        borderWidth={2}
      />
      <span className="relative z-10 flex items-center gap-2">
        {children}
        <ArrowRight className="h-4 w-4" />
      </span>
    </button>
  );
}