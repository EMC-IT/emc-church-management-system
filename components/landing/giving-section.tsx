'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Heart } from 'lucide-react';
import { Reveal } from '@/components/motion';

export function GivingSection() {
  return (
    <section className="relative w-full py-20 sm:py-28 bg-[#F8FAFB] overflow-hidden border-y border-slate-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        <Reveal direction="up" delay={0.1}>
          {/* Icon Accent */}
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#E8F4F8] text-[#14829E] flex items-center justify-center mb-6">
            <Heart className="w-7 h-7 stroke-[2]" />
          </div>

          {/* Heading */}
          <h2 className="font-heading font-black tracking-tight text-[#0B2535] text-3xl sm:text-4xl lg:text-5xl leading-[1.15] max-w-3xl mx-auto">
            Give. Support the Vision. <br className="hidden sm:inline" />
            <span className="text-[#137A96]">Impact Generations.</span>
          </h2>
        </Reveal>

        <Reveal direction="up" delay={0.25}>
          {/* Supporting Copy */}
          <p className="font-body text-[#475569] text-base sm:text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto mt-6">
            Your generosity helps us continue raising empowered generations, strengthening families, serving communities, and advancing the work God has entrusted to us.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 mt-8 sm:mt-10">
            <Link
              href="/give"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 h-12 sm:h-14 px-7 sm:px-8 rounded-xl bg-[#137A96] hover:bg-[#0E6881] text-white font-heading font-bold text-[15px] sm:text-[16px] transition-colors group"
            >
              <span>Give Online</span>
              <ArrowRight className="w-4.5 h-4.5 transform transition-transform group-hover:translate-x-1 duration-200" />
            </Link>
            <Link
              href="/give"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 sm:h-14 px-6 sm:px-7 rounded-xl bg-white hover:bg-[#F2F9FB] text-[#137A96] border border-[#137A96] font-heading font-bold text-[15px] sm:text-[16px] transition-colors"
            >
              <span>Giving Information</span>
            </Link>
          </div>
        </Reveal>

      </div>
    </section>
  );
}

export default GivingSection;
