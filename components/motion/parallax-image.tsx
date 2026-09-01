'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';

export interface ParallaxImageProps {
  children: React.ReactNode;
  offset?: number;
  className?: string;
}

export function ParallaxImage({
  children,
  offset = 20,
  className,
}: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [-offset, offset]);

  if (shouldReduceMotion) {
    return <div className={`relative overflow-hidden ${className ?? ''}`}>{children}</div>;
  }

  return (
    <div ref={ref} className={`relative overflow-hidden ${className ?? ''}`}>
      <motion.div style={{ y }} className="relative w-full h-full">
        {children}
      </motion.div>
    </div>
  );
}

export default ParallaxImage;
