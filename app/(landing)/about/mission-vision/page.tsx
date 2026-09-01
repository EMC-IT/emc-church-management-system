import React from 'react';
import type { Metadata } from 'next';
import { ArrowRight, ShieldCheck, Trophy, Sparkles, Zap, Heart, CheckCircle2 } from 'lucide-react';
import { Navbar, Footer } from '@/components/landing';
import { InnerHero, AboutCta } from '@/components/landing/about';
import { Reveal, Stagger, StaggerItem } from '@/components/motion';

export const metadata: Metadata = {
  title: 'Mission & Vision | Empowerment Mountain Church',
  description:
    'Explore the mission, vision, and core spiritual pillars of Empowerment Mountain Church in raising Holy Ghost empowered generations.',
};

const fourPillars = [
  {
    title: 'HOLY',
    tagline: 'A Life Set Apart for God',
    description:
      'Pursuing personal and communal holiness through unbroken communion with God and obedience to His Word.',
    icon: ShieldCheck,
  },
  {
    title: 'VICTORIOUS',
    tagline: 'Triumph Through Christ Jesus',
    description:
      'Walking in supernatural overcoming power over spiritual, emotional, financial, and generational challenges.',
    icon: Trophy,
  },
  {
    title: 'FULFILLED',
    tagline: 'Living Out Divine Calling',
    description:
      'Discovering unique God-given gifts, fulfilling personal potential, and living with undeniable purpose.',
    icon: Sparkles,
  },
  {
    title: 'EMPOWERED',
    tagline: 'Supernatural Enablement',
    description:
      'Operating in the gifts and grace of the Holy Spirit to impact workplaces, families, and nations.',
    icon: Zap,
  },
];

export default function MissionVisionPage() {
  return (
    <main className="relative min-h-screen bg-white text-[#0B2535] font-body selection:bg-[#E8F4F8] selection:text-[#137A96]">
      {/* Global Navbar */}
      <Navbar />

      {/* Hero */}
      <InnerHero
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'About Us', href: '/about' },
          { label: 'Mission & Vision' },
        ]}
        eyebrow="OUR PURPOSE"
        title="A Vision for Generations"
        description="We are raising a generation empowered by the Holy Spirit to live holy, victorious, and fulfilled lives in Christ."
        imageSrc="/images/about-hero.jpg"
        imageAlt="Empowerment Mountain Church congregation worship and fellowship"
      />

      {/* SECTION 1: VISION CENTERPIECE */}
      <section className="py-24 sm:py-32 bg-[#0B1E28] text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#1687A7]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#C49831]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal direction="up" delay={0.1}>
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-10 h-[2px] bg-[#D4A02A]" />
              <span className="font-heading font-bold text-xs sm:text-[13px] tracking-[0.22em] text-[#D4A02A] uppercase">
                OUR VISION STATEMENT
              </span>
            </div>

            <blockquote className="font-heading font-black text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.12] mt-4">
              &ldquo;Generations of <span className="text-[#D4A02A]">Holy</span>, <span className="text-[#28ACD1]">Victorious</span>, and <span className="text-white">Fulfilled</span> People in Christ.&rdquo;
            </blockquote>

            <p className="font-body text-slate-300 text-base sm:text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto mt-8">
              We envision believers of all ages thriving in divine purpose, modeling Christ&apos;s character, and establishing kingdom influence across families, cities, and continents.
            </p>
          </Reveal>
        </div>
      </section>

      {/* SECTION 2: MISSION STATEMENT */}
      <section className="py-20 sm:py-28 bg-white border-b border-slate-100 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal direction="up" delay={0.1}>
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-10 h-[2px] bg-[#1687A7]" />
              <span className="font-heading font-bold text-xs sm:text-[13px] tracking-[0.22em] text-[#14829E] uppercase">
                OUR MISSION STATEMENT
              </span>
            </div>

            <h2 className="font-heading font-black tracking-tight text-[#0B2535] text-3xl sm:text-4xl lg:text-5xl leading-[1.15] max-w-3xl mx-auto">
              &ldquo;Raising Holy Ghost <br className="hidden sm:inline" />
              <span className="text-[#137A96]">Empowerment Generation.&rdquo;</span>
            </h2>

            <p className="font-body text-[#475569] text-base sm:text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto mt-6">
              Our mission is to equip believers with the Word and the Spirit, fostering deep spiritual maturity, ethical leadership, and transformative service in our society.
            </p>
          </Reveal>
        </div>
      </section>

      {/* SECTION 3: THE FOUR PILLARS */}
      <section className="py-20 sm:py-28 bg-[#F8FAFB] border-b border-slate-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mb-14 text-left">
            <div className="inline-flex items-center gap-3 mb-3.5">
              <div className="w-8 sm:w-10 h-[2px] bg-[#C49831]" />
              <span className="font-heading font-bold text-xs sm:text-[12.5px] tracking-[0.2em] text-[#C49831] uppercase">
                WHAT THIS MEANS
              </span>
            </div>
            <h2 className="font-heading font-black tracking-tight text-[#0B2535] text-3xl sm:text-4xl lg:text-5xl leading-[1.12]">
              The Four Pillars of Our Vision
            </h2>
            <p className="font-body text-[#475569] text-base sm:text-lg leading-relaxed mt-4">
              How the vision manifests practically in the daily lives of our members.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {fourPillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="bg-white rounded-2xl sm:rounded-3xl p-7 border border-slate-200/80 flex flex-col justify-between text-left hover:border-[#1687A7]/50 transition-colors"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-[#E8F4F8] text-[#14829E] flex items-center justify-center mb-5">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-heading font-bold text-[#C49831] tracking-[0.16em] uppercase">
                      {pillar.tagline}
                    </span>
                    <h3 className="font-heading font-black text-2xl text-[#0B2535] mt-1">
                      {pillar.title}
                    </h3>
                    <p className="font-body text-[#526071] text-sm leading-relaxed mt-3">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* SECTION 4: HOW WE LIVE THE MISSION */}
      <section className="py-20 sm:py-28 bg-white border-b border-slate-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mb-14 text-left">
            <div className="inline-flex items-center gap-3 mb-3.5">
              <div className="w-8 sm:w-10 h-[2px] bg-[#C49831]" />
              <span className="font-heading font-bold text-xs sm:text-[12.5px] tracking-[0.2em] text-[#C49831] uppercase">
                LIVING THE MISSION
              </span>
            </div>
            <h2 className="font-heading font-black tracking-tight text-[#0B2535] text-3xl sm:text-4xl lg:text-5xl leading-[1.12]">
              How We Live the Mission Daily
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {[
              {
                title: 'Through Personal Fellowship',
                desc: 'Maintaining a vibrant personal prayer life and hunger for God’s presence every day.',
              },
              {
                title: 'Through Discipleship & Groups',
                desc: 'Growing together in small life groups where believers are nurtured, challenged, and mentored.',
              },
              {
                title: 'Through Whole Living & Integrity',
                desc: 'Demonstrating Christian excellence and authentic moral character in our businesses, careers, and homes.',
              },
            ].map((item) => (
              <div key={item.title} className="p-7 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-[#1687A7]/10 text-[#14829E] flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h3 className="font-heading font-bold text-xl text-[#0B2535]">{item.title}</h3>
                  <p className="font-body text-[#64748B] text-sm leading-relaxed mt-3">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Contextual CTA */}
      <AboutCta
        eyebrow="TAKE ACTION"
        title="Let's Raise the Next Generation Together"
        description="Join us in advancing God's kingdom and raising families empowered by His Spirit."
        primaryBtnText="Join Us This Sunday"
        primaryBtnHref="/#plan-visit"
        secondaryBtnText="Explore Our Ministries"
        secondaryBtnHref="/ministries"
      />

      {/* Global Footer */}
      <Footer />
    </main>
  );
}
