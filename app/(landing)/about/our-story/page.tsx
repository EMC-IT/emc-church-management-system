import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Flame, Heart, Globe, Sparkles, Sprout, CheckCircle2 } from 'lucide-react';
import { Navbar, Footer } from '@/components/landing';
import { InnerHero, AboutCta } from '@/components/landing/about';
import { Reveal, Stagger, StaggerItem } from '@/components/motion';

export const metadata: Metadata = {
  title: 'Our Story | Empowerment Mountain Church',
  description:
    'Discover the history, spiritual journey, milestones, and future vision of Empowerment Mountain Church in Accra, Ghana.',
};

const timelineMilestones = [
  {
    phase: 'FOUNDATION',
    title: 'A Call to Prayer & Discipleship',
    description:
      'The ministry began with a small group of believers committed to fervent prayer, spiritual depth, and seeking the manifest presence of the Holy Spirit.',
    icon: Flame,
  },
  {
    phase: 'GROWTH',
    title: 'Building a Christ-Centered Community',
    description:
      'As lives were transformed, families joined together in regular fellowship, worship services expanded, and dedicated life groups were established.',
    icon: Sprout,
  },
  {
    phase: 'EXPANSION',
    title: 'Establishing Ministries & Sanctuary',
    description:
      'Moving to 41 Number 1, Riz Junction, the church expanded its departments — including children’s Sunday school, dynamic youth gatherings, and music ministry.',
    icon: Sparkles,
  },
  {
    phase: 'IMPACT',
    title: 'Community Outreach & Generational Influence',
    description:
      'Through community care packages, hospital visitations, evangelistic campaigns, and discipleship programs, the church extended its impact across Accra and beyond.',
    icon: Globe,
  },
  {
    phase: 'THE FUTURE',
    title: 'Raising Holy Ghost Empowered Nations',
    description:
      'Looking ahead to raising whole generations of holy, victorious, and fulfilled believers who manifest Kingdom excellence in every sphere of society.',
    icon: Heart,
  },
];

export default function OurStoryPage() {
  return (
    <main className="relative min-h-screen bg-white text-[#0B2535] font-body selection:bg-[#E8F4F8] selection:text-[#137A96]">
      {/* Global Navbar */}
      <Navbar />

      {/* Hero */}
      <InnerHero
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'About Us', href: '/about' },
          { label: 'Our Story' },
        ]}
        eyebrow="OUR STORY"
        title="From a Vision to a Growing Family"
        description="Discover the journey of Empowerment Mountain Church and the people, faith, and vision that continue to shape our story."
        imageSrc="/images/welcome-fellowship.jpg"
        imageAlt="Empowerment Mountain Church congregation fellowship"
      />

      {/* SECTION 1: THE BEGINNING */}
      <section className="py-20 sm:py-28 bg-white border-b border-slate-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            <div className="lg:col-span-7 text-left">
              <Reveal direction="up" delay={0.1}>
                <div className="inline-flex items-center gap-3 mb-3.5">
                  <div className="w-8 sm:w-10 h-[2px] bg-[#C49831]" />
                  <span className="font-heading font-bold text-xs sm:text-[12.5px] tracking-[0.2em] text-[#C49831] uppercase">
                    THE BEGINNING
                  </span>
                </div>

                <h2 className="font-heading font-black tracking-tight text-[#0B2535] text-3xl sm:text-4xl lg:text-5xl leading-[1.12]">
                  Born Out of Prayer, Built on Purpose
                </h2>

                <p className="font-body text-[#475569] text-base sm:text-lg leading-relaxed mt-5">
                  Empowerment Mountain Church was founded with a singular, resolute mandate: to create an atmosphere where everyday believers encounter the authentic presence of God and are empowered to live holy, victorious, and fulfilled lives.
                </p>

                <p className="font-body text-[#64748B] text-sm sm:text-base leading-relaxed mt-4">
                  From our very first prayer meeting, God confirmed His Word with transformed hearts, healed families, and an outpouring of spiritual gifts. What started as a humble gathering has evolved into a multi-generational spiritual home at Riz Junction, Accra.
                </p>
              </Reveal>
            </div>

            <div className="lg:col-span-5 relative">
              <Reveal direction="up" delay={0.25}>
                <div className="relative h-[320px] sm:h-[380px] w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-100">
                  <Image
                    src="/images/presence-worship.jpg"
                    alt="Empowerment Mountain Church worship and altar prayer"
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                  />
                </div>
              </Reveal>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 2: OUR JOURNEY TIMELINE */}
      <section className="py-20 sm:py-28 bg-[#F8FAFB] border-b border-slate-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mb-14 sm:mb-20 text-left">
            <div className="inline-flex items-center gap-3 mb-3.5">
              <div className="w-8 sm:w-10 h-[2px] bg-[#C49831]" />
              <span className="font-heading font-bold text-xs sm:text-[12.5px] tracking-[0.2em] text-[#C49831] uppercase">
                OUR JOURNEY
              </span>
            </div>
            <h2 className="font-heading font-black tracking-tight text-[#0B2535] text-3xl sm:text-4xl lg:text-5xl leading-[1.12]">
              Milestones of God&apos;s Faithfulness
            </h2>
            <p className="font-body text-[#475569] text-base sm:text-lg leading-relaxed mt-4">
              Every chapter of our story reflects the steady grace of God guiding His people from stage to stage.
            </p>
          </div>

          {/* Timeline Grid */}
          <div className="space-y-6 sm:space-y-8">
            {timelineMilestones.map((milestone, idx) => {
              const Icon = milestone.icon;
              return (
                <div
                  key={milestone.phase}
                  className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[#1687A7]/50 transition-colors text-left"
                >
                  <div className="flex items-start gap-4 sm:gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-[#E8F4F8] text-[#14829E] flex items-center justify-center flex-shrink-0 mt-1">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-heading font-bold text-[#C49831] tracking-[0.2em] uppercase">
                        STAGE {idx + 1} • {milestone.phase}
                      </span>
                      <h3 className="font-heading font-black text-xl sm:text-2xl text-[#0B2535] mt-1 leading-snug">
                        {milestone.title}
                      </h3>
                      <p className="font-body text-[#526071] text-sm sm:text-base leading-relaxed mt-2.5 max-w-3xl">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* SECTION 3: WHAT HAS SHAPED US */}
      <section className="py-20 sm:py-28 bg-white border-b border-slate-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mb-14 text-left">
            <div className="inline-flex items-center gap-3 mb-3.5">
              <div className="w-8 sm:w-10 h-[2px] bg-[#C49831]" />
              <span className="font-heading font-bold text-xs sm:text-[12.5px] tracking-[0.2em] text-[#C49831] uppercase">
                WHAT HAS SHAPED US
              </span>
            </div>
            <h2 className="font-heading font-black tracking-tight text-[#0B2535] text-3xl sm:text-4xl lg:text-5xl leading-[1.12]">
              The Core That Drives Our Ministry
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-left">
            {[
              {
                title: 'The Presence of God',
                desc: 'Uncompromising devotion to seeking God in prayer and worship, knowing that without His presence we can accomplish nothing.',
              },
              {
                title: 'Biblical Faithfulness & Truth',
                desc: 'Standing firm on sound biblical doctrine, raising believers who know the Scriptures and live with kingdom integrity.',
              },
              {
                title: 'Generational Impact',
                desc: 'Investing intentionally in children, youth, and families so that succeeding generations know and serve the Lord.',
              },
            ].map((pillar) => (
              <div key={pillar.title} className="p-7 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-[#1687A7]/10 text-[#14829E] flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h3 className="font-heading font-bold text-xl text-[#0B2535]">{pillar.title}</h3>
                  <p className="font-body text-[#64748B] text-sm leading-relaxed mt-3">{pillar.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION 4: OUR FUTURE */}
      <section className="py-20 sm:py-28 bg-[#F8FAFB] border-b border-slate-100 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-3 mb-3.5">
            <div className="w-8 sm:w-10 h-[2px] bg-[#C49831]" />
            <span className="font-heading font-bold text-xs sm:text-[12.5px] tracking-[0.2em] text-[#C49831] uppercase">
              OUR FUTURE
            </span>
          </div>

          <h2 className="font-heading font-black tracking-tight text-[#0B2535] text-3xl sm:text-4xl lg:text-5xl leading-[1.12]">
            The Story Continues With You
          </h2>

          <blockquote className="font-heading font-extrabold text-2xl sm:text-3xl text-[#137A96] mt-6 max-w-2xl mx-auto leading-snug">
            &ldquo;Generations of Holy, Victorious, and Fulfilled People in Christ.&rdquo;
          </blockquote>

          <p className="font-body text-[#526071] text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mt-6">
            We believe the greatest chapters of Empowerment Mountain Church are still being written. We invite you to find your place in this thriving family of believers.
          </p>
        </div>
      </section>

      {/* Contextual CTA */}
      <AboutCta
        eyebrow="JOIN THE FAMILY"
        title="Be Part of the Next Chapter"
        description="Connect with us this Sunday and discover the spiritual community God is raising in this generation."
        primaryBtnText="Plan Your Visit"
        primaryBtnHref="/#plan-visit"
        secondaryBtnText="Explore Ministries"
        secondaryBtnHref="/ministries"
      />

      {/* Global Footer */}
      <Footer />
    </main>
  );
}
