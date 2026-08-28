'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/motion';

export interface AboutCtaProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  primaryBtnText?: string;
  primaryBtnHref?: string;
  secondaryBtnText?: string;
  secondaryBtnHref?: string;
}

export function AboutCta({
  eyebrow = 'GET CONNECTED',
  title = 'Come and Be Part of the Story',
  description = "There's a place for you to encounter God, grow in faith, build meaningful relationships, and serve with purpose.",
  primaryBtnText = 'Plan Your Visit',
  primaryBtnHref = '/#plan-visit',
  secondaryBtnText = 'Contact Us',
  secondaryBtnHref = '/contact',
}: AboutCtaProps) {
  return (
    <section className="relative w-full py-20 sm:py-28 bg-[#0B1E28] text-white overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#1687A7]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#C49831]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Reveal direction="up" delay={0.1}>
          <div className="inline-flex items-center gap-2 mb-3.5">
            <span className="w-2 h-2 rounded-full bg-[#D4A02A]" />
            <span className="font-heading font-bold text-xs tracking-[0.22em] text-[#D4A02A] uppercase">
              {eyebrow}
            </span>
          </div>

          <h2 className="font-heading font-black tracking-tight text-white text-3xl sm:text-4xl lg:text-5xl leading-[1.15] max-w-2xl mx-auto">
            {title}
          </h2>

          <p className="font-body text-slate-300 text-base sm:text-lg lg:text-xl leading-relaxed max-w-xl mx-auto mt-5">
            {description}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 mt-8 sm:mt-10">
            <Link
              href={primaryBtnHref}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 h-12 sm:h-14 px-7 sm:px-8 rounded-xl bg-[#137A96] hover:bg-[#0E6881] text-white font-heading font-bold text-[15px] sm:text-[16px] transition-colors group"
            >
              <span>{primaryBtnText}</span>
              <ArrowRight className="w-4.5 h-4.5 transform transition-transform group-hover:translate-x-1 duration-200" />
            </Link>
            <Link
              href={secondaryBtnHref}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 sm:h-14 px-6 sm:px-7 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 font-heading font-bold text-[15px] sm:text-[16px] transition-colors"
            >
              <span>{secondaryBtnText}</span>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default AboutCta;
