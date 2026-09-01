'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Reveal, ImageReveal } from '@/components/motion';

export function WelcomeSection() {
  return (
    <section className="relative w-full py-20 sm:py-28 lg:py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* LEFT: AUTHENTIC FELLOWSHIP PHOTOGRAPH */}
          <div className="lg:col-span-6 relative">
            <div className="relative h-[400px] sm:h-[480px] lg:h-[540px] w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
              <Image
                src="/images/welcome-fellowship.jpg"
                alt="Empowerment Mountain Church members in joyful community fellowship"
                fill
                priority
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            {/* Subtle brand color accent block behind image corner */}
            <div className="absolute -bottom-3 -right-3 w-28 h-28 bg-[#1687A7]/10 rounded-3xl -z-10" />
          </div>

          {/* RIGHT: NARRATIVE & PILLARS */}
          <div className="lg:col-span-6 flex flex-col justify-center text-left">
            <Reveal direction="up" delay={0.15}>
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-3 mb-4 sm:mb-5">
                <div className="w-10 sm:w-12 h-[2px] bg-[#C49831]" />
                <span className="font-heading font-bold text-xs sm:text-[13px] tracking-[0.2em] text-[#C49831] uppercase">
                  WELCOME TO EMPOWERMENT MOUNTAIN CHURCH
                </span>
              </div>

              {/* Heading */}
              <h2 className="font-heading font-black tracking-tight text-[#0B2535] text-3xl sm:text-4xl lg:text-5xl leading-[1.1]">
                A Place to Encounter God, Grow in Faith & Fulfil Purpose
              </h2>
            </Reveal>

            <Reveal direction="up" delay={0.3}>
              {/* Supporting text */}
              <p className="font-body text-[#475569] text-base sm:text-lg leading-relaxed mt-6">
                Empowerment Mountain Church is a Christ-centered Church committed to raising a generation that knows God, walks in His power, grows in faith, and lives with purpose.
              </p>

              {/* Subtle Visual Pillars Row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm font-heading font-bold tracking-[0.18em] text-[#1687A7] mt-8 pt-6 border-t border-slate-100 uppercase">
                <span>WORSHIP</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#C49831]" />
                <span>THE WORD</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#C49831]" />
                <span>PRAYER</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#C49831]" />
                <span>FELLOWSHIP</span>
              </div>

              {/* CTA */}
              <div className="mt-8">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2.5 font-heading font-bold text-sm sm:text-base text-[#137A96] hover:text-[#0E6881] group transition-colors"
                >
                  <span>Discover Our Story</span>
                  <ArrowRight className="w-4 h-4 transform transition-transform group-hover:translate-x-1 duration-200" />
                </Link>
              </div>
            </Reveal>

          </div>

        </div>
      </div>
    </section>
  );
}

export default WelcomeSection;
