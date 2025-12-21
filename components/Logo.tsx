import React from 'react';

const BRAND_TEXT_GRADIENT = 'bg-clip-text text-transparent bg-gradient-to-r from-[#2563EB] to-[#22D3EE]';

interface LogoProps {
  size?: string;
  onClick?: () => void;
}

export const Logo = ({ size = 'text-2xl', onClick }: LogoProps) => (
  <div
    className={`${size} font-bold tracking-tight select-none ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
    onClick={onClick}
  >
    <span className={BRAND_TEXT_GRADIENT}>mevo.ai</span>
  </div>
);

export default Logo;
