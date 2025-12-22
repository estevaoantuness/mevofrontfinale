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
              ? 'bg-gradient-to-br from-[#050509] via-blue-900/30 to-[#050509]'
              : 'bg-gradient-to-br from-white via-blue-50 to-white'
          }`}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="text-center space-y-4"
          >
            {/* Spinner */}
            <div className="relative w-16 h-16 mx-auto">
              <div className={`absolute inset-0 border-4 rounded-full ${isDark ? 'border-blue-500/20' : 'border-blue-200'}`}></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
            </div>

            {/* Texts */}
            <div className="space-y-2">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
              {subtitle && (
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{subtitle}</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingOverlay;
