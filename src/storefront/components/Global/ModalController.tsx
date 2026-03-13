"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useModalStore } from '@/storefront/store/useModalStore';
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';

/**
 * ModalController Component
 * Path: src/storefront/components/Global/ModalController.tsx
 * * This is the global listener for the useModalStore.
 * Place this in your top-level layout.
 */
export default function ModalController() {
  const { isOpen, title, message, type, onConfirm, closeModal } = useModalStore();

  // Helper to render the correct icon based on type
  const renderIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle2 className="text-green-500 w-6 h-6" />;
      case 'error': return <XCircle className="text-red-500 w-6 h-6" />;
      case 'confirm': return <Info className="text-blue-500 w-6 h-6" />;
      default: return <AlertCircle className="text-brand-orange w-6 h-6" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-[#0f0f0f] border border-slate-200 dark:border-white/10 rounded-[28px] max-w-md w-full p-8 relative overflow-hidden shadow-2xl"
          >
            {/* Ambient Background Glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-orange/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center gap-4 mb-4">
              {renderIcon()}
              <h2 className="text-xl font-black uppercase italic tracking-tight dark:text-white">
                {title}
              </h2>
            </div>
            
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed mb-8">
              {message}
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                {type === 'confirm' ? 'Cancel' : 'Dismiss'}
              </button>
              
              {type === 'confirm' && (
                <button
                  onClick={() => {
                    if (onConfirm) onConfirm();
                    closeModal();
                  }}
                  className="px-6 py-2.5 bg-brand-orange hover:bg-orange-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-glow-orange transition-all active:scale-95"
                >
                  Confirm Action
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
