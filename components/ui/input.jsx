import React from 'react';
import { cn } from '@/lib/utils';

export function Input({ className, type = 'text', ...props }) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-xl border border-[#E6E6E6] bg-white px-3.5 py-2 text-sm text-[#1E1E1E] shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#757575] focus:outline-none focus:ring-2 focus:ring-[#1F4072] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, rows = 3, ...props }) {
  return (
    <textarea
      rows={rows}
      className={cn(
        "flex w-full rounded-xl border border-[#E6E6E6] bg-white p-3.5 text-sm text-[#1E1E1E] shadow-xs transition-colors placeholder:text-[#757575] focus:outline-none focus:ring-2 focus:ring-[#1F4072] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 resize-none",
        className
      )}
      {...props}
    />
  );
}
