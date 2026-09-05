'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CategoryIcon } from '@/components/ui/category-icon';

export function ServiceCategoriesGrid({
  displayedCategories = [],
  showAllCategories,
  setShowAllCategories,
  onCategoryClick,
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg text-gray-900 tracking-tight">
          Service Categories
        </h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowAllCategories(!showAllCategories)}
          className="text-xs font-normal text-gray-500 hover:text-[#1F4072] flex items-center gap-1.5 h-auto py-1 px-2.5 rounded-lg cursor-pointer"
        >
          <span>{showAllCategories ? 'Show less' : 'View all'}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showAllCategories ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {/* Grid of category cards using Shadcn Button with logo beside name */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {displayedCategories.map((cat) => (
          <Button
            key={cat.id}
            type="button"
            variant="category"
            onClick={() => onCategoryClick && onCategoryClick(cat)}
            className="group h-16 sm:h-18 w-full flex flex-row items-center justify-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-2xl bg-white hover:bg-[#FFF9F5] border border-gray-200 hover:border-[#1F4072]/40 shadow-xs hover:shadow-md active:scale-[0.98] transition-all cursor-pointer select-none text-left"
          >
            {/* Category Icon Logo beside name */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#E5EEFF] via-[#F2F6FF] to-white border border-[#1F4072]/15 flex items-center justify-center text-[#1F4072] group-hover:scale-105 group-hover:text-white group-hover:bg-[#1F4072] shadow-xs transition-all duration-200 flex-shrink-0">
              <CategoryIcon id={cat.id || cat.trade} className="w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform" />
            </div>

            {/* Category Name beside logo */}
            <span className="font-semibold text-xs sm:text-sm text-gray-800 group-hover:text-[#1F4072] transition-colors leading-tight line-clamp-2">
              {cat.label || cat.title}
            </span>
          </Button>
        ))}
      </div>
    </section>
  );
}

export default ServiceCategoriesGrid;
