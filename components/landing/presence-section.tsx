'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Reveal, ParallaxImage } from '@/components/motion';

export function PresenceSection() {
  return (
    <section className="relative w-full py-24 sm:py-32 lg:py-36 bg-[#0B1E28] text-white overflow-hidden">
      {/* Background Image with Parallax & Deep Gradient Mask */}
      <div className="absolute inset-0 z-0 opacity-40 overflow-hidden">
        <ParallaxImage offset={30} className="absolute inset-0 w-full h-full">
          <Image
            src="/images/presence-worship.jpg"
            alt="Empowerment Mountain Church atmosphere of prayer and worship"
            fill
            className="object-cover object-center"
            sizes="100vw"
          />
        </ParallaxImage>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B1E28] via-[#0B1E28]/80 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1E28] via-transparent to-[#0B1E28]/70 pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl text-left">
          
          <Reveal direction="up" delay={0.1}>
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-3 mb-5">
              <div className="w-10 sm:w-12 h-[2px] bg-[#D4A02A]" />
              <span className="font-heading font-bold text-xs sm:text-[13px] tracking-[0.22em] text-[#D4A02A] uppercase">
                THE PRESENCE OF GOD
              </span>
            </div>

            {/* Heading */}
            <h2 className="font-heading font-black tracking-tight text-white text-3xl sm:text-5xl lg:text-6xl leading-[1.08]">
              Come Expecting. <br className="hidden sm:inline" />
              <span className="text-[#28ACD1]">Leave Empowered.</span>
            </h2>
          </Reveal>

          <Reveal direction="up" delay={0.25}>
            {/* Supporting Copy */}
            <p className="font-body text-slate-300 text-base sm:text-lg lg:text-xl leading-relaxed mt-6">
              Every gathering is an opportunity to encounter God&apos;s presence, hear His Word, worship together, and be strengthened for the journey ahead.
            </p>

            {/* Supporting Row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm font-heading font-bold tracking-[0.2em] text-cyan-300/90 mt-8 pt-6 border-t border-slate-700/60 uppercase">
              <span>WORSHIP</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4A02A]" />
              <span>PRAYER</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4A02A]" />
              <span>THE WORD</span>
            </div>

            {/* CTA */}
            <div className="mt-8 sm:mt-10">
              <Link
                href="#plan-visit"
                className="inline-flex items-center gap-2.5 h-12 sm:h-14 px-7 sm:px-8 rounded-xl bg-[#137A96] hover:bg-[#0E6881] text-white font-heading font-bold text-[15px] sm:text-[16px] transition-colors group"
              >
                <span>Join Us This Sunday</span>
                <ArrowRight className="w-4.5 h-4.5 transform transition-transform group-hover:translate-x-1 duration-200" />
              </Link>
            </div>
          </Reveal>

        </div>
      </div>
    </section>
  );
}

export default PresenceSection;
