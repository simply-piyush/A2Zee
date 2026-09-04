import React from 'react';
import { cn } from '@/lib/utils';

export function Button({
  className = '',
  variant = 'default',
  size = 'md',
  disabled = false,
  children,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer touch-manipulation active:scale-[0.99] select-none';

  const variants = {
    default:
      'bg-[#1F4072] text-white hover:bg-[#163056] shadow-xs border border-transparent',
    secondary:
      'bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-200',
    outline:
      'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-xs',
    ghost:
      'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
    emerald:
      'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs',
    destructive:
      'bg-rose-600 text-white hover:bg-rose-700 shadow-xs',
  };

  const sizes = {
    sm: 'h-9 px-3 text-xs gap-1.5',
    md: 'h-11 px-4 text-sm gap-2',
    lg: 'h-12 px-6 text-base gap-2.5',
    icon: 'h-10 w-10 p-0',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant] || variants.default, sizes[size] || sizes.md, className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
