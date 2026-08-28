'use client';

import React from 'react';
import { Calendar, MapPin, Users, Heart } from 'lucide-react';

interface InfoItem {
  icon: React.ElementType;
  label: string;
  primary: string;
  secondary: string;
}

const infoItems: InfoItem[] = [
  {
    icon: Calendar,
    label: 'JOIN US',
    primary: 'Every Sunday',
    secondary: '8:00AM & 10:30AM',
  },
  {
    icon: MapPin,
    label: 'OUR LOCATION',
    primary: '41 Number 1, Riz Junction',
    secondary: '(Opp. Total Energies)',
  },
  {
    icon: Users,
    label: 'GROW TOGETHER',
    primary: 'Life Groups & Ministries',
    secondary: 'For All Ages',
  },
  {
    icon: Heart,
    label: 'GIVE',
    primary: 'Support the Vision',
    secondary: 'Impact Generations',
  },
];

export function HeroInfoStrip() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
      <div className="bg-white rounded-2xl sm:rounded-[22px] shadow-[0_8px_35px_rgba(0,0,0,0.06)] border border-slate-200/70 py-4 sm:py-5 px-5 sm:px-7">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-0 lg:divide-x lg:divide-slate-200/70">
          {infoItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={`flex items-center gap-3.5 ${
                  index !== 0 ? 'lg:pl-6 xl:pl-8' : ''
                } ${index !== infoItems.length - 1 ? 'lg:pr-4' : ''}`}
              >
                {/* Icon Container */}
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#E8F4F8] flex items-center justify-center flex-shrink-0 text-[#14829E]">
                  <Icon className="w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[2]" />
                </div>

                {/* Info Text Content */}
                <div className="flex flex-col justify-center min-w-0">
                  <span className="text-[11px] font-heading font-bold text-[#14829E] tracking-[0.14em] uppercase mb-0.5">
                    {item.label}
                  </span>
                  <p className="font-heading font-bold text-[14px] sm:text-[15px] text-[#0C2738] leading-tight">
                    {item.primary}
                  </p>
                  <p className="font-body text-[12.5px] sm:text-[13px] text-[#526071] leading-tight mt-0.5">
                    {item.secondary}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default HeroInfoStrip;
