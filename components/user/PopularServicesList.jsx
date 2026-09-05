'use client';

import React from 'react';
import { PopularServiceCard } from './PopularServiceCard';

export function PopularServicesList({
  popularServices = [],
  onServiceClick,
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg text-gray-900 tracking-tight">
          Popular Services
        </h3>
        <span className="text-xs font-normal text-gray-500">
          Hand-picked for immediate booking
        </span>
      </div>

      {/* Responsive layout: smooth horizontal scroll on mobile, 3-column grid on desktop */}
      <div className="flex sm:grid overflow-x-auto sm:overflow-visible sm:grid-cols-3 gap-4 pb-3 sm:pb-0 scrollbar-none snap-x">
        {popularServices.map((svc) => (
          <div key={svc.id} className="min-w-[260px] sm:min-w-0 flex-1 snap-start">
            <PopularServiceCard
              service={svc}
              onClick={onServiceClick}
              aspectRatio="aspect-[4/3]"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export default PopularServicesList;
