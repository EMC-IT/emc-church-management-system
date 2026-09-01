import { Variants } from 'framer-motion';
import { easings, durations } from './transitions';

export const fadeUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 32,
  },
  visible: (custom?: { delay?: number; duration?: number }) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: custom?.duration ?? durations.editorial,
      delay: custom?.delay ?? 0,
      ease: easings.editorial,
    },
  }),
};

export const fadeInVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: (custom?: { delay?: number; duration?: number }) => ({
    opacity: 1,
    transition: {
      duration: custom?.duration ?? durations.standard,
      delay: custom?.delay ?? 0,
      ease: easings.editorial,
    },
  }),
};

export const scaleUpVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.96,
  },
  visible: (custom?: { delay?: number; duration?: number }) => ({
    opacity: 1,
    scale: 1,
    transition: {
      duration: custom?.duration ?? durations.editorial,
      delay: custom?.delay ?? 0,
      ease: easings.editorial,
    },
  }),
};

export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: (custom?: { delayChildren?: number; staggerChildren?: number }) => ({
    opacity: 1,
    transition: {
      delayChildren: custom?.delayChildren ?? 0.1,
      staggerChildren: custom?.staggerChildren ?? 0.08,
    },
  }),
};

export const maskRevealVariants: Variants = {
  hidden: {
    opacity: 0,
    clipPath: 'inset(100% 0% 0% 0%)',
    scale: 1.05,
  },
  visible: (custom?: { delay?: number; duration?: number }) => ({
    opacity: 1,
    clipPath: 'inset(0% 0% 0% 0%)',
    scale: 1,
    transition: {
      duration: custom?.duration ?? durations.cinematic,
      delay: custom?.delay ?? 0,
      ease: easings.editorial,
    },
  }),
};

export const heroTextVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 28,
    filter: 'blur(6px)',
  },
  visible: (custom?: { delay?: number }) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: durations.editorial,
      delay: custom?.delay ?? 0,
      ease: easings.editorial,
    },
  }),
};
