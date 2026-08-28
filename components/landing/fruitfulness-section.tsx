'use client';

import React from 'react';
import { ArrowRight, Lightbulb, Sprout, HandHeart, Globe } from 'lucide-react';
import { Reveal, Stagger, StaggerItem } from '@/components/motion';

interface Stage {
  num: string;
  title: string;
  description: string;
  icon: React.ElementType;
}

const stages: Stage[] = [
  {
    num: '01',
    title: 'DISCOVER',
    description: 'Discover your God-given identity, spiritual gifts, and life calling in Christ.',
    icon: Lightbulb,
  },
  {
    num: '02',
    title: 'DEVELOP',
    description: 'Grow your faith, mature in Christian character, and sharpen your gifts through discipleship.',
    icon: Sprout,
  },
  {
    num: '03',
    title: 'SERVE',
    description: 'Use your skills and passion to serve God’s kingdom, edify the church, and lift others.',
    icon: HandHeart,
  },
  {
    num: '04',
    title: 'IMPACT',
    description: 'Influence communities, transform workplaces, and impact future generations for God.',
    icon: Globe,
  },
];

export function FruitfulnessSection() {
  return (
    <section className="relative w-full py-20 sm:py-28 bg-[#F8FAFB] overflow-hidden border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <Reveal direction="up" delay={0.1}>
          <div className="max-w-3xl mb-14 sm:mb-20 text-left">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-10 h-[2px] bg-[#C49831]" />
              <span className="font-heading font-bold text-xs sm:text-[13px] tracking-[0.2em] text-[#C49831] uppercase">
                FRUITFULNESS
              </span>
            </div>
            <h2 className="font-heading font-black tracking-tight text-[#0B2535] text-3xl sm:text-4xl lg:text-5xl leading-[1.1]">
              Discover Your Potential. <br className="hidden sm:inline" />
              Live With Purpose.
            </h2>
            <p className="font-body text-[#475569] text-base sm:text-lg leading-relaxed mt-4 sm:mt-6">
              God has placed gifts, purpose, and potential within every person. We encourage people to discover, develop, and use what God has given them to make a meaningful difference.
            </p>
          </div>
        </Reveal>

        {/* 4-Stage Progression Flow with Stagger */}
        <Stagger delayChildren={0.15} staggerChildren={0.09} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-8 relative">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            return (
              <StaggerItem key={stage.title}>
                <div className="flex flex-col justify-between text-left relative group h-full lg:pr-4">
                  <div>
                    {/* Step Num & Semantic Icon Badge */}
                    <div className="flex items-center gap-3.5 mb-5">
                      <span className="font-heading font-black text-3xl text-slate-300 group-hover:text-[#1687A7] transform transition-transform group-hover:translate-x-0.5 duration-200">
                        {stage.num}
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-[#14829E] group-hover:border-[#1687A7]/50 group-hover:text-[#137A96] transition-colors duration-200 shadow-sm">
                        <Icon className="w-5 h-5 stroke-[2]" />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-heading font-extrabold text-xl text-[#0B2535] tracking-tight group-hover:text-[#1687A7] transition-colors duration-200">
                      {stage.title}
                    </h3>

                    {/* Description */}
                    <p className="font-body text-[#526071] text-sm leading-relaxed mt-2.5">
                      {stage.description}
                    </p>
                  </div>

                  {/* Progress arrow indicator between steps (desktop only) */}
                  {index < stages.length - 1 && (
                    <div className="hidden lg:flex absolute -right-3 top-4 text-slate-300 pointer-events-none group-hover:text-[#1687A7] group-hover:translate-x-0.5 transition-all duration-200">
                      <ArrowRight className="w-4 h-4 stroke-[2]" />
                    </div>
                  )}
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>

      </div>
    </section>
  );
}

export default FruitfulnessSection;
