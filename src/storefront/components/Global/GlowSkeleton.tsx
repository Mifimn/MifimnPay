"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface GlowSkeletonProps {
  className?: string;
}

/**
 * GlowSkeleton Component
 * Path: src/storefront/components/Global/GlowSkeleton.tsx
 * * Provides a high-end, animated loading placeholder with a vertical scan-line effect.
 * Optimized for MifimnPay's orange brand identity.
 */
export default function GlowSkeleton({ className = '' }: GlowSkeletonProps) {
  return (
    <motion.div
      className={`relative rounded-xl border border-brand-orange/20 bg-slate-100 dark:bg-white/5 overflow-hidden ${className}`}
      initial={{ opacity: 0.5, boxShadow: '0 0 0px rgba(255, 125, 26, 0)' }}
      animate={{ 
        opacity: [0.5, 1, 0.5],
        boxShadow: [
          'inset 0 0 0px rgba(255, 125, 26, 0)',
          'inset 0 0 15px rgba(255, 125, 26, 0.1)',
          'inset 0 0 0px rgba(255, 125, 26, 0)'
        ]
      }}
      transition={{ 
        duration: 2, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
    >
      {/* The Scanning "Laser" Effect */}
      <motion.div 
        className="absolute inset-0 w-full h-full bg-gradient-to-b from-transparent via-brand-orange/10 to-transparent"
        animate={{ y: ['-100%', '100%'] }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity, 
          ease: "linear" 
        }}
      />
    </motion.div>
  );
}
