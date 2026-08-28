'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, MapPin, ArrowRight, ExternalLink } from 'lucide-react';
import { Reveal } from '@/components/motion';

export function VisitSection() {
  return (
    <section id="plan-visit" className="relative w-full py-20 sm:py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Reveal direction="up" delay={0.1}>
          <div className="bg-[#0B1E28] rounded-3xl p-8 sm:p-12 lg:p-16 text-white text-left relative overflow-hidden">
            
            {/* Subtle Ambient Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#1687A7]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#C49831]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              
              {/* Left Content */}
              <div className="lg:col-span-7">
                <div className="inline-flex items-center gap-3 mb-4">
                  <div className="w-10 h-[2px] bg-[#D4A02A]" />
                  <span className="font-heading font-bold text-xs sm:text-[13px] tracking-[0.2em] text-[#D4A02A] uppercase">
                    WE&apos;D LOVE TO SEE YOU
                  </span>
                </div>

                <h2 className="font-heading font-black tracking-tight text-white text-3xl sm:text-4xl lg:text-5xl leading-[1.1]">
                  Come Worship With Us
                </h2>

                <p className="font-body text-slate-300 text-base sm:text-lg leading-relaxed mt-4 max-w-xl">
                  Whether you are visiting for the first time or looking for a church family to call home, we warmly welcome you with open arms.
                </p>

                {/* Service times & Location card details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-700/60">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#1687A7]/20 text-[#28ACD1] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-heading font-bold text-[#D4A02A] tracking-wider uppercase">SERVICE TIMES</h3>
                      <p className="font-heading font-bold text-white text-base mt-0.5">Every Sunday</p>
                      <p className="text-xs text-slate-300">8:00 AM & 10:30 AM</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#1687A7]/20 text-[#28ACD1] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-heading font-bold text-[#D4A02A] tracking-wider uppercase">OUR LOCATION</h3>
                      <p className="font-heading font-bold text-white text-base mt-0.5">41 Number 1, Riz Junction</p>
                      <p className="text-xs text-slate-300">(Opp. Total Energies)</p>
                    </div>
                  </div>
                </div>

                {/* What to expect */}
                <div className="mt-8 pt-6 border-t border-slate-700/60 text-xs sm:text-sm font-body text-slate-300">
                  <span className="font-heading font-bold text-[#28ACD1] tracking-wider uppercase mr-2">WHAT TO EXPECT:</span>
                  Worship • The Word • Prayer • Fellowship
                </div>
              </div>

              {/* Right Action Box */}
              <div className="lg:col-span-5 flex flex-col gap-4 bg-white/5 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-white/10">
                <h3 className="font-heading font-bold text-xl text-white">
                  Planning Your First Visit?
                </h3>
                <p className="font-body text-slate-300 text-sm leading-relaxed">
                  Let us know you&apos;re coming! Our hospitality team will be ready to welcome you, help with parking, and connect you.
                </p>
                
                <div className="flex flex-col gap-3 mt-4">
                  <Link
                    href="/contact"
                    className="w-full inline-flex items-center justify-center gap-2.5 h-12 px-6 rounded-xl bg-[#137A96] hover:bg-[#0E6881] text-white font-heading font-bold text-sm transition-colors group"
                  >
                    <span>Plan Your Visit</span>
                    <ArrowRight className="w-4 h-4 transform transition-transform group-hover:translate-x-1 duration-200" />
                  </Link>
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-white/10 hover:bg-white/15 text-white font-heading font-semibold text-sm transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Get Directions</span>
                  </a>
                </div>
              </div>

            </div>

          </div>
        </Reveal>

      </div>
    </section>
  );
}

export default VisitSection;
