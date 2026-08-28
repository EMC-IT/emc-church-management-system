'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Headphones, Calendar, BookOpen, User, ArrowRight } from 'lucide-react';
import { Reveal, ImageReveal, Stagger, StaggerItem } from '@/components/motion';

interface RecentSermon {
  id: string;
  title: string;
  speaker: string;
  date: string;
  scripture: string;
}

const recentSermons: RecentSermon[] = [
  {
    id: '1',
    title: 'The Blueprint for Holy Ghost Living',
    speaker: 'Resident Pastor',
    date: 'August 24, 2026',
    scripture: 'Romans 8:1–14',
  },
  {
    id: '2',
    title: 'Unlocking Supernatural Fruitfulness',
    speaker: 'Associate Pastor',
    date: 'August 17, 2026',
    scripture: 'John 15:1–8',
  },
  {
    id: '3',
    title: 'Excellence in Kingdom Stewardship',
    speaker: 'Guest Minister',
    date: 'August 10, 2026',
    scripture: 'Daniel 6:1–4',
  },
];

export function SermonsSection() {
  return (
    <section id="sermons" className="relative w-full py-20 sm:py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <Reveal direction="up" delay={0.1}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14 sm:mb-18">
            <div className="max-w-2xl text-left">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-10 h-[2px] bg-[#C49831]" />
                <span className="font-heading font-bold text-xs sm:text-[13px] tracking-[0.2em] text-[#C49831] uppercase">
                  GROW IN FAITH
                </span>
              </div>
              <h2 className="font-heading font-black tracking-tight text-[#0B2535] text-3xl sm:text-4xl lg:text-5xl leading-[1.1]">
                Be Transformed by the Word
              </h2>
            </div>

            <div>
              <Link
                href="/sermons"
                className="inline-flex items-center gap-2 font-heading font-bold text-sm sm:text-base text-[#137A96] hover:text-[#0E6881] group transition-colors"
              >
                <span>Explore Sermons</span>
                <ArrowRight className="w-4 h-4 transform transition-transform group-hover:translate-x-1 duration-200" />
              </Link>
            </div>
          </div>
        </Reveal>

        {/* Featured Sermon Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-14">
          
          {/* Media Thumbnail with Play Overlay */}
          <div className="lg:col-span-7">
            <div className="relative group cursor-pointer overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
              <div className="relative h-[280px] sm:h-[380px] lg:h-[420px] w-full">
                <Image
                  src="/images/sermon-latest.jpg"
                  alt="Latest sermon preaching at Empowerment Mountain Church"
                  fill
                  priority
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-300 pointer-events-none" />
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/90 text-[#137A96] flex items-center justify-center pl-1 group-hover:scale-110 group-hover:bg-white transition-all duration-300 shadow-md">
                    <Play className="w-7 h-7 sm:w-9 sm:h-9 fill-current" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Featured Sermon Details */}
          <div className="lg:col-span-5 text-left flex flex-col justify-center">
            <Reveal direction="up" delay={0.25}>
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-[#D4A02A]" />
                <span className="font-heading font-bold text-xs tracking-[0.2em] text-[#C49831] uppercase">
                  LATEST MESSAGE
                </span>
              </div>

              <h3 className="font-heading font-black text-2xl sm:text-3xl text-[#0B2535] leading-tight tracking-tight">
                Walking in the Fulness of the Holy Ghost
              </h3>

              <div className="space-y-2 mt-4 text-xs sm:text-sm font-body text-[#526071]">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#14829E]" />
                  <span>Senior Pastor</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#14829E]" />
                  <span>Sunday, August 23, 2026</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#14829E]" />
                  <span className="font-semibold text-[#0B2535]">Ephesians 3:14–21</span>
                </div>
              </div>

              <p className="font-body text-[#64748B] text-sm sm:text-base leading-relaxed mt-4">
                Discover how the indwelling power of the Holy Spirit empowers believers to overcome challenges, walk in divine wisdom, and impact nations.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 mt-6 pt-6 border-t border-slate-100">
                <Link
                  href="/sermons"
                  className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-[#137A96] hover:bg-[#0E6881] text-white font-heading font-semibold text-sm transition-colors"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Watch Message</span>
                </Link>
                <Link
                  href="/sermons"
                  className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-white hover:bg-[#F2F9FB] text-[#137A96] border border-[#137A96] font-heading font-semibold text-sm transition-colors"
                >
                  <Headphones className="w-4 h-4" />
                  <span>Listen to Audio</span>
                </Link>
              </div>
            </Reveal>
          </div>

        </div>

        {/* Recent Sermons Row with Stagger */}
        <Stagger delayChildren={0.2} staggerChildren={0.08} className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-slate-100 text-left">
          {recentSermons.map((sermon) => (
            <StaggerItem key={sermon.id}>
              <div className="p-5 h-full rounded-2xl bg-slate-50/70 border border-slate-100 flex flex-col justify-between hover:border-[#1687A7]/40 hover:-translate-y-0.5 transition-all duration-300">
                <div>
                  <span className="text-[11px] font-heading font-bold text-[#14829E] tracking-wider uppercase">
                    {sermon.date}
                  </span>
                  <h4 className="font-heading font-bold text-base sm:text-lg text-[#0B2535] mt-1.5 leading-snug">
                    {sermon.title}
                  </h4>
                  <p className="text-xs font-body text-[#64748B] mt-2">
                    {sermon.speaker} • <span className="font-semibold text-[#0B2535]">{sermon.scripture}</span>
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/50">
                  <Link
                    href="/sermons"
                    className="inline-flex items-center gap-1 font-heading font-bold text-xs tracking-wider text-[#137A96] hover:text-[#0E6881] uppercase group transition-colors"
                  >
                    <span>Listen Now</span>
                    <ArrowRight className="w-3 h-3 transform transition-transform group-hover:translate-x-1 duration-200" />
                  </Link>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

      </div>
    </section>
  );
}

export default SermonsSection;
