'use client';

import React, { useState } from 'react';
import { ChevronDown, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CategoryIcon } from '@/components/ui/category-icon';

export const ALL_WORKER_SKILLS = [
  { id: 'electrician', label: 'Electrician', trade: 'Electrician', active: true },
  { id: 'fan_repair', label: 'Fan Fixing', trade: 'Electrician', active: true },
  { id: 'mcb_wiring', label: 'MCB & Wiring', trade: 'Electrician', active: true },
  { id: 'inverter', label: 'Inverter Servicing', trade: 'Electrician', active: true },
  { id: 'appliance', label: 'Appliance Diagnostics', trade: 'Technicians', active: true },
  { id: 'lighting', label: 'Lighting Fixtures', trade: 'Electrician', active: false },
  { id: 'earthing', label: 'Earthing & Phase', trade: 'Electrician', active: false },
  { id: 'generator', label: 'Generator Backup', trade: 'Technicians', active: false },
];

export function WorkerTradeSkillsGrid({
  skills = ALL_WORKER_SKILLS,
  onSelectSkill,
}) {
  const [showAll, setShowAll] = useState(false);
  const displayedSkills = showAll ? skills : skills.slice(0, 4);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg text-gray-900 tracking-tight">
          Verified Trade Skills
        </h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowAll(!showAll)}
          className="text-xs font-normal text-gray-500 hover:text-[#1F4072] flex items-center gap-1.5 h-auto py-1 px-2.5 rounded-lg cursor-pointer"
        >
          <span>{showAll ? 'Show less' : 'View all'}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showAll ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {/* Grid of category cards using Shadcn Button with logo beside name */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {displayedSkills.map((skill) => (
          <Button
            key={skill.id}
            type="button"
            variant="default"
            onClick={() => onSelectSkill && onSelectSkill(skill)}
            className="h-14 sm:h-16 px-4 py-2 rounded-2xl bg-white hover:bg-[#FFF9F5] border border-gray-200/90 hover:border-[#1F4072]/40 text-gray-800 hover:text-[#1F4072] shadow-xs hover:shadow-md active:scale-[0.98] transition-all text-left justify-between"
          >
            <div className="flex items-center justify-between gap-2 w-full">
              <div className="min-w-0">
                <span className="capitalize text-xs sm:text-sm font-semibold block truncate font-outfit">
                  {skill.label}
                </span>
                <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>NCCT Certified</span>
                </span>
              </div>
            
              <CategoryIcon id={skill.trade || 'electrician'} className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-[#1F4072] shrink-0 transition-transform" />
            </div>
          </Button>
        ))}
      </div>
    </section>
  );
}

export default WorkerTradeSkillsGrid;
