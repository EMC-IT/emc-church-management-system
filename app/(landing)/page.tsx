import React from 'react';
import type { Metadata } from 'next';
import {
  Navbar,
  Hero,
  WelcomeSection,
  VisionMissionSection,
  CoreValuesSection,
  PresenceSection,
  MinistriesSection,
  EventsSection,
  SermonsSection,
  FruitfulnessSection,
  TestimoniesSection,
  GivingSection,
  VisitSection,
  MembersSection,
  Footer,
} from '@/components/landing';

export const metadata: Metadata = {
  title: 'Empowerment Mountain Church | Raising Holy Ghost Empowerment Generation',
  description:
    'A Christ-centered community passionate about worship, spiritual growth, and transforming lives. Raising Disciples, Impacting Nations.',
};

export default function LandingHomePage() {
  return (
    <main className="relative min-h-screen bg-white text-[#0B2535] font-body selection:bg-[#E8F4F8] selection:text-[#137A96]">
      {/* LOCKED Navbar and Hero */}
      <Navbar />
      <Hero />

      {/* Complete Homepage Content starting immediately below Hero */}
      <WelcomeSection />
      <VisionMissionSection />
      <CoreValuesSection />
      <PresenceSection />
      <MinistriesSection />
      <EventsSection />
      <SermonsSection />
      <FruitfulnessSection />
      <TestimoniesSection />
      <GivingSection />
      <VisitSection />
      <MembersSection />
      <Footer />
    </main>
  );
}
