'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, PlayCircle, ChevronDown } from 'lucide-react';
import { HeroInfoStrip } from './hero-info-strip';
import { easings } from '@/lib/motion/transitions';

export function Hero() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative w-full lg:min-h-[calc(100vh-100px)] lg:max-h-[920px] bg-white flex flex-col justify-between overflow-hidden pt-2 pb-6">
      {/* ========================================================================= */}
      {/* BACKGROUND DECORATIONS (DOTTED GRID NEAR IMAGE BOUNDARY)                  */}
      {/* ========================================================================= */}
      <motion.div
        initial={shouldReduceMotion ? { opacity: 0.3 } : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 0.3, scale: 1 }}
        transition={{ duration: 1, delay: 0.4, ease: easings.editorial }}
        className="hidden sm:block absolute top-6 lg:top-8 right-4 sm:right-12 lg:right-[47%] xl:right-[49%] pointer-events-none z-10"
      >
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <pattern id="dotPatternHero" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="2.5" cy="2.5" r="2" fill="#2E8DB0" />
          </pattern>
          <rect width="120" height="120" fill="url(#dotPatternHero)" />
        </svg>
      </motion.div>

      {/* ========================================================================= */}
      {/* MAIN HERO COMPOSITION (LEFT CONTENT + RIGHT IMAGE WITH CURVE)             */}
      {/* ========================================================================= */}
      <div className="relative w-full max-w-[1600px] mx-auto flex-1 flex flex-col lg:flex-row items-center justify-between z-10 px-4 sm:px-6 lg:px-8">

        {/* LEFT COLUMN: HERO CONTENT */}
        <div className="w-full lg:w-[54%] xl:w-[50%] lg:pl-8 xl:pl-16 2xl:pl-20 py-4 sm:py-6 lg:py-6 flex flex-col justify-center text-left z-20">

          {/* Eyebrow Label */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: easings.editorial }}
            className="inline-flex items-center gap-3.5 mb-3 sm:mb-4"
          >
            <div className="w-10 sm:w-12 h-[2.5px] bg-[#D4A02A] rounded-full" />
            <span className="font-heading font-bold text-[12px] sm:text-[13px] tracking-[0.2em] text-[#C49831] uppercase">
              RAISING HOLY GHOST,
            </span>
          </motion.div>

          {/* Main Headline */}
          <h1 className="font-heading font-black tracking-tight text-[#0B2535] text-5xl sm:text-6xl md:text-7xl lg:text-[76px] xl:text-[88px] leading-[1.0] select-none">
            <motion.span
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 28, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, delay: 0.25, ease: easings.editorial }}
              className="block"
            >
              Empowered
            </motion.span>
            
            <motion.span
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 28, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, delay: 0.38, ease: easings.editorial }}
              className="block mt-1"
            >
              <span className="relative inline-block text-[#D4A02A]">
                Generations
                {/* Hand-drawn brush-style blue underline */}
                <motion.svg
                  initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.7, delay: 0.6, ease: easings.editorial }}
                  style={{ originX: 0 }}
                  className="absolute -bottom-2.5 sm:-bottom-3 left-0 w-[105%] h-3.5 sm:h-4 text-[#1687A7] overflow-visible pointer-events-none"
                  viewBox="0 0 240 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M3 11.5C35 4.5 95 2.5 155 4C195 5 220 8.5 237 11.5C222 13 180 16 142 14.5C80 12 35 15.5 3 11.5Z"
                    fill="#1687A7"
                  />
                  <path
                    d="M10 9C60 4 140 3 230 10.5"
                    stroke="#28ACD1"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    opacity="0.8"
                  />
                </motion.svg>
              </span>
            </motion.span>
          </h1>

          {/* Hero Description */}
          <motion.p
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease: easings.editorial }}
            className="font-body text-[#4A5568] text-base sm:text-lg lg:text-[19px] leading-relaxed max-w-[480px] mt-4 sm:mt-6"
          >
            A Christ-centered community passionate about worship, growth, and transforming lives.
          </motion.p>

          {/* Hero CTA Buttons */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65, ease: easings.editorial }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4 mt-6 sm:mt-8"
          >
            {/* Primary CTA */}
            <Link
              href="#plan-visit"
              className="inline-flex items-center justify-center gap-2.5 h-12 sm:h-14 px-7 rounded-xl bg-[#137A96] hover:bg-[#0E6881] text-white font-heading font-bold text-[15px] sm:text-[16px] transition-colors group"
            >
              <span>Join Us This Sunday</span>
              <ArrowRight className="w-4.5 h-4.5 transform transition-transform group-hover:translate-x-1 duration-200" />
            </Link>

            {/* Secondary CTA */}
            <Link
              href="#sermons"
              className="inline-flex items-center justify-center gap-2.5 h-12 sm:h-14 px-6 rounded-xl bg-white hover:bg-[#F2F9FB] text-[#137A96] border border-[#137A96] font-heading font-bold text-[15px] sm:text-[16px] transition-all group"
            >
              <PlayCircle className="w-4.5 h-4.5 text-[#137A96] group-hover:scale-110 transition-transform duration-200" />
              <span>Watch Message</span>
            </Link>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: WORSHIP IMAGE WITH ORGANIC CURVE */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.3, ease: easings.editorial }}
          className="w-full lg:w-[48%] xl:w-[50%] lg:absolute lg:right-0 lg:top-0 lg:bottom-0 h-[340px] sm:h-[420px] lg:h-full mt-6 lg:mt-0 relative overflow-hidden"
        >
          {/* Authentic Ghanaian/African Church Service Photograph */}
          <div className="relative w-full h-full">
            <Image
              src="/images/hero-worship.jpg"
              alt="Empowerment Mountain Church congregation worshipping during modern church service"
              fill
              priority
              className="object-cover object-[65%_center] lg:object-[58%_center]"
              sizes="(max-width: 1024px) 100vw, 55vw"
            />

            {/* Mobile gradient overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent lg:hidden pointer-events-none" />
          </div>

          {/* Desktop Organic Curved SVG Mask Overlay matching White Background */}
          <div className="hidden lg:block absolute inset-y-0 -left-1 w-[160px] xl:w-[200px] h-full pointer-events-none z-10">
            <svg
              className="w-full h-full text-white fill-current"
              viewBox="0 0 200 800"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M 0,0 L 170,0 C 220,180 180,340 70,520 C 15,640 40,720 160,800 L 0,800 Z"
              />
            </svg>
          </div>
        </motion.div>
      </div>

      {/* ========================================================================= */}
      {/* FLOATING 4-COLUMN INFORMATION STRIP (ABOVE THE FOLD)                      */}
      {/* ========================================================================= */}
      <motion.div
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.75, ease: easings.editorial }}
        className="relative z-30 w-full mt-4 sm:mt-6 lg:mt-4 px-2"
      >
        <HeroInfoStrip />
      </motion.div>

      {/* ========================================================================= */}
      {/* SCROLL TO EXPLORE INDICATOR                                               */}
      {/* ========================================================================= */}
      <motion.div
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="w-full text-center mt-3 sm:mt-4 relative z-20 flex flex-col items-center justify-center select-none"
      >
        <span className="font-heading font-bold text-[10.5px] sm:text-[11px] tracking-[0.26em] text-[#64748B] uppercase">
          SCROLL TO EXPLORE
        </span>
        <motion.div
          animate={shouldReduceMotion ? {} : { y: [0, 4, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="mt-1 text-[#137A96]"
        >
          <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
        </motion.div>
      </motion.div>
    </section>
  );
}

export default Hero;
