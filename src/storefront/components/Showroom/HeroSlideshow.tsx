"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import ParticleLayer from './ParticleLayer';
import GlowSkeleton from '../Global/GlowSkeleton';

interface HeroSlideshowProps {
  isLoading?: boolean;
  bannerType?: 'image' | 'text';
  banners?: (string | null)[];
  promoTexts?: string[];
  themeColor?: string; // To sync particle color with user theme
}

export default function HeroSlideshow({ 
  isLoading, 
  bannerType = 'text', 
  banners = [], 
  promoTexts = [],
  themeColor = "#f97316" 
}: HeroSlideshowProps) {
  const [index, setIndex] = useState(0);

  // Filter valid data based on the type
  const activeSlides = useMemo(() => {
    if (bannerType === 'image') {
      const validBanners = banners.filter(b => b !== null);
      return validBanners.length > 0 ? validBanners : [null]; // Fallback to empty state
    } else {
      const validTexts = promoTexts.filter(t => t.trim() !== '');
      return validTexts.length > 0 ? validTexts : ["Welcome to our Store"];
    }
  }, [bannerType, banners, promoTexts]);

  useEffect(() => {
    if (isLoading || activeSlides.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % activeSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isLoading, activeSlides]);

  // Particle modes to cycle through
  const particleModes: ('sphere' | 'wave' | 'galaxy')[] = ['sphere', 'wave', 'galaxy'];

  return (
    <div className="relative h-72 lg:h-[450px] rounded-[40px] overflow-hidden bg-black border border-white/10 shadow-2xl transition-all duration-500">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 p-12 flex items-center"
          >
            <div className="space-y-6 w-full max-w-2xl">
              <GlowSkeleton className="h-16 lg:h-20 w-3/4 rounded-3xl" />
              <GlowSkeleton className="h-4 w-1/3 rounded-full mt-4" />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="h-full w-full relative"
          >
            {/* 1. 3D Particle Engine (Always Background) */}
            <div className="absolute inset-0 z-0 opacity-40">
              <Canvas camera={{ position: [0, 0, 1] }} dpr={[1, 2]}>
                <ParticleLayer 
                  mode={particleModes[index % 3]} 
                  color={themeColor} 
                />
              </Canvas>
            </div>

            {/* 2. Dynamic Content Layer */}
            <div className="relative z-10 h-full w-full">
              <AnimatePresence mode="wait">
                {bannerType === 'image' ? (
                  /* IMAGE BANNER MODE (2 Slides) */
                  <motion.div
                    key={`img-${index}`}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 1.2 }}
                    className="absolute inset-0 flex items-center justify-center p-8"
                  >
                    {activeSlides[index] ? (
                      <img 
                        src={activeSlides[index]!} 
                        alt="Store Banner" 
                        className="w-full h-full object-cover rounded-[32px] shadow-2xl border border-white/10"
                      />
                    ) : (
                      <div className="text-white/20 font-black italic uppercase text-4xl">No Banner Image</div>
                    )}
                  </motion.div>
                ) : (
                  /* PROMO TEXT MODE (4 Slides) */
                  <motion.div
                    key={`text-${index}`}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0 flex flex-col justify-center px-12 lg:px-24"
                  >
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40 mb-4 italic">
                      Special Announcement
                    </p>
                    <h2 className="text-3xl lg:text-6xl font-black text-white uppercase italic leading-tight drop-shadow-2xl">
                      {activeSlides[index]}
                    </h2>
                    <div 
                      className="h-1 w-24 mt-8 rounded-full" 
                      style={{ backgroundColor: themeColor }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 3. Navigation Dots */}
            {activeSlides.length > 1 && (
              <div className="absolute bottom-8 left-12 flex gap-3 z-20">
                {activeSlides.map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => setIndex(i)} 
                    className={`h-1.5 rounded-full transition-all duration-700 ${
                      index === i 
                        ? 'w-10 shadow-lg' 
                        : 'w-2 bg-white/20'
                    }`}
                    style={{ backgroundColor: index === i ? themeColor : undefined }}
                  />
                ))}
              </div>
            )}

            {/* 4. Glass Counter */}
            <div className="absolute right-12 bottom-8 hidden lg:flex items-center gap-4 bg-white/5 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
               <span className="text-white/60 font-black text-xl italic select-none">
                0{index + 1} <span className="text-white/20 mx-1">/</span> 0{activeSlides.length}
               </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
