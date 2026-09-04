'use client';

import React from 'react';

export function PopularServicesList({
  popularServices = [],
  onServiceClick,
}) {
  return (
    <section className="space-y-4">
      <h3 className="font-normal text-lg text-gray-800 tracking-tight">
        Popular Services
      </h3>

      <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-none snap-x">
        {popularServices.map((svc) => (
          <div
            key={svc.id}
            onClick={() => onServiceClick(svc)}
            className="min-w-[240px] md:min-w-[280px] bg-[#E2E2E2] hover:bg-[#D8D8D8] rounded-2xl p-6 flex items-center justify-center text-center shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.99] transition-all cursor-pointer snap-start"
          >
            <span className="font-display text-lg md:text-xl text-black tracking-wide uppercase leading-tight">
              {svc.title}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default PopularServicesList;
