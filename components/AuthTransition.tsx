import React, { useEffect, useState } from 'react';
import { useTheme } from '../lib/ThemeContext';

interface AuthTransitionProps {
  onComplete: () => void;
}

export const AuthTransition = ({ onComplete }: AuthTransitionProps) => {
  const { isDark } = useTheme();
  const [stage, setStage] = useState<'logo' | 'expand' | 'fade'>('logo');

  useEffect(() => {
    // Stage 1: Logo aparece e pulsa (1s)
    const timer1 = setTimeout(() => setStage('expand'), 1000);

    // Stage 2: Logo expande (0.5s)
    const timer2 = setTimeout(() => setStage('fade'), 1500);

    // Stage 3: Fade out e completa (0.5s)
    const timer3 = setTimeout(() => onComplete(), 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ${
        isDark ? 'bg-[#050509]' : 'bg-[#F8FAFC]'
      } ${stage === 'fade' ? 'opacity-0' : 'opacity-100'}`}
    >
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl transition-all duration-1000 ${
            isDark
              ? 'bg-gradient-to-r from-blue-600/20 to-cyan-400/20'
              : 'bg-gradient-to-r from-blue-400/30 to-cyan-300/30'
          } ${stage === 'logo' ? 'w-32 h-32' : 'w-[200vw] h-[200vh]'}`}
        />
      </div>

      {/* Logo */}
      <div
        className={`relative transition-all duration-500 ${
          stage === 'logo' ? 'scale-100 opacity-100' :
          stage === 'expand' ? 'scale-150 opacity-100' :
          'scale-200 opacity-0'
        }`}
      >
        <span
          className={`text-6xl md:text-8xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#2563EB] to-[#22D3EE] ${
            stage === 'logo' ? 'animate-pulse' : ''
          }`}
        >
          mevo
        </span>
      </div>

      {/* Loading dots */}
      {stage === 'logo' && (
        <div className="absolute bottom-1/3 flex gap-2">
          <div
            className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-blue-500' : 'bg-blue-600'}`}
            style={{ animationDelay: '0ms' }}
          />
          <div
            className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-blue-400' : 'bg-blue-500'}`}
            style={{ animationDelay: '150ms' }}
          />
          <div
            className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-cyan-400' : 'bg-cyan-500'}`}
            style={{ animationDelay: '300ms' }}
          />
        </div>
      )}
    </div>
  );
};

export default AuthTransition;
