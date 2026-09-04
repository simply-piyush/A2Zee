import React from 'react';
import { cn } from '@/lib/utils';

export function Badge({
  className = '',
  variant = 'default',
  children,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide uppercase transition-colors';

  const variants = {
    default: 'bg-slate-100 text-slate-800 border border-slate-200',
    primary: 'bg-[#1F4072]/10 text-[#1F4072] border border-[#1F4072]/20 font-semibold',
    secondary: 'bg-slate-100 text-slate-600',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-semibold',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200/60 font-semibold',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200/60 font-semibold',
    ncct: 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold',
  };

  return (
    <span className={cn(baseStyles, variants[variant] || variants.default, className)} {...props}>
      {children}
    </span>
  );
}
