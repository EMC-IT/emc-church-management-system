import React from 'react';
import type { Metadata } from 'next';
import { BookOpen, ShieldCheck, Heart, Sparkles, Church, Flame, CheckCircle2 } from 'lucide-react';
import { Navbar, Footer } from '@/components/landing';
import { InnerHero, AboutCta } from '@/components/landing/about';
import { Reveal } from '@/components/motion';

export const metadata: Metadata = {
  title: 'What We Believe | Empowerment Mountain Church',
  description:
    'Read our biblical foundations and core statement of faith at Empowerment Mountain Church in Accra, Ghana.',
};

const articlesOfFaith = [
  {
    num: '01',
    title: 'THE HOLY SCRIPTURES',
    scripture: '2 Timothy 3:16–17',
    summary:
      'We believe the Bible is the inspired, infallible, authoritative Word of God, and the supreme rule of faith and practice for every believer.',
  },
  {
    num: '02',
    title: 'THE TRIUNE GOD',
    scripture: 'Matthew 28:19',
    summary:
      'We believe in one God, eternally existing in three co-equal and co-eternal persons: the Father, the Son, and the Holy Spirit.',
  },
  {
    num: '03',
    title: 'JESUS CHRIST THE LORD',
    scripture: 'John 1:1–14, 1 Corinthians 15:3–4',
    summary:
      'We believe in the deity of Jesus Christ, His virgin birth, sinless life, atoning death on the cross, bodily resurrection, ascension to heaven, and personal return.',
  },
  {
    num: '04',
    title: 'SALVATION BY GRACE THROUGH FAITH',
    scripture: 'Ephesians 2:8–9, Romans 10:9–10',
    summary:
      'We believe that salvation is a free gift of God received exclusively through repentance and faith in Jesus Christ, not by human works.',
  },
  {
    num: '05',
    title: 'THE PERSON & POWER OF THE HOLY SPIRIT',
    scripture: 'Acts 1:8, Galatians 5:22–23',
    summary:
      'We believe in the active indwelling, baptism, and empowerment of the Holy Spirit for holy living, spiritual gifts, and impactful witness in the world.',
  },
  {
    num: '06',
    title: 'THE CHURCH AS THE BODY OF CHRIST',
    scripture: 'Hebrews 10:24–25, 1 Corinthians 12:12–27',
    summary:
      'We believe the Church is the universal body of born-again believers, called to gather locally for worship, discipleship, prayer, mutual edification, and world evangelism.',
  },
  {
    num: '07',
    title: 'PRAYER & COMMUNION WITH GOD',
    scripture: '1 Thessalonians 5:17, Philippians 4:6–7',
    summary:
      'We believe in the continuous privilege and power of prayer, fasting, and intercession to align our lives with God’s will and manifest His kingdom on earth.',
  },
  {
    num: '08',
    title: 'THE RESURRECTION & ETERNAL LIFE',
    scripture: 'John 14:1–3, Revelation 21:1–4',
    summary:
      'We believe in the resurrection of both the saved and the lost — the saved unto the resurrection of eternal life in God’s presence, and the lost unto eternal separation from God.',
  },
];

export default function WhatWeBelievePage() {
  return (
    <main className="relative min-h-screen bg-white text-[#0B2535] font-body selection:bg-[#E8F4F8] selection:text-[#137A96]">
      {/* Global Navbar */}
      <Navbar />

      {/* Hero */}
      <InnerHero
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'About Us', href: '/about' },
          { label: 'What We Believe' },
        ]}
        eyebrow="OUR FAITH FOUNDATION"
        title="Rooted in Christ. Grounded in His Word."
        description="Our faith shapes how we worship, how we live, how we serve, and how we relate to one another as a Christ-centered family."
        imageSrc="/images/sermon-latest.jpg"
        imageAlt="Empowerment Mountain Church pastor preaching from open Bible"
      />

      {/* SECTION 1: OUR FOUNDATION */}
      <section className="py-20 sm:py-28 bg-white border-b border-slate-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl text-left">
            <Reveal direction="up" delay={0.1}>
              <div className="inline-flex items-center gap-3 mb-3.5">
                <div className="w-8 sm:w-10 h-[2px] bg-[#C49831]" />
                <span className="font-heading font-bold text-xs sm:text-[12.5px] tracking-[0.2em] text-[#C49831] uppercase">
                  OUR FOUNDATION
                </span>
              </div>

              <h2 className="font-heading font-black tracking-tight text-[#0B2535] text-3xl sm:text-4xl lg:text-5xl leading-[1.12]">
                Sound Doctrine for Wholesome Christian Living
              </h2>

              <p className="font-body text-[#475569] text-base sm:text-lg leading-relaxed mt-5">
                At Empowerment Mountain Church, we hold fast to sound biblical doctrine that produces genuine transformation. We teach the whole counsel of God with clarity, conviction, and practical relevance for our generation.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* SECTION 2: STRUCTURED STATEMENT OF FAITH */}
      <section className="py-20 sm:py-28 bg-[#F8FAFB] border-b border-slate-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mb-14 text-left">
            <div className="inline-flex items-center gap-3 mb-3.5">
              <div className="w-8 sm:w-10 h-[2px] bg-[#C49831]" />
              <span className="font-heading font-bold text-xs sm:text-[12.5px] tracking-[0.2em] text-[#C49831] uppercase">
                STATEMENT OF FAITH
              </span>
            </div>
            <h2 className="font-heading font-black tracking-tight text-[#0B2535] text-3xl sm:text-4xl lg:text-5xl leading-[1.12]">
              Articles of Our Faith
            </h2>
          </div>

          {/* Editorial Articles List */}
          <div className="space-y-4 sm:space-y-6">
            {articlesOfFaith.map((article) => (
              <div
                key={article.num}
                className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200/80 hover:border-[#1687A7]/50 transition-colors text-left flex flex-col md:flex-row md:items-start justify-between gap-4 sm:gap-8"
              >
                <div className="flex items-start gap-4 sm:gap-6">
                  <span className="font-heading font-black text-2xl sm:text-3xl text-slate-300 flex-shrink-0 mt-0.5">
                    {article.num}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-heading font-black text-lg sm:text-xl text-[#0B2535] tracking-tight">
                        {article.title}
                      </h3>
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#E8F4F8] text-[#14829E] text-xs font-heading font-bold">
                        {article.scripture}
                      </span>
                    </div>
                    <p className="font-body text-[#526071] text-sm sm:text-base leading-relaxed mt-2.5 max-w-4xl">
                      {article.summary}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION 3: HOW WE LIVE OUR BELIEFS */}
      <section className="py-20 sm:py-28 bg-white border-b border-slate-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mb-14 text-left">
            <div className="inline-flex items-center gap-3 mb-3.5">
              <div className="w-8 sm:w-10 h-[2px] bg-[#C49831]" />
              <span className="font-heading font-bold text-xs sm:text-[12.5px] tracking-[0.2em] text-[#C49831] uppercase">
                FAITH IN ACTION
              </span>
            </div>
            <h2 className="font-heading font-black tracking-tight text-[#0B2535] text-3xl sm:text-4xl lg:text-5xl leading-[1.12]">
              Living What We Believe
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-left">
            {[
              {
                title: 'Passionate Worship',
                desc: 'Expressing heartfelt praise, adoration, and gratitude to God in spirit and in truth.',
              },
              {
                title: 'Constant Prayer',
                desc: 'Cultivating deep intimacy with God through personal devotion and corporate intercession.',
              },
              {
                title: 'Community & Generosity',
                desc: 'Loving our neighbors, supporting families in need, and advancing the gospel of Christ.',
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
        eyebrow="DISCIPLESHIP & GROWTH"
        title="Come Grow With Us in Faith"
        description="Experience teaching that grounds you in biblical truth and empowers you for victorious Christian living."
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
