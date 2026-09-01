'use client';

import React from 'react';
import Link from 'next/link';

interface ChurchLogoProps {
  className?: string;
  showText?: boolean;
}

export function ChurchLogo({ className = '', showText = true }: ChurchLogoProps) {
  return (
    <Link href="/" className={`inline-flex items-center gap-3 group select-none ${className}`}>
      {/* Mountain M geometric icon */}
      <div className="relative w-10 h-10 sm:w-11 sm:h-11 flex-shrink-0 flex items-center justify-center">
        <svg
          viewBox="0 0 54 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full transform transition-transform group-hover:scale-105"
        >
          {/* Left Teal Peak */}
          <path
            d="M5 42L22 8L31 24L22 36L12 42H5Z"
            fill="#1687A7"
          />
          {/* Right Gold Peak */}
          <path
            d="M49 42L32 8L23 24L32 36L42 42H49Z"
            fill="#D4A02A"
          />
          {/* Intersecting center overlap */}
          <path
            d="M22 8L27 16L32 8L27 2L22 8Z"
            fill="#0E637D"
            opacity="0.9"
          />
          {/* Inner accent facet */}
          <path
            d="M22 24L27 32L32 24L27 16L22 24Z"
            fill="#B8861E"
            opacity="0.85"
          />
          {/* Lower left base stroke */}
          <path
            d="M12 42L22 24L27 32L17 44L12 42Z"
            fill="#126880"
          />
          {/* Lower right base stroke */}
          <path
            d="M42 42L32 24L27 32L37 44L42 42Z"
            fill="#E5B239"
          />
        </svg>
      </div>

      {/* Brand Wordmark */}
      {showText && (
        <div className="flex flex-col justify-center text-left">
          <span className="font-heading font-extrabold text-[15px] sm:text-[17px] leading-tight tracking-[0.05em] text-[#0C2738] group-hover:text-[#1687A7] transition-colors">
            EMPOWERMENT
          </span>
          <span className="font-heading font-semibold text-[10px] sm:text-[11px] leading-tight tracking-[0.22em] text-[#C49831] mt-0.5">
            MOUNTAIN CHURCH
          </span>
        </div>
      )}
    </Link>
  );
}

export default ChurchLogo;
