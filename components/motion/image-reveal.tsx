'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { easings, durations } from '@/lib/motion/transitions';

export interface ImageRevealProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export function ImageReveal({
  children,
  delay = 0,
  duration = durations.editorial,
  className,
}: ImageRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={`relative w-full h-full overflow-hidden ${className ?? ''}`}>{children}</div>;
  }

  return (
    <div className={`relative w-full h-full overflow-hidden ${className ?? ''}`}>
      <motion.div
        initial={{
          opacity: 0.6,
          scale: 1.05,
        }}
        whileInView={{
          opacity: 1,
          scale: 1,
        }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{
          duration,
          delay,
          ease: easings.editorial,
        }}
        className="relative w-full h-full"
      >
        {children}
      </motion.div>
    </div>
  );
}

export default ImageReveal;
