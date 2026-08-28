'use client';

import React from 'react';
import { Reveal } from '@/components/motion';

export function VisionMissionSection() {
  return (
    <section className="relative w-full py-20 sm:py-28 bg-[#F8FAFB] overflow-hidden border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <Reveal direction="up" delay={0.1}>
          <div className="max-w-3xl mb-14 sm:mb-20 text-left">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-10 h-[2px] bg-[#C49831]" />
              <span className="font-heading font-bold text-xs sm:text-[13px] tracking-[0.2em] text-[#C49831] uppercase">
                OUR PURPOSE
              </span>
            </div>
            <h2 className="font-heading font-black tracking-tight text-[#0B2535] text-3xl sm:text-4xl lg:text-5xl leading-[1.1]">
              Raising a Generation That Lives Holy, Victorious & Fulfilled
            </h2>
          </div>
        </Reveal>

        {/* Vision & Mission Two-Sided Editorial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-stretch">
          
          {/* VISION STATEMENT */}
          <Reveal direction="up" delay={0.2} className="h-full">
            <div className="h-full bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 border border-slate-200/70 flex flex-col justify-between relative group hover:border-[#1687A7]/40 transition-colors">
              <div>
                <div className="inline-flex items-center gap-2 mb-6">
                  <span className="w-2 h-2 rounded-full bg-[#C49831]" />
                  <span className="font-heading font-bold text-xs sm:text-sm tracking-[0.24em] text-[#C49831] uppercase">
                    OUR VISION
                  </span>
                </div>
                <blockquote className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-[34px] text-[#0B2535] leading-snug tracking-tight">
                  &ldquo;Generations of Holy, Victorious, and Fulfilled People in Christ.&rdquo;
                </blockquote>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-100 text-xs sm:text-sm font-body text-[#64748B]">
                Empowered through spiritual intimacy and divine purpose.
              </div>
            </div>
          </Reveal>

          {/* MISSION STATEMENT */}
          <Reveal direction="up" delay={0.35} className="h-full">
            <div className="h-full bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 border border-slate-200/70 flex flex-col justify-between relative group hover:border-[#1687A7]/40 transition-colors">
              <div>
                <div className="inline-flex items-center gap-2 mb-6">
                  <span className="w-2 h-2 rounded-full bg-[#1687A7]" />
                  <span className="font-heading font-bold text-xs sm:text-sm tracking-[0.24em] text-[#1687A7] uppercase">
                    OUR MISSION
                  </span>
                </div>
                <blockquote className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-[34px] text-[#0B2535] leading-snug tracking-tight">
                  &ldquo;Raising Holy Ghost Empowerment Generation.&rdquo;
                </blockquote>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-100 text-xs sm:text-sm font-body text-[#64748B]">
                Walking in the supernatural power and character of Christ.
              </div>
            </div>
          </Reveal>

        </div>

      </div>
    </section>
  );
}

export default VisionMissionSection;
