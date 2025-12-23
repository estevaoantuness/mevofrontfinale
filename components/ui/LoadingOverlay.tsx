import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../lib/ThemeContext';

interface LoadingOverlayProps {
  isVisible: boolean;
  title?: string;
  subtitle?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  title = 'Carregando...',
  subtitle
}) => {
  const { isDark } = useTheme();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`fixed inset-0 z-[200] flex items-center justify-center ${
            isDark
              ? 'bg-gradient-to-br from-[#050509] via-blue-900/10 to-[#050509]'
              : 'bg-gradient-to-br from-white via-blue-50/50 to-white'
          }`}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="text-center space-y-6"
          >
            {/* Logo */}
            <motion.div
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center"
            >
              <span className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#2563EB] to-[#22D3EE]">
                mevo
              </span>
            </motion.div>

            {/* Spinner */}
            <div className="relative w-12 h-12 mx-auto">
              <div className={`absolute inset-0 border-3 rounded-full ${isDark ? 'border-white/10' : 'border-slate-200'}`}></div>
              <div className="absolute inset-0 border-3 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
            </div>

            {/* Texts */}
            <div className="space-y-1">
              <h3 className={`text-base font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
              {subtitle && (
                <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{subtitle}</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingOverlay;
