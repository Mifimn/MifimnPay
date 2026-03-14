"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-4"
      >
        <div 
          className={`
            max-w-6xl mx-auto 
            rounded-2xl 
            flex justify-between items-center px-6 py-3 
            transition-all duration-300
            border
            ${scrolled 
              ? 'bg-brand-paper/80 backdrop-blur-xl border-brand-border/50 shadow-lg dark:shadow-none' 
              : 'bg-brand-paper/50 backdrop-blur-lg border-brand-border/30 shadow-sm dark:shadow-none' 
            }
          `}
        >
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-2">
            <img 
              src="/favicon.png" 
              alt="MifimnPay" 
              className="w-8 h-8 rounded-lg shadow-md object-cover" 
            />
            <span className="font-bold text-brand-black text-lg tracking-tight transition-colors duration-300">MifimnPay</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-brand-gray">
            <Link href="/" className="hover:text-brand-black transition-colors duration-300">Home</Link>
            <Link href="/#how-it-works" className="hover:text-brand-black transition-colors duration-300">How it Works</Link>
            <Link href="/login" className="hover:text-brand-black transition-colors duration-300">Pricing</Link>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-brand-gray hover:text-brand-black transition-colors duration-300">Log In</Link>
            <Link href="/generate" className="bg-brand-black hover:opacity-90 text-brand-paper text-sm font-medium px-5 py-2.5 rounded-xl transition-all shadow-lg active:scale-95 duration-300">
              Get Started
            </Link>
          </div>

          {/* Mobile Toggle Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="md:hidden p-2 text-brand-black bg-brand-paper/50 hover:bg-brand-paper rounded-lg transition-colors duration-300"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-20 left-4 right-4 bg-brand-paper/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-brand-border p-6 md:hidden flex flex-col gap-4 z-40 transition-colors duration-300"
            >
              <Link href="/" onClick={() => setIsOpen(false)} className="text-lg font-medium text-brand-black py-2 border-b border-brand-border/50 transition-colors duration-300">Home</Link>
              <Link href="/#how-it-works" onClick={() => setIsOpen(false)} className="text-lg font-medium text-brand-black py-2 border-b border-brand-border/50 transition-colors duration-300">How it Works</Link>
              <Link href="/login" onClick={() => setIsOpen(false)} className="text-lg font-medium text-brand-black py-2 border-b border-brand-border/50 transition-colors duration-300">Log In</Link>
              <Link href="/generate" onClick={() => setIsOpen(false)} className="bg-brand-black text-center text-brand-paper text-lg font-medium px-5 py-3 rounded-xl shadow-lg transition-colors duration-300 hover:opacity-90">
                Create Receipt Now
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}
