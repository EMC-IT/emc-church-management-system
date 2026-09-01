import React from 'react';
import type { Metadata } from 'next';
import { Navbar } from '@/components/landing';

export const metadata: Metadata = {
  title: 'Events | Empowerment Mountain Church',
  description: 'Upcoming church services, conferences, retreats, and special events at Empowerment Mountain Church.',
};

export default function EventsPage() {
  return (
    <main className="min-h-screen flex flex-col justify-between">
      <Navbar />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center flex-grow flex flex-col justify-center items-center">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-10 h-[2px] bg-[#C49831]" />
          <span className="font-heading font-bold text-xs tracking-[0.2em] text-[#C49831] uppercase">
            CALENDAR & ACTIVITIES
          </span>
        </div>
        <h1 className="font-heading font-black text-4xl sm:text-6xl text-[#0B2535] tracking-tight max-w-3xl">
          Upcoming Events
        </h1>
        <p className="font-body text-[#475569] text-lg sm:text-xl max-w-2xl mt-6 leading-relaxed">
          Join us for life-changing worship services, power-packed prayer meetings, conferences, and community gatherings.
        </p>
      </section>
    </main>
  );
}
