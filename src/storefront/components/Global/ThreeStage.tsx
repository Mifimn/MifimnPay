"use client";

import React, { Suspense, useMemo, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Float, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

interface ManagedProductProps {
  imageUrl: string;
}

/**
 * ManagedProduct Component
 * Internal component to handle texture memory safety and 3D rendering.
 */
function ManagedProduct({ imageUrl }: ManagedProductProps) {
  const { gl } = useThree();
  
  // Memoize texture to prevent re-loading on every render
  const texture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const tex = loader.load(imageUrl);
    tex.minFilter = THREE.LinearFilter;
    tex.generateMipmaps = false; // Saves 33% GPU RAM
    return tex;
  }, [imageUrl]);

  // Clean up GPU memory when component unmounts
  useEffect(() => {
    return () => {
      if (texture) texture.dispose();
      gl.renderLists.dispose();
    };
  }, [texture, gl]);

  return (
    <Float speed={2.5} rotationIntensity={0.4} floatIntensity={0.8}>
      <group>
        {/* THE SHINING GLASS BACKPLATE */}
        <mesh position={[0, 0, -0.2]}>
          <planeGeometry args={[4.4, 5.6]} />
          <meshPhysicalMaterial 
            color="white" 
            transparent 
            opacity={0.3} 
            transmission={0.9} 
            thickness={1} 
            roughness={0.05} 
          />
        </mesh>
        
        {/* THE PRODUCT IMAGE LAYER */}
        <mesh position={[0, 0, 0.05]}>
          <planeGeometry args={[4, 5]} />
          <meshBasicMaterial 
            map={texture} 
            transparent={true} 
            side={THREE.DoubleSide} 
            alphaTest={0.5} 
          />
        </mesh>
      </group>
    </Float>
  );
}

interface ThreeStageProps {
  imageUrl?: string;
}

/**
 * ThreeStage Component
 * Path: src/storefront/components/Global/ThreeStage.tsx
 * * Provides an interactive, floating 3D glass card for product visualization.
 * Replaces the Wholesaler ThreeStage with Next.js and TypeScript logic.
 */
export default function ThreeStage({ imageUrl }: ThreeStageProps) {
  if (!imageUrl) {
    return <div className="w-full h-full bg-slate-100 dark:bg-white/5 animate-pulse rounded-[3rem]" />;
  }

  return (
    <div className="w-full h-full min-h-[400px] relative rounded-[3rem] overflow-hidden">
      <Suspense fallback={
        <div className="flex items-center justify-center h-full text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Initializing 3D...
        </div>
      }>
        <Canvas 
          dpr={1} 
          gl={{ 
            antialias: false, 
            powerPreference: "low-power" // Optimizes for mobile battery life
          }}
        >
          <PerspectiveCamera makeDefault position={[0, 0, 8]} fmax={45} />
          
          <ambientLight intensity={1.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          
          <ManagedProduct imageUrl={imageUrl} />

          {/* STICKY SLIGHT TILT ROTATION */}
          <OrbitControls 
            enableZoom={false} 
            enablePan={false}
            minPolarAngle={Math.PI / 2.3} 
            maxPolarAngle={Math.PI / 1.7} 
            minAzimuthAngle={-Math.PI / 15} 
            maxAzimuthAngle={Math.PI / 15} 
          />
        </Canvas>
      </Suspense>
    </div>
  );
}