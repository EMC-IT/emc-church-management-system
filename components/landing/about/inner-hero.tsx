'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Reveal } from '@/components/motion';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface InnerHeroProps {
  breadcrumbs: BreadcrumbItem[];
  eyebrow: string;
  title: string;
  description: string;
  imageSrc?: string;
  imageAlt?: string;
  children?: React.ReactNode;
}

export function InnerHero({
  breadcrumbs,
  eyebrow,
  title,
  description,
  imageSrc = '/images/about-hero.jpg',
  imageAlt = 'Empowerment Mountain Church community gathering',
  children,
}: InnerHeroProps) {
  return (
    <section className="relative w-full bg-white border-b border-slate-100 overflow-hidden pt-6 pb-12 sm:pb-16 lg:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 sm:mb-8">
          <ol className="flex items-center flex-wrap gap-2 text-xs font-body text-[#64748B]">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <li key={crumb.label} className="flex items-center gap-2">
                  {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-300 flex-shrink-0" />}
                  {crumb.href && !isLast ? (
                    <Link
                      href={crumb.href}
                      className="hover:text-[#137A96] transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className={isLast ? 'font-semibold text-[#0B2535]' : ''}>
                      {crumb.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          
          {/* Left Column: Heading & Description */}
          <div className="lg:col-span-7 text-left">
            <Reveal direction="up" delay={0.1}>
              <div className="inline-flex items-center gap-3 mb-3.5">
                <div className="w-8 sm:w-10 h-[2px] bg-[#C49831]" />
                <span className="font-heading font-bold text-xs sm:text-[12.5px] tracking-[0.2em] text-[#C49831] uppercase">
                  {eyebrow}
                </span>
              </div>

              <h1 className="font-heading font-black tracking-tight text-[#0B2535] text-3xl sm:text-5xl lg:text-[52px] leading-[1.08]">
                {title}
              </h1>

              <p className="font-body text-[#475569] text-base sm:text-lg lg:text-xl leading-relaxed mt-5 max-w-2xl">
                {description}
              </p>

              {children && <div className="mt-8">{children}</div>}
            </Reveal>
          </div>

          {/* Right Column: Editorial Photograph */}
          <div className="lg:col-span-5 relative">
            <Reveal direction="up" delay={0.25}>
              <div className="relative h-[280px] sm:h-[340px] lg:h-[380px] w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-100">
                <Image
                  src={imageSrc}
                  alt={imageAlt}
                  fill
                  priority
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
              </div>
              {/* Subtle brand color accent background patch */}
              <div className="absolute -bottom-2.5 -right-2.5 w-24 h-24 bg-[#1687A7]/10 rounded-2xl -z-10" />
            </Reveal>
          </div>

        </div>

      </div>
    </section>
  );
}

export default InnerHero;
