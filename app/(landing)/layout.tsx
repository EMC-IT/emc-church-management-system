import React from 'react';

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-[#0B2535] font-body selection:bg-[#E8F4F8] selection:text-[#137A96]">
      {children}
    </div>
  );
}
