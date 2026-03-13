"use client";

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
// @ts-ignore - maath doesn't always have updated type definitions
import * as random from 'maath/random/dist/maath-random.esm';

/**
 * Interface for ParticleLayer Props
 */
interface ParticleLayerProps {
  mode: 'sphere' | 'wave' | 'galaxy';
  color: string;
}

/**
 * ParticleLayer Component
 * Path: src/storefront/components/Showroom/ParticleLayer.tsx
 * * This provides the animated 3D particle backgrounds for the Hero section.
 * Replaces the Wholesaler ParticleLayer with Next.js and TypeScript logic.
 */
export default function ParticleLayer({ mode, color }: ParticleLayerProps) {
  const ref = useRef<THREE.Points>(null!);

  // Create unique 3D shapes based on the selected mode
  const positions = useMemo(() => {
    // Generate 3000 points (9000 floats) for the 3D effect
    const count = mode === 'galaxy' ? 2500 : 3000;
    const array = new Float32Array(count * 3);

    if (mode === 'sphere') {
      return random.inSphere(array, { radius: 1.5 }) as Float32Array;
    }
    if (mode === 'wave') {
      return random.inBox(array, { sides: [3, 1, 2] }) as Float32Array;
    }
    // Default: Galaxy mode
    return random.inSphere(array, { radius: 2 }) as Float32Array;
  }, [mode]);

  /**
   * Animation Frame Loop
   * Provides distinct design movements for each background mode.
   */
  useFrame((state, delta) => {
    if (!ref.current) return;

    if (mode === 'sphere') {
      ref.current.rotation.y += delta * 0.15;
    } else if (mode === 'wave') {
      ref.current.rotation.x += delta * 0.1;
      ref.current.position.y = Math.sin(state.clock.elapsedTime) * 0.05;
    } else {
      // Galaxy / Default rotation
      ref.current.rotation.z += delta * 0.1;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={color}
        size={0.007}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending} // Standard blending for glowing particles
      />
    </Points>
  );
}
