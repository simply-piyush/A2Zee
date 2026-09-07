'use client';

import { Button } from '@/components/ui/button';
import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ServicesCardDeck } from '@/components/ui/services-card-deck';
import { LandingHeader } from '@/components/landing/LandingHeader';

export default function LandingPage() {
  return (
    <div className="pb-6 sm:pb-12 bg-[#FFF6F0]">
      {/* Branded Landing Header (Sticky Top-0) */}
      <LandingHeader />

      <div className="space-y-16 sm:space-y-24 pt-4 sm:pt-6">
        {/* ========================================================================= */}
        {/* 1. HERO SECTION: 50/50 SPLIT (LEFT: TEXT, RIGHT: MOTORCYCLE RIDER PIC)    */}
        {/* ========================================================================= */}
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <section id="home" className="relative w-full min-h-[85vh] lg:min-h-[80vh] flex items-center bg-[#FFF6F0] rounded-[36px] sm:rounded-[56px] pt-4 pb-12 sm:pt-6 sm:pb-16 lg:py-12 shadow-xs scroll-mt-24">

          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center px-6 sm:px-10 lg:px-16">

            {/* LEFT 50% (6 cols): Text Content */}
            <div className="lg:col-span-6 space-y-6 sm:space-y-7 text-center lg:text-left flex flex-col items-center lg:items-start z-10">

        
             

              {/* Headline in Outfit */}
              <h1 className="font-display font-extrabold text-4xl sm:text-6xl lg:text-7xl xl:text-8xl text-slate-950 tracking-tight uppercase leading-[0.96]">
                YOUR NEED.<br />
                <span className="text-[#1F4072]">
                  OUR PEOPLE.
                </span><br />
                ONE PLATFORM.
              </h1>

              {/* Subtitle in DM Sans */}
              <p className="font-secondary text-base sm:text-lg lg:text-xl text-slate-700 max-w-xl leading-relaxed font-normal">
                India's premier worker-owned cooperative gig marketplace. Verified karigars at your doorstep on two wheels — fair living wages, 0% corporate cut.
              </p>

              {/* Action CTAs */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-1 w-full sm:w-auto">
                <Link href="/user/create-job" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto bg-[#1F4072] hover:bg-[#163056] text-white font-display text-sm tracking-wider uppercase px-9 py-4 rounded-full shadow-lg shadow-blue-950/20 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2">
                    <span>Book a Verified Artisan</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </Link>

                <Link href="/#services" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-900 border-2 border-black font-display text-sm tracking-wider uppercase px-9 py-4 rounded-full shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer">
                    <span>Explore Services</span>
                  </button>
                </Link>
              </div>

              

            </div>

            {/* RIGHT 50% (6 cols): Motorcycle Rider Picture */}
            <div className="lg:col-span-6 relative flex items-center justify-center z-10">
              {/* Soft decorative ambient glow behind the bike */}
              <div className="absolute w-[85%] h-[85%] bg-[#1F4072]/5 rounded-full blur-3xl pointer-events-none -z-10" />

              <div className="relative w-full max-w-lg lg:max-w-none flex justify-center">
                <img
                  src="/images/hero/karigar-rider-transparent.png"
                  alt="Verified A2Zee Artisan riding motorcycle"
                  className="w-full h-auto max-h-[460px] sm:max-h-[520px] lg:max-h-[600px] object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.08)] select-none pointer-events-none transition-transform duration-700 hover:scale-[1.02]"
                  draggable={false}
                />
              </div>
            </div>

          </div>

        </section>
      </div>

      {/* ========================================================================= */}
      {/* 2. ABOUT US SECTION: EDITORIAL LAYOUT (Image 2)                            */}
      {/* ========================================================================= */}
      <section id="about" className="max-w-7xl mx-auto pb-32 px-4 sm:px-8 lg:px-8 scroll-mt-36">
        <div className="bg-white rounded-[36px] sm:rounded-[48px] p-8 sm:p-14 lg:p-20 shadow-xs border border-black/5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

            {/* LEFT COLUMN: Welcoming Artisan Character (about/image 16.png) */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              <div className="relative w-full lg:max-w-lg flex justify-center">
                <img
                  src="/about/image%2016.png"
                  alt="A2Zee Artisan"
                  className="w-full h-auto max-h-[420px] lg:max-h-[480px] object-contain select-none pointer-events-none transition-transform duration-500 hover:scale-105"
                  draggable={false}
                />
              </div>
            </div>

            {/* RIGHT COLUMN: Typography, Story, and Soft Purple Pill CTA */}
            <div className="lg:col-span-6 space-y-6 lg:pl-6 text-left">
              <span className="font-display text-[#1F4072] font-bold text-xs tracking-[0.25em] uppercase block">
                A BIT
              </span>

              <h2 className="font-display font-bold text-4xl sm:text-5xl text-slate-900 tracking-tight uppercase">
                ABOUT US
              </h2>

              <div className="space-y-4 font-secondary text-slate-600 text-sm sm:text-base leading-relaxed">
                <p>
                  A2Zee is India's first worker-owned cooperative gig platform uniting verified artisans across household trades. Founded under the guidance of the Ministry of Cooperation, we replace exploitative corporate gig commission cuts with an <strong>85% direct worker take-home formula</strong>.
                </p>
                <p>
                  Every technician is an audited member-owner of their primary labour cooperative society. We provide locked social security, tool bank support, and transparent ₹150 base inspections so you always know your money goes directly to the people who build and repair your home.
                </p>
              </div>

              <div className="pt-2">
                <Link href="/user">
                  <Button
                  variant=""
                  >
                    Discover More
                  </Button>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. HOUSEHOLD SERVICES & CERTIFIED KARIGARS: GSAP CARD DECK (Image 3)      */}
      {/* ========================================================================= */}
      <ServicesCardDeck />

      {/* ========================================================================= */}
      {/* 4. MINIMALIST BOTTOM CALL TO ACTION (User Mockup)                         */}
      {/* ========================================================================= */}
      <section id="contact" className="max-w-4xl mx-auto px-4 text-center space-y-6 pt-12 pb-20 sm:pb-28 scroll-mt-36">
        <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-slate-950 tracking-tight uppercase leading-tight">
          READY FOR DEPENDABLE HOME SERVICE?
        </h2>
        <p className="font-secondary text-sm sm:text-base text-slate-800 max-w-xl mx-auto font-medium leading-relaxed">
          Book a verified artisan in minutes or define a custom household repair with guaranteed ₹150 base diagnosis.
        </p>
        <div className="pt-2">
          <Link href="/user/create-job">
            <button className="bg-[#1F4072] hover:bg-[#163056] text-white font-display text-sm tracking-wider uppercase px-10 py-4 rounded-full shadow-lg shadow-blue-950/20 transition-all hover:scale-105 active:scale-95 cursor-pointer">
              BOOK AN ARTISIAN
            </button>
          </Link>
        </div>
      </section>

      </div>
    </div>
  );
}
