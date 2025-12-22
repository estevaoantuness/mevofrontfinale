import React from 'react';
import { useTranslation } from 'react-i18next';

const BRAND_TEXT_GRADIENT = 'bg-clip-text text-transparent bg-gradient-to-r from-[#2563EB] to-[#22D3EE]';

interface LogoProps {
  size?: string;
  onClick?: () => void;
}

export const Logo = ({ size = 'text-2xl', onClick }: LogoProps) => {
  const { i18n } = useTranslation();

  // mevo.ai for English, mevo.ia for Portuguese and Spanish
  const brandName = i18n.language === 'en' ? 'mevo.ai' : 'mevo.ia';

  return (
    <div
      className={`${size} font-bold tracking-tight select-none ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
      onClick={onClick}
    >
      <span className={BRAND_TEXT_GRADIENT}>{brandName}</span>
    </div>
  );
};

export default Logo;
