"use client";

import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import ParticleLayer from './ParticleLayer';
import GlowSkeleton from '../Global/GlowSkeleton';

/**
 * Interface for Slideshow Content
 */
interface Slide {
  id: number;
  title: string;
  color: string;
  mode: 'sphere' | 'wave' | 'galaxy';
  subtitle: string;
}

const SLIDES: Slide[] = [
  { id: 1, title: "Industrial", color: "#ff7d1a", mode: "sphere", subtitle: "Heavy Duty Machinery" },
  { id: 2, title: "Electronics", color: "#3b82f6", mode: "wave", subtitle: "Next-Gen Components" },
  { id: 3, title: "Logistics", color: "#10b981", mode: "galaxy", subtitle: "Global Supply Chain" },
  { id: 4, title: "Sourcing", color: "#f97316", mode: "sphere", subtitle: "Verified Manufacturers" }
];

interface HeroSlideshowProps {
  isLoading?: boolean;
}

/**
 * HeroSlideshow Component
 * Path: src/storefront/components/Showroom/HeroSlideshow.tsx
 * * High-impact 3D animated banner for the storefront showroom.
 * Replaces the Wholesaler HeroSlideshow with Next.js and TypeScript logic.
 */
export default function HeroSlideshow({ isLoading }: HeroSlideshowProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (isLoading) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isLoading]);

  return (
    <div className="relative h-64 lg:h-96 rounded-[32px] overflow-hidden bg-black border border-slate-200 dark:border-white/10 shadow-2xl transition-colors duration-500">
      <AnimatePresence mode="wait">
        {isLoading ? (
          /* 1. Integrated Glow Skeleton State */
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 p-8 lg:p-16 flex items-center"
          >
            <div className="space-y-6 w-full max-w-2xl">
              <div className="space-y-3">
                <GlowSkeleton className="h-12 lg:h-16 w-3/4 rounded-2xl" />
                <GlowSkeleton className="h-12 lg:h-16 w-1/2 rounded-2xl" />
              </div>
              <GlowSkeleton className="h-4 w-1/4 rounded-full mt-4" />
            </div>
          </motion.div>
        ) : (
          /* 2. Real 3D Content State */
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full w-full relative"
          >
            {/* 3D Particle Background Engine */}
            <div className="absolute inset-0 z-0 opacity-60">
              <Canvas camera={{ position: [0, 0, 1] }} dpr={[1, 2]}>
                <ParticleLayer 
                  mode={SLIDES[index].mode} 
                  color={SLIDES[index].color} 
                />
              </Canvas>
            </div>

            {/* Branded Text Layer */}
            <div className="relative z-10 h-full p-8 lg:p-16 flex flex-col justify-center pointer-events-none">
              <motion.div
                key={index}
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <p className="text-brand-orange font-black text-[10px] lg:text-xs uppercase tracking-[0.4em] mb-4">
                  {SLIDES[index].subtitle}
                </p>
                <h2 className="text-4xl lg:text-7xl font-black text-white uppercase italic leading-none drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                  {SLIDES[index].title} <br/> 
                  <span className="text-brand-orange drop-shadow-[0_0_20px_rgba(255,125,26,0.4)]">ZONE</span>
                </h2>
              </motion.div>
            </div>

            {/* Smart Navigation Dots */}
            <div className="absolute bottom-8 left-8 lg:left-16 flex gap-3 z-20">
              {SLIDES.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setIndex(i)} 
                  className={`h-1.5 rounded-full transition-all duration-700 border-none outline-none cursor-pointer ${
                    index === i 
                      ? 'w-10 bg-brand-orange shadow-[0_0_15px_rgba(255,125,26,0.6)]' 
                      : 'w-2 bg-white/20 hover:bg-white/40'
                  }`} 
                />
              ))}
            </div>

            {/* Side Progress Indicator */}
            <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-4">
               <span className="text-white/20 font-black text-4xl italic select-none">0{index + 1}</span>
               <div className="w-px h-20 bg-gradient-to-b from-transparent via-brand-orange/50 to-transparent" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}