'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

export function ServiceCategoriesGrid({
  displayedCategories = [],
  showAllCategories,
  setShowAllCategories,
  onCategoryClick,
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-normal text-lg text-gray-800 tracking-tight">
          Service Categories
        </h3>
        <button
          type="button"
          onClick={() => setShowAllCategories(!showAllCategories)}
          className="text-xs font-normal text-gray-500 hover:text-[#1F4072] flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>view all</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAllCategories ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Grid of category cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3 md:gap-4">
        {displayedCategories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onCategoryClick(cat)}
            className="bg-white hover:bg-[#FFF9F5] border border-gray-200/80 rounded-2xl py-5 px-4 text-center shadow-sm hover:shadow-md hover:border-[#1F4072]/50 active:scale-[0.98] transition-all cursor-pointer group"
          >
            <span className="font-normal text-gray-800 text-sm md:text-base group-hover:text-[#1F4072] transition-colors">
              {cat.label}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default ServiceCategoriesGrid;
