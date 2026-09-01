import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpen, Users, Compass, ShieldCheck, Heart, Sparkles, Sprout } from 'lucide-react';
import { Navbar, Footer } from '@/components/landing';
import { InnerHero, AboutCta } from '@/components/landing/about';
import { Reveal, Stagger, StaggerItem } from '@/components/motion';

export const metadata: Metadata = {
  title: 'About Us | Empowerment Mountain Church',
  description:
    'Discover the story, mission, vision, beliefs, and pastoral leadership behind Empowerment Mountain Church in Accra, Ghana.',
};

export default function AboutOverviewPage() {
  return (
    <main className="relative min-h-screen bg-white text-[#0B2535] font-body selection:bg-[#E8F4F8] selection:text-[#137A96]">
      {/* Global Navbar */}
      <Navbar />

      {/* Hero Section */}
      <InnerHero
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'About Us' }]}
        eyebrow="ABOUT EMPOWERMENT MOUNTAIN CHURCH"
        title="A Church Built to Raise Generations"
        description="Empowerment Mountain Church exists to raise a generation empowered by the Holy Spirit, grounded in Christ, and equipped to live holy, victorious, and fulfilled lives."
        imageSrc="/images/about-hero.jpg"
        imageAlt="Empowerment Mountain Church community gathering"
      />

      {/* SECTION 2: OUR STORY PREVIEW */}
      <section className="py-20 sm:py-28 bg-white border-b border-slate-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Image */}
            <div className="lg:col-span-6 relative">
              <Reveal direction="up" delay={0.1}>
                <div className="relative h-[360px] sm:h-[420px] lg:h-[460px] w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-100">
                  <Image
                    src="/images/welcome-fellowship.jpg"
                    alt="Empowerment Mountain Church fellowship and community"
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </Reveal>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-6 text-left">
              <Reveal direction="up" delay={0.2}>
                <div className="inline-flex items-center gap-3 mb-3.5">
                  <div className="w-8 sm:w-10 h-[2px] bg-[#C49831]" />
                  <span className="font-heading font-bold text-xs sm:text-[12.5px] tracking-[0.2em] text-[#C49831] uppercase">
                    OUR STORY
                  </span>
                </div>

                <h2 className="font-heading font-black tracking-tight text-[#0B2535] text-3xl sm:text-4xl lg:text-5xl leading-[1.12]">
                  Every Generation Has a Story
                </h2>

                <p className="font-body text-[#475569] text-base sm:text-lg leading-relaxed mt-5">
                  From a small assembly with a burning hunger for God’s presence, Empowerment Mountain Church has grown into a vibrant family dedicated to spiritual intimacy, kingdom excellence, and holistic community transformation.
                </p>

                <p className="font-body text-[#64748B] text-sm sm:text-base leading-relaxed mt-3.5">
                  Our history is defined by the undeniable grace of God, answered prayers, and everyday people who stepped out in bold faith to impact nations.
                </p>

                <div className="mt-8">
                  <Link
                    href="/about/our-story"
                    className="inline-flex items-center gap-2.5 font-heading font-bold text-sm sm:text-base text-[#137A96] hover:text-[#0E6881] group transition-colors"
                  >
                    <span>Discover Our Story</span>
                    <ArrowRight className="w-4.5 h-4.5 transform transition-transform group-hover:translate-x-1 duration-200" />
                  </Link>
                </div>
              </Reveal>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 3: MISSION & VISION PREVIEW */}
      <section className="py-20 sm:py-28 bg-[#F8FAFB] border-b border-slate-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
            <div className="max-w-2xl text-left">
              <div className="inline-flex items-center gap-3 mb-3.5">
                <div className="w-8 sm:w-10 h-[2px] bg-[#C49831]" />
                <span className="font-heading font-bold text-xs sm:text-[12.5px] tracking-[0.2em] text-[#C49831] uppercase">
                  OUR PURPOSE
                </span>
              </div>
              <h2 className="font-heading font-black tracking-tight text-[#0B2535] text-3xl sm:text-4xl lg:text-5xl leading-[1.12]">
                Guiding Principles for Generations
              </h2>
            </div>

            <div>
              <Link
                href="/about/mission-vision"
                className="inline-flex items-center gap-2 font-heading font-bold text-sm sm:text-base text-[#137A96] hover:text-[#0E6881] group transition-colors"
              >
                <span>Explore Mission & Vision</span>
                <ArrowRight className="w-4 h-4 transform transition-transform group-hover:translate-x-1 duration-200" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Vision Card */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-10 border border-slate-200/80 flex flex-col justify-between text-left hover:border-[#1687A7]/40 transition-colors">
              <div>
                <span className="text-xs font-heading font-bold text-[#C49831] tracking-[0.2em] uppercase">
                  OUR VISION
                </span>
                <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0B2535] mt-3 leading-snug">
                  &ldquo;Generations of Holy, Victorious, and Fulfilled People in Christ.&rdquo;
                </h3>
              </div>
              <p className="font-body text-[#64748B] text-sm leading-relaxed mt-6 pt-5 border-t border-slate-100">
                Raising families and believers who excel in righteousness, character, and kingdom purpose.
              </p>
            </div>

            {/* Mission Card */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-10 border border-slate-200/80 flex flex-col justify-between text-left hover:border-[#1687A7]/40 transition-colors">
              <div>
                <span className="text-xs font-heading font-bold text-[#14829E] tracking-[0.2em] uppercase">
                  OUR MISSION
                </span>
                <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0B2535] mt-3 leading-snug">
                  &ldquo;Raising Holy Ghost Empowerment Generation.&rdquo;
                </h3>
              </div>
              <p className="font-body text-[#64748B] text-sm leading-relaxed mt-6 pt-5 border-t border-slate-100">
                Empowered through the Holy Spirit to minister effectively and demonstrate Christ’s love to nations.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 4: WHAT WE BELIEVE PREVIEW */}
      <section className="py-20 sm:py-28 bg-white border-b border-slate-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 text-left">
              <Reveal direction="up" delay={0.1}>
                <div className="inline-flex items-center gap-3 mb-3.5">
                  <div className="w-8 sm:w-10 h-[2px] bg-[#C49831]" />
                  <span className="font-heading font-bold text-xs sm:text-[12.5px] tracking-[0.2em] text-[#C49831] uppercase">
                    WHAT WE BELIEVE
                  </span>
                </div>

                <h2 className="font-heading font-black tracking-tight text-[#0B2535] text-3xl sm:text-4xl lg:text-5xl leading-[1.12]">
                  Rooted in Christ. Grounded in the Word.
                </h2>

                <p className="font-body text-[#475569] text-base sm:text-lg leading-relaxed mt-5">
                  Our doctrine is anchored strictly in the infallible Word of God. We believe in the transforming power of the Gospel, salvation through faith in Jesus Christ, and the continuous indwelling of the Holy Spirit.
                </p>

                <div className="mt-8">
                  <Link
                    href="/about/what-we-believe"
                    className="inline-flex items-center gap-2.5 font-heading font-bold text-sm sm:text-base text-[#137A96] hover:text-[#0E6881] group transition-colors"
                  >
                    <span>Read Our Statement of Faith</span>
                    <ArrowRight className="w-4.5 h-4.5 transform transition-transform group-hover:translate-x-1 duration-200" />
                  </Link>
                </div>
              </Reveal>
            </div>

            {/* Core Tenets Preview Grid */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              {[
                { title: 'The Holy Scriptures', desc: 'Infallible and inspired Word of God.', icon: BookOpen },
                { title: 'The Triune God', desc: 'Father, Son, and Holy Spirit in oneness.', icon: ShieldCheck },
                { title: 'Salvation in Christ', desc: 'Redemption through faith and grace alone.', icon: Heart },
                { title: 'Holy Spirit Power', desc: 'Empowered for holiness and ministry.', icon: Sparkles },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/70 flex items-center justify-center text-[#14829E] mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-base text-[#0B2535]">{item.title}</h4>
                      <p className="font-body text-xs text-[#64748B] mt-1">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 5: LEADERSHIP PREVIEW */}
      <section className="py-20 sm:py-28 bg-[#F8FAFB] border-b border-slate-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
            <div className="max-w-2xl text-left">
              <div className="inline-flex items-center gap-3 mb-3.5">
                <div className="w-8 sm:w-10 h-[2px] bg-[#C49831]" />
                <span className="font-heading font-bold text-xs sm:text-[12.5px] tracking-[0.2em] text-[#C49831] uppercase">
                  OUR LEADERSHIP
                </span>
              </div>
              <h2 className="font-heading font-black tracking-tight text-[#0B2535] text-3xl sm:text-4xl lg:text-5xl leading-[1.12]">
                People Called to Serve
              </h2>
            </div>

            <div>
              <Link
                href="/about/leadership"
                className="inline-flex items-center gap-2 font-heading font-bold text-sm sm:text-base text-[#137A96] hover:text-[#0E6881] group transition-colors"
              >
                <span>Meet Our Leadership</span>
                <ArrowRight className="w-4 h-4 transform transition-transform group-hover:translate-x-1 duration-200" />
              </Link>
            </div>
          </div>

          {/* Leaders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                name: 'Senior Pastor',
                role: 'Resident Pastor & Visionary',
                desc: 'Dedicated to teaching sound biblical doctrine and raising Holy Ghost empowered disciples.',
                image: '/images/leadership-senior-pastor.jpg',
              },
              {
                name: 'Associate Pastor',
                role: 'Pastoral Care & Discipleship',
                desc: 'Serving families, counseling believers, and cultivating strong community life groups.',
                image: '/images/leadership-pastor-2.jpg',
              },
              {
                name: 'Youth & Ministry Pastor',
                role: 'Next Gen & Outreach Director',
                desc: 'Passionate about equipping youth with purpose and leading marketplace evangelism.',
                image: '/images/leadership-pastor-3.jpg',
              },
            ].map((leader) => (
              <div
                key={leader.name}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden flex flex-col justify-between text-left hover:border-[#1687A7]/40 transition-all duration-300 hover:shadow-sm"
              >
                <div>
                  <div className="relative h-64 sm:h-72 w-full overflow-hidden">
                    <Image
                      src={leader.image}
                      alt={leader.name}
                      fill
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="p-6">
                    <span className="text-[11px] font-heading font-bold text-[#14829E] tracking-[0.16em] uppercase">
                      {leader.role}
                    </span>
                    <h3 className="font-heading font-black text-xl text-[#0B2535] mt-1">
                      {leader.name}
                    </h3>
                    <p className="font-body text-[#64748B] text-sm leading-relaxed mt-2.5">
                      {leader.desc}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2">
                  <Link
                    href="/about/leadership"
                    className="inline-flex items-center gap-1.5 font-heading font-bold text-xs tracking-wider text-[#137A96] hover:text-[#0E6881] uppercase"
                  >
                    <span>View Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION 6: CORE VALUES SUMMARY */}
      <section className="py-20 sm:py-28 bg-white border-b border-slate-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mb-14 text-left">
            <div className="inline-flex items-center gap-3 mb-3.5">
              <div className="w-8 sm:w-10 h-[2px] bg-[#C49831]" />
              <span className="font-heading font-bold text-xs sm:text-[12.5px] tracking-[0.2em] text-[#C49831] uppercase">
                WHAT SHAPES US
              </span>
            </div>
            <h2 className="font-heading font-black tracking-tight text-[#0B2535] text-3xl sm:text-4xl lg:text-5xl leading-[1.12]">
              Five Pillars of Our Faith Walk
            </h2>
            <p className="font-body text-[#475569] text-base sm:text-lg leading-relaxed mt-4">
              Our culture and community are rooted in these core values that reflect Christ&apos;s heart.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-left">
            {[
              { num: '01', title: 'THE PRESENCE OF GOD', desc: 'Spending time with God continuously.' },
              { num: '02', title: 'FAITHFULNESS', desc: 'Becoming a grower of faith & doer of the word.' },
              { num: '03', title: 'FRUITFULNESS', desc: 'Energetic striving for realisation of full potential.' },
              { num: '04', title: 'EXCELLENCE', desc: 'Being Whole: Living without flaws and defects.' },
              { num: '05', title: 'INTEGRITY', desc: 'Being whole: Crushing weaknesses and flaws.' },
            ].map((val) => (
              <div
                key={val.num}
                className="p-6 rounded-2xl bg-slate-50/80 border border-slate-100 flex flex-col justify-between hover:bg-white hover:border-[#1687A7]/40 transition-colors"
              >
                <div>
                  <span className="font-heading font-black text-2xl text-slate-300">{val.num}</span>
                  <h4 className="font-heading font-bold text-sm text-[#0B2535] mt-2 tracking-tight">
                    {val.title}
                  </h4>
                </div>
                <p className="font-body text-xs text-[#64748B] leading-relaxed mt-4">
                  {val.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION 7: FINAL CTA */}
      <AboutCta
        eyebrow="COME JOIN US"
        title="Come and Be Part of the Story"
        description="There's a place for you to encounter God, grow in faith, build meaningful relationships, and serve with purpose."
        primaryBtnText="Plan Your Visit"
        primaryBtnHref="/#plan-visit"
        secondaryBtnText="Contact Us"
        secondaryBtnHref="/contact"
      />

      {/* Global Footer */}
      <Footer />
    </main>
  );
}
