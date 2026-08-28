'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Reveal, Stagger, StaggerItem } from '@/components/motion';

interface MinistryCard {
  title: string;
  category: string;
  description: string;
  image: string;
  href: string;
}

const ministries: MinistryCard[] = [
  {
    title: 'Children & Sunday School',
    category: 'NEXT GENERATION',
    description: 'Nurturing young hearts in biblical truth, joy, and the love of Jesus Christ.',
    image: '/images/ministry-children.jpg',
    href: '/ministries',
  },
  {
    title: 'Youth & Young Adults',
    category: 'EMPOWERMENT',
    description: 'Empowering young people to discover their identity, faith, and leadership in Christ.',
    image: '/images/ministry-youth.jpg',
    href: '/ministries',
  },
  {
    title: 'Worship & Creative Arts',
    category: 'MUSIC & PRAISE',
    description: 'Leading the congregation in transformative, spirit-led praise and heartfelt adoration.',
    image: '/images/ministry-worship.jpg',
    href: '/ministries',
  },
  {
    title: 'Evangelism & Community Outreach',
    category: 'MISSION & IMPACT',
    description: 'Serving our community, sharing the gospel, and demonstrating Christ’s love in action.',
    image: '/images/ministry-outreach.jpg',
    href: '/ministries',
  },
];

export function MinistriesSection() {
  return (
    <section className="relative w-full py-20 sm:py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <Reveal direction="up" delay={0.1}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14 sm:mb-18">
            <div className="max-w-2xl text-left">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-10 h-[2px] bg-[#C49831]" />
                <span className="font-heading font-bold text-xs sm:text-[13px] tracking-[0.2em] text-[#C49831] uppercase">
                  FIND YOUR PLACE
                </span>
              </div>
              <h2 className="font-heading font-black tracking-tight text-[#0B2535] text-3xl sm:text-4xl lg:text-5xl leading-[1.1]">
                Grow Together. Serve Together.
              </h2>
              <p className="font-body text-[#475569] text-base sm:text-lg leading-relaxed mt-4">
                Discover a place to grow, build relationships, develop your gifts, and serve God&apos;s purpose.
              </p>
            </div>

            <div>
              <Link
                href="/ministries"
                className="inline-flex items-center gap-2 font-heading font-bold text-sm sm:text-base text-[#137A96] hover:text-[#0E6881] group transition-colors"
              >
                <span>Explore Ministries</span>
                <ArrowRight className="w-4 h-4 transform transition-transform group-hover:translate-x-1 duration-200" />
              </Link>
            </div>
          </div>
        </Reveal>

        {/* Ministries Grid with Stagger */}
        <Stagger delayChildren={0.15} staggerChildren={0.08} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {ministries.map((ministry) => (
            <StaggerItem key={ministry.title}>
              <div className="group h-full flex flex-col justify-between bg-white rounded-2xl border border-slate-100 overflow-hidden hover:border-[#1687A7]/40 transition-all duration-300 hover:shadow-sm">
                <div>
                  {/* Image with smooth scale hover */}
                  <div className="relative h-48 sm:h-52 w-full overflow-hidden">
                    <Image
                      src={ministry.image}
                      alt={ministry.title}
                      fill
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-5 sm:p-6 text-left">
                    <span className="text-[11px] font-heading font-bold text-[#14829E] tracking-[0.16em] uppercase">
                      {ministry.category}
                    </span>
                    <h3 className="font-heading font-bold text-lg sm:text-xl text-[#0B2535] mt-1 tracking-tight group-hover:text-[#1687A7] transition-colors duration-200">
                      {ministry.title}
                    </h3>
                    <p className="font-body text-[#526071] text-sm leading-relaxed mt-2.5">
                      {ministry.description}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-2 text-left">
                  <Link
                    href={ministry.href}
                    className="inline-flex items-center gap-1.5 font-heading font-bold text-xs tracking-wider text-[#137A96] group-hover:text-[#0E6881] uppercase transition-colors"
                  >
                    <span>Learn More</span>
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

export default MinistriesSection;
