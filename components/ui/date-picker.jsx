'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Shadcn-style DatePicker matching A2Zee color palette:
 * - Brand Navy: #1F4072
 * - Cream Background: #FFF6F0
 * - Accent: Transparent Primary Blue (rgba(31, 64, 114, 0.15))
 */
export function DatePicker({
  date,
  setDate,
  placeholder = 'Pick a date',
  className = '',
  minDate = new Date(),
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Normalize initial date
  const parsedDate = date instanceof Date 
    ? date 
    : (date ? new Date(date) : new Date());

  // View state for Month and Year currently shown in calendar
  const [currentMonth, setCurrentMonth] = useState(parsedDate.getMonth());
  const [currentYear, setCurrentYear] = useState(parsedDate.getFullYear());

  // Keep view in sync when selected date changes externally
  useEffect(() => {
    if (date) {
      const d = date instanceof Date ? date : new Date(date);
      if (!isNaN(d.getTime())) {
        setCurrentMonth(d.getMonth());
        setCurrentYear(d.getFullYear());
      }
    }
  }, [date]);

  // Click outside listener to close popover
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle month navigation
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Generate calendar days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const calendarDays = [];

  // Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      month: currentMonth - 1,
      year: currentMonth === 0 ? currentYear - 1 : currentYear,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push({
      day: d,
      month: currentMonth,
      year: currentYear,
      isCurrentMonth: true,
    });
  }

  // Next month leading days (to fill 35 or 42 grid slots)
  const remainingSlots = (7 - (calendarDays.length % 7)) % 7;
  for (let d = 1; d <= remainingSlots; d++) {
    calendarDays.push({
      day: d,
      month: currentMonth + 1,
      year: currentMonth === 11 ? currentYear + 1 : currentYear,
      isCurrentMonth: false,
    });
  }

  // Check if day is selected
  const isSelected = (dObj) => {
    if (!date) return false;
    const d = date instanceof Date ? date : new Date(date);
    return (
      d.getDate() === dObj.day &&
      d.getMonth() === dObj.month &&
      d.getFullYear() === dObj.year
    );
  };

  // Check if day is today
  const isToday = (dObj) => {
    const today = new Date();
    return (
      today.getDate() === dObj.day &&
      today.getMonth() === dObj.month &&
      today.getFullYear() === dObj.year
    );
  };

  // Check if day is disabled (e.g. earlier than minDate without time comparison)
  const isDayDisabled = (dObj) => {
    if (!minDate) return false;
    const cellDate = new Date(dObj.year, dObj.month, dObj.day, 23, 59, 59);
    const startOfMinDate = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
    return cellDate < startOfMinDate;
  };

  const handleSelectDay = (dObj) => {
    if (isDayDisabled(dObj)) return;
    const newDate = new Date(dObj.year, dObj.month, dObj.day);
    setDate(newDate);
    setIsOpen(false);
  };

  // Formatting date string for display in trigger
  const formatDisplayDate = (d) => {
    if (!d) return null;
    const target = d instanceof Date ? d : new Date(d);
    if (isNaN(target.getTime())) return null;
    return target.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className={cn('relative inline-block w-full', className)} ref={containerRef}>
      {/* Shadcn-style Button Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between text-left font-normal text-sm sm:text-base py-3.5 px-4 bg-white text-gray-900 border-2 border-gray-300 hover:border-[#1F4072] rounded-2xl shadow-sm transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1F4072]',
          !date && 'text-gray-400',
          isOpen && 'border-[#1F4072] ring-2 ring-[#1F4072]/20',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span className="flex items-center gap-2.5 truncate">
          <CalendarIcon className="w-4 h-4 text-[#1F4072] shrink-0" />
          <span className="truncate">
            {formatDisplayDate(date) || placeholder}
          </span>
        </span>
        <span className="text-xs font-normal text-[#1F4072] bg-[#FFF6F0] px-2 py-0.5 rounded-lg border border-[#1F4072]/15 shrink-0 ml-2">
          {date ? `${new Date(date).getDate()} ${MONTH_NAMES[new Date(date).getMonth()].slice(0, 3)}` : 'Select'}
        </span>
      </button>

      {/* Shadcn-style Popover Content Calendar */}
      {isOpen && (
        <div 
          className="absolute left-0 z-50 mt-2 w-72 sm:w-80 bg-white rounded-2xl border-2 border-[#1F4072] shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-150"
          style={{
            boxShadow: '0 16px 40px -10px rgba(31, 64, 114, 0.25)'
          }}
        >
          {/* Calendar Header with Month/Year and navigation arrows */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h4 className="font-display text-sm tracking-wider uppercase text-[#1F4072]">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h4>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-600 hover:bg-[#FFF6F0] hover:text-[#1F4072] active:scale-95 transition-all border border-gray-200"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={nextMonth}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-600 hover:bg-[#FFF6F0] hover:text-[#1F4072] active:scale-95 transition-all border border-gray-200"
                aria-label="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 py-2 text-center text-xs font-normal text-gray-400 uppercase tracking-wider">
            {DAYS_OF_WEEK.map((d, i) => (
              <div key={i} className="h-6 flex items-center justify-center">
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-sm font-normal">
            {calendarDays.map((dObj, idx) => {
              const selected = isSelected(dObj);
              const disabledDay = isDayDisabled(dObj);
              const today = isToday(dObj);

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={disabledDay}
                  onClick={() => handleSelectDay(dObj)}
                  className={cn(
                    'h-9 w-full rounded-xl flex items-center justify-center text-xs font-normal transition-all cursor-pointer select-none',
                    // Current Month vs outside month
                    dObj.isCurrentMonth ? 'text-gray-800' : 'text-gray-300',
                    // Hover state for interactive cells
                    !disabledDay && !selected && 'hover:bg-[#1F4072]/10 hover:text-[#1F4072] active:scale-95',
                    // Today marker
                    today && !selected && 'border-2 border-[#1F4072] text-[#1F4072] font-medium',
                    // Selected state
                    selected && 'bg-[#1F4072] text-white font-medium shadow-md hover:bg-[#163056]',
                    // Disabled state
                    disabledDay && 'text-gray-200 opacity-40 cursor-not-allowed hover:bg-transparent'
                  )}
                >
                  {dObj.day}
                </button>
              );
            })}
          </div>

          {/* Quick Select Buttons (Today & Tomorrow) */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100 text-xs">
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                setDate(today);
                setIsOpen(false);
              }}
              className="px-2.5 py-1 rounded-lg text-[#1F4072] font-bold hover:bg-[#FFF6F0] transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                setDate(tomorrow);
                setIsOpen(false);
              }}
              className="px-2.5 py-1 rounded-lg text-[#1F4072] font-bold hover:bg-[#FFF6F0] transition-colors cursor-pointer"
            >
              Tomorrow
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DatePicker;
