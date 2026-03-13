"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, MessageCircle, ShoppingCart, User, LucideIcon } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useCartStore } from '@/storefront/store/useCartStore';

interface NavIconProps {
  Icon: LucideIcon;
  active: boolean;
  label: string;
  onClick: () => void;
}

const NavIcon = ({ Icon, active, label, onClick }: NavIconProps) => {
  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center justify-center w-16 h-16 outline-none group"
      style={{ perspective: '1000px' }}
    >
      {/* 3D Icon Container */}
      <motion.div
        animate={{
          y: active ? -12 : 0,
          rotateX: active ? 25 : 0,
          rotateY: active ? -10 : 0,
          scale: active ? 1.2 : 1,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        className={`relative z-10 p-3 rounded-2xl transition-colors duration-300 ${
          active ? 'bg-brand-orange text-white shadow-glow-orange' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600'
        }`}
      >
        <Icon size={24} strokeWidth={active ? 2.5 : 2} />
        
        {/* 3D "Thickness" shadow */}
        {active && (
          <div className="absolute inset-0 rounded-2xl border-b-4 border-orange-700/30 pointer-events-none" />
        )}
      </motion.div>

      {/* Floating Label */}
      <AnimatePresence>
        {active && (
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 22 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute text-[10px] font-black text-brand-orange uppercase tracking-widest"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Under-icon Shadow */}
      {active && (
        <motion.div
          layoutId="shadow"
          className="absolute bottom-2 w-8 h-1 bg-orange-500/20 blur-sm rounded-full"
        />
      )}
    </button>
  );
};

export default function MobileNavbar() {
  const router = useRouter();
  const params = useParams();
  const vendor_slug = params?.vendor_slug as string;
  const { toggleCart } = useCartStore();
  const [activeTab, setActiveTab] = useState('home');

  const navItems = [
    { id: 'home', Icon: Home, label: 'Home', path: `/${vendor_slug}` },
    { id: 'chat', Icon: MessageCircle, label: 'Chat', path: `/${vendor_slug}/chat` },
    { id: 'cart', Icon: ShoppingCart, label: 'Cart', action: () => toggleCart() },
    { id: 'profile', Icon: User, label: 'User', path: `/${vendor_slug}/profile` },
  ];

  return (
    <div className="lg:hidden fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-[250]">
      
      {/* 3D Glowing Aura Effect */}
      <div className="absolute inset-0 -z-10 bg-orange-500/10 blur-[40px] rounded-[40px] animate-pulse" />
      
      {/* Main Glass Navbar */}
      <div className="relative bg-white/70 dark:bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/50 dark:border-white/10 rounded-[35px] flex justify-around items-center py-2 px-3 shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden">
        
        {/* Inner Gloss Shine */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent" />

        {navItems.map((item) => (
          <NavIcon
            key={item.id}
            Icon={item.Icon}
            label={item.label}
            active={activeTab === item.id}
            onClick={() => {
              setActiveTab(item.id);
              if (item.action) {
                item.action();
              } else if (item.path) {
                router.push(item.path);
              }
            }}
          />
        ))}
      </div>

      {/* Bottom Underglow Bar */}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/3 h-[2px] bg-gradient-to-r from-transparent via-brand-orange to-transparent shadow-[0_0_10px_#ff7d1a]" />
    </div>
  );
}
