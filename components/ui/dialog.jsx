import React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export function Dialog({ isOpen, onClose, title, description, children, className }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className={cn(
          "relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-[#E6E6E6] space-y-4 animate-in zoom-in-95 duration-200",
          className
        )}
      >
        <div className="flex items-center justify-between pb-2 border-b border-[#E6E6E6]">
          <div>
            {title && <h3 className="text-lg font-bold text-[#1E1E1E]">{title}</h3>}
            {description && <p className="text-xs text-[#757575] mt-0.5">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#757575] hover:bg-slate-100 hover:text-[#1E1E1E] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
