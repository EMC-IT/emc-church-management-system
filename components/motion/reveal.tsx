'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { easings, durations } from '@/lib/motion/transitions';

export interface RevealProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
  amount?: number | 'some' | 'all';
}

export function Reveal({
  children,
  direction = 'up',
  distance = 32,
  delay = 0,
  duration = durations.editorial,
  className,
  once = true,
  amount = 0.2,
}: RevealProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const getInitialPosition = () => {
    switch (direction) {
      case 'up':
        return { y: distance, x: 0 };
      case 'down':
        return { y: -distance, x: 0 };
      case 'left':
        return { x: distance, y: 0 };
      case 'right':
        return { x: -distance, y: 0 };
      case 'none':
      default:
        return { x: 0, y: 0 };
    }
  };

  const initial = {
    opacity: 0,
    ...getInitialPosition(),
  };

  const animate = {
    opacity: 1,
    x: 0,
    y: 0,
  };

  return (
    <motion.div
      initial={initial}
      whileInView={animate}
      viewport={{ once, amount }}
      transition={{
        duration,
        delay,
        ease: easings.editorial,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default Reveal;
