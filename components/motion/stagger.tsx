'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { staggerContainerVariants, fadeUpVariants } from '@/lib/motion/variants';

export interface StaggerProps {
  children: React.ReactNode;
  delayChildren?: number;
  staggerChildren?: number;
  className?: string;
  once?: boolean;
}

export function Stagger({
  children,
  delayChildren = 0.1,
  staggerChildren = 0.08,
  className,
  once = true,
}: StaggerProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.15 }}
      custom={{ delayChildren, staggerChildren }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div variants={fadeUpVariants} className={className}>
      {children}
    </motion.div>
  );
}

export default Stagger;
