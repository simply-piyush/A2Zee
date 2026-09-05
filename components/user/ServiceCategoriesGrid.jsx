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
            variant="default"
            onClick={() => onCategoryClick && onCategoryClick(cat)}
            
          >
            {/* Category Icon Logo beside name */}
            

            {/* Category Name beside logo */}
            <div className="flex items-center justify-between gap-2 w-full">
              <span className="capitalize">
                {cat.label || cat.title}
              </span>
            
              <CategoryIcon id={cat.id || cat.trade} className="w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform" />
           
            </div>
          </Button>
        ))}
      </div>
    </section>
  );
}

export default ServiceCategoriesGrid;
