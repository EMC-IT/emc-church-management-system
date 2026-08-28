'use client';

import React from 'react';
import { Reveal, Stagger, StaggerItem } from '@/components/motion';

interface CoreValue {
  number: string;
  name: string;
  description: string;
}

const coreValues: CoreValue[] = [
  {
    number: '01',
    name: 'THE PRESENCE OF GOD',
    description: 'Spending time with God continuously',
  },
  {
    number: '02',
    name: 'FAITHFULNESS',
    description: 'Becoming a grower of faith & doer of the word',
  },
  {
    number: '03',
    name: 'FRUITFULNESS',
    description: 'Energetic striving for realisation of full potential',
  },
  {
    number: '04',
    name: 'EXCELLENCE',
    description: 'Being Whole: Living without flaws and defects',
  },
  {
    number: '05',
    name: 'INTEGRITY',
    description: 'Being whole: Crushing your weaknesses and flaws',
  },
];

export function CoreValuesSection() {
  return (
    <section className="relative w-full py-20 sm:py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <Reveal direction="up" delay={0.1}>
          <div className="max-w-3xl mb-14 sm:mb-20 text-left">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-10 h-[2px] bg-[#C49831]" />
              <span className="font-heading font-bold text-xs sm:text-[13px] tracking-[0.2em] text-[#C49831] uppercase">
                WHAT SHAPES US
              </span>
            </div>
            <h2 className="font-heading font-black tracking-tight text-[#0B2535] text-3xl sm:text-4xl lg:text-5xl leading-[1.1]">
              Five Values. One Way of Life.
            </h2>
            <p className="font-body text-[#475569] text-base sm:text-lg leading-relaxed mt-4 sm:mt-6">
              Our values shape how we pursue God, grow in Christ, serve others, and fulfil our purpose.
            </p>
          </div>
        </Reveal>

        {/* Editorial Values List with Stagger */}
        <Stagger delayChildren={0.15} staggerChildren={0.07} className="divide-y divide-slate-100 border-y border-slate-100">
          {coreValues.map((value) => (
            <StaggerItem key={value.number}>
              <div className="py-8 sm:py-10 group flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 transition-all duration-300 hover:bg-slate-50/70 px-4 sm:px-6 rounded-xl">
                {/* Value Number & Title */}
                <div className="flex items-baseline gap-6 sm:gap-10">
                  <span className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-300 group-hover:text-[#1687A7] transform transition-transform group-hover:translate-x-1 duration-200">
                    {value.number}
                  </span>
                  <h3 className="font-heading font-black text-xl sm:text-2xl text-[#0B2535] tracking-tight group-hover:text-[#1687A7] transition-colors duration-200">
                    {value.name}
                  </h3>
                </div>

                {/* Value Description */}
                <div className="md:max-w-md md:text-right pl-12 md:pl-0">
                  <p className="font-body text-[#526071] text-base sm:text-lg">
                    {value.description}
                  </p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

      </div>
    </section>
  );
}

export default CoreValuesSection;
