'use client';

import React from 'react';
import Link from 'next/link';
import { ChurchLogo } from './church-logo';
import { Reveal } from '@/components/motion';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#08151D] text-slate-400 font-body border-t border-slate-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Reveal direction="up" delay={0.1}>
          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-14 border-b border-slate-800/80 text-left">
            
            {/* Col 1: Brand & Contact Info */}
            <div className="lg:col-span-4 flex flex-col justify-between space-y-6">
              <div>
                {/* White-tinted Logo for Dark Background */}
                <div className="bg-white/95 p-3 rounded-2xl inline-block">
                  <ChurchLogo />
                </div>
                
                <p className="font-heading font-bold text-xs tracking-[0.18em] text-[#D4A02A] uppercase mt-4">
                  Raising Holy Ghost Empowerment Generation.
                </p>
                
                <div className="mt-4 text-xs sm:text-sm text-slate-400 space-y-1 leading-relaxed">
                  <p className="font-semibold text-slate-200">41 Number 1, Riz Junction</p>
                  <p>(Opp. Total Energies)</p>
                  <p className="pt-2 text-slate-300">
                    <span className="font-semibold text-[#28ACD1]">Sunday Services:</span> 8:00 AM & 10:30 AM
                  </p>
                </div>
              </div>
            </div>

            {/* Col 2: About */}
            <div className="lg:col-span-2">
              <h4 className="font-heading font-bold text-xs tracking-[0.2em] text-white uppercase mb-4">
                ABOUT
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    Overview
                  </Link>
                </li>
                <li>
                  <Link href="/about/our-story" className="hover:text-white transition-colors">
                    Our Story
                  </Link>
                </li>
                <li>
                  <Link href="/about/mission-vision" className="hover:text-white transition-colors">
                    Mission & Vision
                  </Link>
                </li>
                <li>
                  <Link href="/about/what-we-believe" className="hover:text-white transition-colors">
                    What We Believe
                  </Link>
                </li>
                <li>
                  <Link href="/about/leadership" className="hover:text-white transition-colors">
                    Leadership
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Connect */}
            <div className="lg:col-span-2">
              <h4 className="font-heading font-bold text-xs tracking-[0.2em] text-white uppercase mb-4">
                CONNECT
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                <li>
                  <Link href="/#plan-visit" className="hover:text-white transition-colors">
                    Plan Your Visit
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/prayer-requests" className="hover:text-white transition-colors">
                    Prayer Requests
                  </Link>
                </li>
                <li>
                  <Link href="/events" className="hover:text-white transition-colors">
                    Events
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Grow */}
            <div className="lg:col-span-2">
              <h4 className="font-heading font-bold text-xs tracking-[0.2em] text-white uppercase mb-4">
                GROW
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                <li>
                  <Link href="/ministries" className="hover:text-white transition-colors">
                    Ministries
                  </Link>
                </li>
                <li>
                  <Link href="/sermons" className="hover:text-white transition-colors">
                    Sermons
                  </Link>
                </li>
                <li>
                  <Link href="/give" className="hover:text-white transition-colors">
                    Give Online
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 5: Members & Social */}
            <div className="lg:col-span-2">
              <h4 className="font-heading font-bold text-xs tracking-[0.2em] text-white uppercase mb-4">
                MEMBERS
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm mb-6">
                <li>
                  <Link href="/login" className="hover:text-[#28ACD1] transition-colors">
                    Members Portal
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-[#28ACD1] transition-colors">
                    My Account
                  </Link>
                </li>
              </ul>

              <h4 className="font-heading font-bold text-xs tracking-[0.2em] text-white uppercase mb-3">
                SOCIAL
              </h4>
              <div className="flex flex-wrap gap-3 text-xs">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Facebook
                </a>
                <span>•</span>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Instagram
                </a>
                <span>•</span>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  YouTube
                </a>
              </div>
            </div>

          </div>

          {/* Bottom Legal Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© {currentYear} Empowerment Mountain Church. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="hover:text-slate-300 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-slate-300 transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </Reveal>

      </div>
    </footer>
  );
}

export default Footer;
