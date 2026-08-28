import React from 'react';
import type { Metadata } from 'next';
import { Navbar } from '@/components/landing';

export const metadata: Metadata = {
  title: 'Contact Us | Empowerment Mountain Church',
  description: 'Get in touch with Empowerment Mountain Church. Location, service times, and contact information.',
};

export default function ContactPage() {
  return (
    <main className="min-h-screen flex flex-col justify-between">
      <Navbar />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center flex-grow flex flex-col justify-center items-center">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-10 h-[2px] bg-[#C49831]" />
          <span className="font-heading font-bold text-xs tracking-[0.2em] text-[#C49831] uppercase">
            CONNECT WITH US
          </span>
        </div>
        <h1 className="font-heading font-black text-4xl sm:text-6xl text-[#0B2535] tracking-tight max-w-3xl">
          Contact Us
        </h1>
        <p className="font-body text-[#475569] text-lg sm:text-xl max-w-2xl mt-6 leading-relaxed">
          41 Number 1, Riz Junction (Opp. Total Energies). We would love to hear from you and welcome you to our services.
        </p>
      </section>
    </main>
  );
}
