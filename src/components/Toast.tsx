import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import { useSocial } from '../context/SocialContext';

export const Toast: React.FC = () => {
  const { toastMessage } = useSocial();

  return (
    <AnimatePresence>
      {toastMessage && (
        <motion.div
          id="global-toast"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 bg-neutral-900/95 text-white px-4 py-2.5 rounded-full shadow-xl border border-neutral-700/50 backdrop-blur-md text-sm font-medium"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
