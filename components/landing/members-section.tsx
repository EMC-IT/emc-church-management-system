'use client';

import React from 'react';
import Link from 'next/link';
import { User, ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/motion';

export function MembersSection() {
  return (
    <section className="relative w-full py-16 sm:py-20 bg-[#F8FAFB] overflow-hidden border-t border-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        <Reveal direction="up" delay={0.1}>
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#1687A7]" />
            <span className="font-heading font-bold text-xs tracking-[0.22em] text-[#1687A7] uppercase">
              FOR OUR CHURCH FAMILY
            </span>
          </div>

          {/* Heading */}
          <h2 className="font-heading font-black tracking-tight text-[#0B2535] text-2xl sm:text-3xl lg:text-4xl leading-tight">
            Stay Connected Beyond Sunday
          </h2>

          {/* Supporting Copy */}
          <p className="font-body text-[#526071] text-sm sm:text-base leading-relaxed max-w-xl mx-auto mt-3">
            Access your church community, events, giving, groups, resources, and personal information from one place.
          </p>

          {/* Action */}
          <div className="mt-6">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-white hover:bg-[#F2F9FB] text-[#137A96] border border-[#137A96] font-heading font-semibold text-sm transition-colors group"
            >
              <User className="w-4 h-4 text-[#137A96]" />
              <span>Members Portal</span>
              <ArrowRight className="w-3.5 h-3.5 transform transition-transform group-hover:translate-x-1 duration-200" />
            </Link>
          </div>
        </Reveal>

      </div>
    </section>
  );
}

export default MembersSection;
