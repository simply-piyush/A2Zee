'use client';

import React from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { useAdmin } from './AdminContext';

export function AdminCanvas({ 
  title, 
  subtitle, 
  icon: Icon, 
  badgeCount, 
  children,
  headerAction = null,
}) {
  const { 
    actionNotice, 
    setActionNotice, 
    actionNoticeType 
  } = useAdmin();

  return (
    <main className="flex-1 flex flex-col min-w-0 min-h-0 bg-[#F0F3F8] rounded-2xl sm:rounded-3xl md:rounded-[28px] border border-slate-200/90 shadow-2xl m-2 sm:m-3 md:m-4 md:ml-1 mb-2 sm:mb-3 md:mb-4 overflow-hidden z-10">
      
      {/* Sticky Canvas Header Bar */}
      <div className="px-4 sm:px-6 py-3.5 bg-white/95 backdrop-blur-md border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="w-8 h-8 rounded-xl bg-[#1F4072]/10 text-[#1F4072] flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 stroke-[2.2]" />
            </div>
          )}
          <div>
            <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight font-display flex items-center gap-2">
              <span>{title}</span>
              {badgeCount !== undefined && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
                  {badgeCount}
                </span>
              )}
            </h1>
            {subtitle && (
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Optional Custom Header Action */}
        {headerAction && (
          <div className="flex items-center gap-2">
            {headerAction}
          </div>
        )}
      </div>

      {/* Scrollable Interior Canvas Content: Displays ONLY its specific tab function */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6 space-y-6">
        
        {/* Action Confirmation Toast Notice */}
        {actionNotice && (
          <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-3 shadow-xs animate-in fade-in slide-in-from-top-2 duration-200 ${
            actionNoticeType === 'success'
              ? 'bg-blue-50 border-blue-200 text-[#1F4072]'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#1F4072] shrink-0" />
              <span>{actionNotice}</span>
            </div>
            <button 
              type="button" 
              onClick={() => setActionNotice('')} 
              className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Injected View Content */}
        {children}

      </div>

    </main>
  );
}
