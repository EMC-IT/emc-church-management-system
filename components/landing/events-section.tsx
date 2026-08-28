'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, MapPin, ArrowRight } from 'lucide-react';
import { Reveal, Stagger, StaggerItem } from '@/components/motion';

interface EventItem {
  id: string;
  month: string;
  day: string;
  title: string;
  time: string;
  location: string;
  description: string;
  category: string;
}

const upcomingEvents: EventItem[] = [
  {
    id: '1',
    month: 'SEP',
    day: '06',
    title: 'Holy Ghost Empowerment Night',
    time: '6:30 PM – 9:30 PM',
    location: 'Main Sanctuary, Riz Junction',
    description: 'An intensive evening of worship, intercession, prophecy, and supernatural breakthrough.',
    category: 'PRAYER & REVIVAL',
  },
  {
    id: '2',
    month: 'SEP',
    day: '13',
    title: 'Generations Leaders Conference',
    time: '9:00 AM – 2:00 PM',
    location: 'Empowerment Hall & Online',
    description: 'Equipping ministry workers, marketplace leaders, and youth influencers with Kingdom excellence.',
    category: 'LEADERSHIP',
  },
  {
    id: '3',
    month: 'SEP',
    day: '20',
    title: 'Community Care & Health Outreach',
    time: '8:00 AM – 1:00 PM',
    location: 'Riz Junction Community Grounds',
    description: 'Free medical screenings, welfare care packages, and evangelism for surrounding families.',
    category: 'OUTREACH',
  },
];

export function EventsSection() {
  return (
    <section className="relative w-full py-20 sm:py-28 bg-[#F8FAFB] overflow-hidden border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <Reveal direction="up" delay={0.1}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14 sm:mb-18">
            <div className="max-w-2xl text-left">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-10 h-[2px] bg-[#C49831]" />
                <span className="font-heading font-bold text-xs sm:text-[13px] tracking-[0.2em] text-[#C49831] uppercase">
                  WHAT&apos;S HAPPENING
                </span>
              </div>
              <h2 className="font-heading font-black tracking-tight text-[#0B2535] text-3xl sm:text-4xl lg:text-5xl leading-[1.1]">
                Connect. Participate. Grow.
              </h2>
            </div>

            <div>
              <Link
                href="/events"
                className="inline-flex items-center gap-2 font-heading font-bold text-sm sm:text-base text-[#137A96] hover:text-[#0E6881] group transition-colors"
              >
                <span>View All Events</span>
                <ArrowRight className="w-4 h-4 transform transition-transform group-hover:translate-x-1 duration-200" />
              </Link>
            </div>
          </div>
        </Reveal>

        {/* Events Grid with Stagger */}
        <Stagger delayChildren={0.15} staggerChildren={0.08} className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {upcomingEvents.map((event) => (
            <StaggerItem key={event.id}>
              <div className="bg-white h-full rounded-2xl p-6 sm:p-7 border border-slate-200/80 flex flex-col justify-between hover:border-[#1687A7]/50 hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] text-left">
                <div>
                  {/* Date & Category Badge */}
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div className="w-14 h-14 rounded-xl bg-[#E8F4F8] flex flex-col items-center justify-center text-[#14829E] font-heading font-bold">
                      <span className="text-[10px] tracking-wider uppercase leading-none">{event.month}</span>
                      <span className="text-xl leading-none mt-1">{event.day}</span>
                    </div>
                    <span className="text-[10.5px] font-heading font-bold text-[#C49831] tracking-[0.16em] uppercase">
                      {event.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-heading font-black text-xl text-[#0B2535] tracking-tight leading-snug">
                    {event.title}
                  </h3>

                  {/* Details */}
                  <div className="space-y-1.5 mt-4 text-xs sm:text-[13px] font-body text-[#526071]">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#14829E] flex-shrink-0" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#14829E] flex-shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="font-body text-[#64748B] text-sm leading-relaxed mt-4">
                    {event.description}
                  </p>
                </div>

                {/* Action */}
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <Link
                    href={`/events`}
                    className="inline-flex items-center gap-1.5 font-heading font-bold text-xs tracking-wider text-[#137A96] hover:text-[#0E6881] uppercase group transition-colors"
                  >
                    <span>Event Details</span>
                    <ArrowRight className="w-3.5 h-3.5 transform transition-transform group-hover:translate-x-1 duration-200" />
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

export default EventsSection;
