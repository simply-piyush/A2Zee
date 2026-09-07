'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowDown } from 'lucide-react';
import gsap from 'gsap';

export function ServicesCardDeck() {
  const containerRef = useRef(null);
  const cardsRef = useRef([]);

  const services = [
    {
      num: '01',
      title: 'Electrical & Wiring',
      description: 'Ceiling fans, switchboards, wiring short-circuit diagnosis, capacitor changes, and MCB blowout repairs by NCCT certified electricians.',
      price: 'Tariff from ₹99',
      trade: 'electrician',
      bg: 'bg-[#E8E4DC]',
      textColor: 'text-slate-900',
      baseRot: -1.5,
      baseY: 0,
    },
    {
      num: '02',
      title: 'Plumbing & Drainage',
      description: 'Continuous tap leak sealing, mechanical pipe snake drain unclogging, cistern valves, and overhead tank water supply restoration.',
      price: 'Tariff from ₹149',
      trade: 'plumbing',
      bg: 'bg-[#FF9C67]',
      textColor: 'text-slate-900',
      baseRot: 2,
      baseY: 16,
    },
    {
      num: '03',
      title: 'Carpentry & Woodwork',
      description: 'Mortise door locks, cylinder replacement, hydraulic cabinet hinges, wardrobe alignment, and master furniture craftsmanship.',
      price: 'Tariff from ₹149',
      trade: 'carpenter',
      bg: 'bg-[#E8E4DC]',
      textColor: 'text-slate-900',
      baseRot: -1.2,
      baseY: 0,
    },
    {
      num: '04',
      title: 'Appliance & Climate',
      description: 'Split AC foam jet deep cleaning, RO water purifier filter replacement, and refrigerator cooling compressor troubleshooting.',
      price: 'Tariff from ₹299',
      trade: 'technician',
      bg: 'bg-[#FF9C67]',
      textColor: 'text-slate-900',
      baseRot: 2.2,
      baseY: 14,
    },
    {
      num: '05',
      title: 'Househelp & Maid Care',
      description: 'Utensil sanitization, kitchen deep scrubbing, 2BHK/3BHK floor sweeping, antiseptic mopping, and dependable daily household care.',
      price: 'Tariff from ₹149',
      trade: 'househelp',
      bg: 'bg-[#E8E4DC]',
      textColor: 'text-slate-900',
      baseRot: -1.8,
      baseY: 0,
    },
    {
      num: '06',
      title: 'Painting & Masonry',
      description: 'Wall dampness scraping, waterproof putty touchups, exterior weather-coat, door enamel application, and structural crack sealing.',
      price: 'Tariff from ₹399',
      trade: 'painter',
      bg: 'bg-[#FF9C67]',
      textColor: 'text-slate-900',
      baseRot: 1.8,
      baseY: 16,
    },
  ];

  useEffect(() => {
    // GSAP Entry Staggered Reveal Animation
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardsRef.current,
        {
          opacity: 0,
          y: 40,
          scale: 0.95,
        },
        {
          opacity: 1,
          y: (i) => services[i]?.baseY || 0,
          rotation: (i) => services[i]?.baseRot || 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power3.out',
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // GSAP Mouse Enter / Leave Handlers
  const handleMouseEnter = (index) => {
    const card = cardsRef.current[index];
    if (!card) return;

    gsap.to(card, {
      y: (services[index]?.baseY || 0) - 14,
      rotation: 0,
      scale: 1.04,
      boxShadow: '0 24px 48px -12px rgba(31, 64, 114, 0.20)',
      duration: 0.35,
      ease: 'power2.out',
    });

    const arrow = card.querySelector('.card-arrow');
    if (arrow) {
      gsap.to(arrow, {
        x: 4,
        y: -4,
        duration: 0.25,
        ease: 'power2.out',
      });
    }
  };

  const handleMouseLeave = (index) => {
    const card = cardsRef.current[index];
    if (!card) return;

    gsap.to(card, {
      y: services[index]?.baseY || 0,
      rotation: services[index]?.baseRot || 0,
      scale: 1,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
      duration: 0.45,
      ease: 'power2.out',
    });

    const arrow = card.querySelector('.card-arrow');
    if (arrow) {
      gsap.to(arrow, {
        x: 0,
        y: 0,
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  };

  const scrollToAbout = () => {
    const el = document.getElementById('about');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="services" ref={containerRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-36 space-y-12">

      {/* Top Header matching reference image */}
      <div className="space-y-6">


        {/* Large Distinctive Bold Heading */}
        <div className="space-y-3">
          <h2 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl text-slate-950 tracking-tight">
            Household Services & Certified Karigars
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
            Direct dispatch from local primary labour cooperative societies. Every trade is audited under NCCT standards with guaranteed minimum tariffs, fair 85% worker take-home, and transparent ₹150 base inspections.
          </p>
        </div>

      </div>

      {/* The Cards Deck matching reference image */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pt-4 pb-8">
        {services.map((item, idx) => (
          <Link
            key={item.trade}
            href={`/user/create-job?trade=${item.trade}`}
            ref={(el) => (cardsRef.current[idx] = el)}
            onMouseEnter={() => handleMouseEnter(idx)}
            onMouseLeave={() => handleMouseLeave(idx)}
            className={`block ${item.bg} ${item.textColor} rounded-[32px] p-7 sm:p-8 flex flex-col justify-between min-h-[300px] sm:min-h-[100px] border border-black/5 shadow-xs transition-shadow cursor-pointer select-none group`}
            style={{
              transformOrigin: 'center center',
            }}
          >
            {/* Top Row: Number Capsule and Bold Diagonal Arrow */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-black/10 text-slate-900 tracking-wider">
                {item.num}
              </span>

            </div>

            {/* Middle: Bold Title & Editorial Copy */}
            <div className="space-y-3 my-auto py-4">
              <h3 className="font-display font-black text-2xl sm:text-3xl text-slate-950 tracking-tight leading-snug">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                {item.description}
              </p>
            </div>

            {/* Bottom Row: Fixed Tariff & Booking Action */}
            <div className="pt-4 border-t border-black/10 flex items-center justify-between text-xs font-bold">
              <span className="px-3 py-1.5 rounded-xl bg-black/10 text-slate-900 font-outfit">
                {item.price}
              </span>
              <span className="underline underline-offset-4 decoration-2 decoration-black/30 group-hover:decoration-black flex items-center gap-1">
                Book karigar
              </span>
            </div>
          </Link>
        ))}
      </div>

    </section>
  );
}
