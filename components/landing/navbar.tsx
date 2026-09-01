'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  User,
  Menu,
  X,
  ChevronDown,
  BookOpen,
  Target,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { ChurchLogo } from './church-logo';
import { easings } from '@/lib/motion/transitions';

interface AboutDropdownItem {
  title: string;
  href: string;
  description: string;
  icon: React.ElementType;
}

const aboutDropdownItems: AboutDropdownItem[] = [
  {
    title: 'Our Story',
    href: '/about/our-story',
    description: 'The journey, milestones, and grace of God from our beginning.',
    icon: BookOpen,
  },
  {
    title: 'Mission & Vision',
    href: '/about/mission-vision',
    description: 'Raising a Holy Ghost empowerment generation of holy, victorious people.',
    icon: Target,
  },
  {
    title: 'What We Believe',
    href: '/about/what-we-believe',
    description: 'Our sound biblical foundation and core statement of faith in Christ.',
    icon: ShieldCheck,
  },
  {
    title: 'Leadership',
    href: '/about/leadership',
    description: 'Meet the pastoral team and ministers called to serve our church family.',
    icon: Users,
  },
];

const standardNavItems = [
  { label: 'Home', href: '/' },
  { label: 'Ministries', href: '/ministries' },
  { label: 'Events', href: '/events' },
  { label: 'Sermons', href: '/sermons' },
  { label: 'Give', href: '/give' },
  { label: 'Contact', href: '/contact' },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isAboutActive = pathname.startsWith('/about');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setAboutDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setAboutDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setAboutDropdownOpen(false);
    }, 180);
  };

  return (
    <motion.header
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: easings.editorial }}
      className="w-full pt-4 sm:pt-6 px-4 sm:px-6 lg:px-10 sticky top-0 z-50 transition-all duration-300"
    >
      <div
        className={`max-w-7xl mx-auto bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-[22px] border border-slate-100 px-5 sm:px-8 transition-all duration-300 relative ${
          scrolled
            ? 'py-3 sm:py-3.5 shadow-[0_12px_35px_rgba(0,0,0,0.08)]'
            : 'py-3.5 sm:py-4 shadow-[0_6px_25px_rgba(0,0,0,0.04)]'
        }`}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex items-center justify-between gap-4">
          {/* LEFT: Church Logo */}
          <div className="flex-shrink-0">
            <ChurchLogo />
          </div>

          {/* CENTER: Navigation Links (Desktop) */}
          <nav className="hidden xl:flex items-center space-x-7 2xl:space-x-8">
            {/* Home Link */}
            <Link
              href="/"
              className={`relative py-1 font-body text-[15px] font-medium transition-colors ${
                pathname === '/'
                  ? 'text-[#0C2738] font-semibold'
                  : 'text-[#475569] hover:text-[#0C2738]'
              }`}
            >
              Home
              {pathname === '/' && (
                <motion.span
                  layoutId="activeNavIndicator"
                  className="absolute -bottom-2 left-0 right-0 h-[2.5px] bg-[#1687A7] rounded-full"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </Link>

            {/* About Us with Mega Dropdown */}
            <div
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                onClick={() => setAboutDropdownOpen(!aboutDropdownOpen)}
                className={`relative py-1 inline-flex items-center gap-1.5 font-body text-[15px] font-medium transition-colors ${
                  isAboutActive
                    ? 'text-[#0C2738] font-semibold'
                    : 'text-[#475569] hover:text-[#0C2738]'
                }`}
                aria-expanded={aboutDropdownOpen}
                aria-haspopup="true"
              >
                <span>About Us</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    aboutDropdownOpen
                      ? 'rotate-180 text-[#137A96]'
                      : 'text-slate-400 group-hover:text-[#0C2738]'
                  }`}
                />
                {isAboutActive && (
                  <motion.span
                    layoutId="activeNavIndicator"
                    className="absolute -bottom-2 left-0 right-0 h-[2.5px] bg-[#1687A7] rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>

              {/* Mega Dropdown Menu (Anchored directly under the About Us trigger) */}
              <AnimatePresence>
                {aboutDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: easings.editorial }}
                    className="hidden xl:block absolute top-full -left-12 sm:-left-16 pt-3 z-50 w-[580px] sm:w-[620px]"
                  >
                    <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-[0_30px_70px_rgba(0,0,0,0.18)] ring-1 ring-slate-900/5">
                      
                      {/* 2x2 Grid */}
                      <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
                        {aboutDropdownItems.map((item) => {
                          const Icon = item.icon;
                          const isItemActive = pathname === item.href;
                          return (
                            <Link
                              key={item.title}
                              href={item.href}
                              onClick={() => setAboutDropdownOpen(false)}
                              className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 flex items-start gap-3.5 group text-left ${
                                isItemActive
                                  ? 'bg-[#F0F8FA] border-[#1687A7]/50 shadow-xs'
                                  : 'bg-[#F8FAFC] hover:bg-[#F0F8FA] border-slate-200/70 hover:border-[#1687A7]/40 hover:shadow-xs'
                              }`}
                            >
                              {/* Left Visual Icon Block */}
                              <div
                                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-200 shadow-xs ${
                                  isItemActive
                                    ? 'bg-[#137A96] text-white'
                                    : 'bg-white border border-slate-200/80 text-[#137A96] group-hover:bg-[#137A96] group-hover:text-white group-hover:border-[#137A96]'
                                }`}
                              >
                                <Icon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
                              </div>

                              {/* Right Content */}
                              <div className="flex-1 min-w-0">
                                {/* Title Badge */}
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-white border border-slate-200/80 group-hover:border-[#1687A7]/30 transition-colors shadow-2xs">
                                  <Icon className="w-3.5 h-3.5 text-[#137A96] flex-shrink-0" />
                                  <h4 className="font-heading font-bold text-xs sm:text-[13px] text-[#0B2535] group-hover:text-[#137A96] transition-colors leading-tight">
                                    {item.title}
                                  </h4>
                                </div>
                                <p className="font-body text-[12px] sm:text-[12.5px] text-[#64748B] leading-snug mt-2 line-clamp-2">
                                  {item.description}
                                </p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>

                      {/* Dropdown Bottom Bar */}
                      <div className="mt-3.5 pt-3.5 border-t border-slate-100 px-2 flex items-center justify-between">
                        <Link
                          href="/about"
                          onClick={() => setAboutDropdownOpen(false)}
                          className="inline-flex items-center gap-1.5 font-heading font-bold text-xs text-[#137A96] hover:text-[#0E6881] transition-colors group"
                        >
                          <span>Explore About Us Overview</span>
                          <ArrowRight className="w-3.5 h-3.5 transform transition-transform group-hover:translate-x-1 duration-200" />
                        </Link>
                        <span className="text-[11px] text-slate-400 font-body">
                          Empowerment Mountain Church
                        </span>
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Other Navigation Links */}
            {standardNavItems.slice(1).map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`relative py-1 font-body text-[15px] font-medium transition-colors ${
                    isActive
                      ? 'text-[#0C2738] font-semibold'
                      : 'text-[#475569] hover:text-[#0C2738]'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <motion.span
                      layoutId="activeNavIndicator"
                      className="absolute -bottom-2 left-0 right-0 h-[2.5px] bg-[#1687A7] rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* RIGHT: CTA Buttons (Desktop) */}
          <div className="hidden lg:flex items-center gap-3.5">
            {/* Primary CTA: Plan Your Visit */}
            <Link
              href="#plan-visit"
              className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-[#137A96] hover:bg-[#0E6881] text-white font-heading font-semibold text-[14px] transition-colors group"
            >
              <span>Plan Your Visit</span>
              <ArrowRight className="w-4 h-4 transform transition-transform group-hover:translate-x-1 duration-200" />
            </Link>

            {/* Secondary CTA: Members Portal */}
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-white hover:bg-[#F2F9FB] text-[#137A96] border border-[#137A96] font-heading font-semibold text-[14px] transition-colors"
            >
              <User className="w-4 h-4 text-[#137A96]" />
              <span>Members Portal</span>
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-xl text-[#0C2738] hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1687A7]"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="xl:hidden mt-4 pt-4 border-t border-slate-100 space-y-3 animate-in fade-in-50 slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-1.5">
              {/* Home */}
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg text-[15px] font-medium transition-colors ${
                  pathname === '/'
                    ? 'bg-[#EAF4F7] text-[#137A96] font-semibold'
                    : 'text-[#475569] hover:bg-slate-50 hover:text-[#0C2738]'
                }`}
              >
                Home
              </Link>

              {/* About Us Accordion */}
              <div>
                <button
                  type="button"
                  onClick={() => setMobileAboutOpen(!mobileAboutOpen)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[15px] font-medium transition-colors ${
                    isAboutActive
                      ? 'bg-[#EAF4F7] text-[#137A96] font-semibold'
                      : 'text-[#475569] hover:bg-slate-50 hover:text-[#0C2738]'
                  }`}
                >
                  <span>About Us</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      mobileAboutOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {mobileAboutOpen && (
                  <div className="pl-4 pr-1 py-2 space-y-1.5 border-l-2 border-[#1687A7]/30 ml-3 my-1">
                    <Link
                      href="/about"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-3 py-1.5 rounded-md text-xs font-heading font-bold uppercase tracking-wider ${
                        pathname === '/about'
                          ? 'text-[#137A96] bg-slate-100'
                          : 'text-[#475569] hover:text-[#0C2738]'
                      }`}
                    >
                      Overview Hub →
                    </Link>
                    {aboutDropdownItems.map((item) => (
                      <Link
                        key={item.title}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block px-3 py-1.5 rounded-md text-sm ${
                          pathname === item.href
                            ? 'text-[#137A96] font-semibold bg-slate-100'
                            : 'text-[#475569] hover:text-[#0C2738]'
                        }`}
                      >
                        {item.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Standard Links */}
              {standardNavItems.slice(1).map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2 rounded-lg text-[15px] font-medium transition-colors ${
                      isActive
                        ? 'bg-[#EAF4F7] text-[#137A96] font-semibold'
                        : 'text-[#475569] hover:bg-slate-50 hover:text-[#0C2738]'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
              <Link
                href="#plan-visit"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-[#137A96] hover:bg-[#0E6881] text-white font-heading font-semibold text-[14px] transition-colors"
              >
                <span>Plan Your Visit</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-white hover:bg-[#F2F9FB] text-[#137A96] border border-[#137A96] font-heading font-semibold text-[14px] transition-colors"
              >
                <User className="w-4 h-4 text-[#137A96]" />
                <span>Members Portal</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </motion.header>
  );
}

export default Navbar;
