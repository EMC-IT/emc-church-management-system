'use client';

import React from 'react';
import Link from 'next/link';
import { Quote, ArrowRight } from 'lucide-react';
import { Reveal, Stagger, StaggerItem } from '@/components/motion';

interface Testimony {
  id: string;
  quote: string;
  author: string;
  role: string;
  category: string;
}

const approvedTestimonies: Testimony[] = [
  {
    id: '1',
    quote: 'Joining Empowerment Mountain Church transformed my walk with God. Through the teaching of the Word and intense prayer, God restored my family and opened supernatural business doors.',
    author: 'Brother Emmanuel K.',
    role: 'Member since 2023',
    category: 'RESTORATION & PROVISION',
  },
  {
    id: '2',
    quote: 'I came in broken and searching for direction. Today, I am grounded in Christ, serving in the youth ministry, and living with undeniable purpose and joy.',
    author: 'Sister Abigail A.',
    role: 'Youth Ministry Member',
    category: 'PURPOSE & IDENTITY',
  },
  {
    id: '3',
    quote: 'The atmosphere of worship and divine presence here is authentic. God healed me physically and ignited a hunger for holiness and kingdom excellence in my life.',
    author: 'Elder Samuel O.',
    role: 'Life Group Leader',
    category: 'HEALING & HOLINESS',
  },
];

export function TestimoniesSection() {
  return (
    <section className="relative w-full py-20 sm:py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <Reveal direction="up" delay={0.1}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14 sm:mb-18">
            <div className="max-w-2xl text-left">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-10 h-[2px] bg-[#C49831]" />
                <span className="font-heading font-bold text-xs sm:text-[13px] tracking-[0.2em] text-[#C49831] uppercase">
                  GOD IS STILL MOVING
                </span>
              </div>
              <h2 className="font-heading font-black tracking-tight text-[#0B2535] text-3xl sm:text-4xl lg:text-5xl leading-[1.1]">
                Stories of Changed Lives
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 font-heading font-bold text-sm text-[#137A96] hover:text-[#0E6881] group transition-colors"
              >
                <span>Share Your Testimony</span>
                <ArrowRight className="w-4 h-4 transform transition-transform group-hover:translate-x-1 duration-200" />
              </Link>
            </div>
          </div>
        </Reveal>

        {/* Testimonies Grid with Stagger */}
        <Stagger delayChildren={0.15} staggerChildren={0.08} className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {approvedTestimonies.map((testimony) => (
            <StaggerItem key={testimony.id}>
              <div className="bg-slate-50/80 h-full rounded-2xl p-7 border border-slate-100 flex flex-col justify-between text-left hover:border-[#1687A7]/40 hover:-translate-y-0.5 transition-all duration-300">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-[10.5px] font-heading font-bold text-[#C49831] tracking-[0.16em] uppercase">
                      {testimony.category}
                    </span>
                    <Quote className="w-5 h-5 text-[#14829E]/30" />
                  </div>

                  <p className="font-body text-[#475569] text-base leading-relaxed italic">
                    &ldquo;{testimony.quote}&rdquo;
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-200/60">
                  <p className="font-heading font-bold text-base text-[#0B2535]">
                    {testimony.author}
                  </p>
                  <p className="font-body text-xs text-[#64748B] mt-0.5">
                    {testimony.role}
                  </p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

      </div>
    </section>
  );
}

export default TestimoniesSection;
