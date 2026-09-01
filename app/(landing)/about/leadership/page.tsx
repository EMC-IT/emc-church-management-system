import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, HeartHandshake, ShieldCheck, Sparkles, Flame, CheckCircle2 } from 'lucide-react';
import { Navbar, Footer } from '@/components/landing';
import { InnerHero, AboutCta } from '@/components/landing/about';
import { Reveal, Stagger, StaggerItem } from '@/components/motion';

export const metadata: Metadata = {
  title: 'Leadership | Empowerment Mountain Church',
  description:
    'Meet the pastors, ministers, and leadership team serving Empowerment Mountain Church in Accra, Ghana.',
};

const pastoralTeam = [
  {
    name: 'Associate Pastor',
    role: 'Pastoral Care & Counseling',
    description:
      'Serving church families through spiritual mentorship, pastoral counseling, and nurturing vibrant small life groups.',
    image: '/images/leadership-pastor-2.jpg',
  },
  {
    name: 'Youth & Young Adults Pastor',
    role: 'Next Generation & Discipleship',
    description:
      'Guiding young adults, students, and emerging professionals to discover their God-given identity and marketplace influence.',
    image: '/images/leadership-pastor-3.jpg',
  },
  {
    name: 'Children & Family Director',
    role: 'Sunday School & Family Ministry',
    description:
      'Leading a passionate team of Sunday school teachers to raise children grounded in biblical wisdom and joyful faith.',
    image: '/images/ministry-children.jpg',
  },
  {
    name: 'Music & Worship Director',
    role: 'Worship & Creative Arts',
    description:
      'Directing the choir and musicians in spirit-led, transformative praise and worship that ushers in God’s presence.',
    image: '/images/ministry-worship.jpg',
  },
];

export default function LeadershipPage() {
  return (
    <main className="relative min-h-screen bg-white text-[#0B2535] font-body selection:bg-[#E8F4F8] selection:text-[#137A96]">
      {/* Global Navbar */}
      <Navbar />

      {/* Hero */}
      <InnerHero
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'About Us', href: '/about' },
          { label: 'Leadership' },
        ]}
        eyebrow="SERVANT LEADERSHIP"
        title="Servants Called to Lead"
        description="Meet the pastors and leaders who serve our church family and help advance the mission God has entrusted to us."
        imageSrc="/images/leadership-senior-pastor.jpg"
        imageAlt="Empowerment Mountain Church lead pastor in study"
      />

      {/* SECTION 1: SENIOR LEADERSHIP FEATURE */}
      <section className="py-20 sm:py-28 bg-white border-b border-slate-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-[#F8FAFB] rounded-3xl p-8 sm:p-12 lg:p-16 border border-slate-200/80">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              
              {/* Leader Portrait */}
              <div className="lg:col-span-5 relative">
                <Reveal direction="up" delay={0.1}>
                  <div className="relative h-[380px] sm:h-[460px] w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_12px_35px_rgba(0,0,0,0.08)] border border-slate-100">
                    <Image
                      src="/images/leadership-senior-pastor.jpg"
                      alt="Senior Pastor at Empowerment Mountain Church"
                      fill
                      priority
                      className="object-cover object-center"
                      sizes="(max-width: 1024px) 100vw, 40vw"
                    />
                  </div>
                </Reveal>
              </div>

              {/* Leader Biography & Vision */}
              <div className="lg:col-span-7 text-left">
                <Reveal direction="up" delay={0.2}>
                  <div className="inline-flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-[#C49831]" />
                    <span className="font-heading font-bold text-xs tracking-[0.2em] text-[#C49831] uppercase">
                      SENIOR PASTOR & VISIONARY
                    </span>
                  </div>

                  <h2 className="font-heading font-black tracking-tight text-[#0B2535] text-3xl sm:text-4xl lg:text-5xl leading-[1.12]">
                    Senior Pastor
                  </h2>

                  <p className="font-body text-[#475569] text-base sm:text-lg leading-relaxed mt-5">
                    Called with an apostolic and prophetic mandate to raise Holy Ghost empowered generations, the Senior Pastor provides spiritual vision, doctrinal oversight, and servant leadership to Empowerment Mountain Church.
                  </p>

                  <p className="font-body text-[#64748B] text-sm sm:text-base leading-relaxed mt-4">
                    With a deep passion for prayer, biblical discipleship, and developing leaders of integrity, the pastoral mandate emphasizes raising believers who excel in righteousness and impact society.
                  </p>

                  <div className="mt-8 pt-6 border-t border-slate-200/60 flex flex-wrap gap-4 text-xs font-heading font-bold tracking-wider text-[#14829E] uppercase">
                    <span>SPIRITUAL OVERSIGHT</span>
                    <span>•</span>
                    <span>TEACHING & DISCIPLESHIP</span>
                    <span>•</span>
                    <span>LEADERSHIP DEVELOPMENT</span>
                  </div>
                </Reveal>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* SECTION 2: PASTORAL & MINISTRY TEAM */}
      <section className="py-20 sm:py-28 bg-white border-b border-slate-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mb-14 sm:mb-18 text-left">
            <div className="inline-flex items-center gap-3 mb-3.5">
              <div className="w-8 sm:w-10 h-[2px] bg-[#C49831]" />
              <span className="font-heading font-bold text-xs sm:text-[12.5px] tracking-[0.2em] text-[#C49831] uppercase">
                PASTORAL TEAM
              </span>
            </div>
            <h2 className="font-heading font-black tracking-tight text-[#0B2535] text-3xl sm:text-4xl lg:text-5xl leading-[1.12]">
              Ministers Serving the Family
            </h2>
            <p className="font-body text-[#475569] text-base sm:text-lg leading-relaxed mt-4">
              Our dedicated pastoral team works together to shepherd, teach, and equip every member of the church.
            </p>
          </div>

          {/* Team Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {pastoralTeam.map((leader) => (
              <div
                key={leader.name}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden flex flex-col justify-between text-left hover:border-[#1687A7]/50 transition-all duration-300 hover:shadow-sm"
              >
                <div>
                  <div className="relative h-60 sm:h-64 w-full overflow-hidden">
                    <Image
                      src={leader.image}
                      alt={leader.name}
                      fill
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
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
                      {leader.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION 3: LEADERSHIP PHILOSOPHY */}
      <section className="py-20 sm:py-28 bg-[#F8FAFB] border-b border-slate-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mb-14 text-left">
            <div className="inline-flex items-center gap-3 mb-3.5">
              <div className="w-8 sm:w-10 h-[2px] bg-[#C49831]" />
              <span className="font-heading font-bold text-xs sm:text-[12.5px] tracking-[0.2em] text-[#C49831] uppercase">
                OUR PHILOSOPHY
              </span>
            </div>
            <h2 className="font-heading font-black tracking-tight text-[#0B2535] text-3xl sm:text-4xl lg:text-5xl leading-[1.12]">
              Leading Through Service
            </h2>
            <p className="font-body text-[#475569] text-base sm:text-lg leading-relaxed mt-4">
              Biblical leadership is modeled after Christ, who came not to be served, but to serve.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-left">
            {[
              {
                title: 'Humility & Integrity',
                desc: 'Leading by example with transparent character, moral accountability, and humble hearts.',
                icon: ShieldCheck,
              },
              {
                title: 'Kingdom Excellence',
                desc: 'Striving for highest quality in all ministry operations, honoring God through wholehearted diligence.',
                icon: Sparkles,
              },
              {
                title: 'Empowering Others',
                desc: 'Equipping saints for the work of ministry, mentoring emerging leaders, and raising successors in faith.',
                icon: HeartHandshake,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="p-8 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-[#E8F4F8] text-[#14829E] flex items-center justify-center mb-5">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-heading font-black text-xl text-[#0B2535]">{item.title}</h3>
                    <p className="font-body text-[#64748B] text-sm leading-relaxed mt-3">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Contextual CTA */}
      <AboutCta
        eyebrow="SERVE WITH US"
        title="There's a Place for You Here"
        description="Connect with our pastoral team, join a department, and use your God-given gifts to serve."
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
