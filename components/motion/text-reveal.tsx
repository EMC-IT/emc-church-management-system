'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { easings, durations } from '@/lib/motion/transitions';

export interface TextRevealProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
}

export function TextReveal({
  children,
  delay = 0,
  duration = durations.editorial,
  className,
  as: Component = 'div',
}: TextRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <Component className={className}>{children}</Component>;
  }

  const MotionComponent = motion[Component as keyof typeof motion] as typeof motion.div;

  return (
    <div className="overflow-hidden">
      <MotionComponent
        initial={{ y: '100%', opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{
          duration,
          delay,
          ease: easings.editorial,
        }}
        className={className}
      >
        {children}
      </MotionComponent>
    </div>
  );
}

export default TextReveal;
