'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeaderBackground } from '@/components/ui/header-background';

export function TopHeaderBanner({
  title,
  subtitle,
  badge,
  onBack,
  backHref,
  rightAction,
  children,
  className = '',
}) {
  const BackButtonContent = (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onBack}
      className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/15 active:scale-95 text-white transition-all cursor-pointer"
      aria-label="Go back"
    >
      <ArrowLeft className="w-6 h-6 text-white" />
    </Button>
  );

  return (
    <div
      className={`rounded-b-[36px] md:rounded-b-[48px] px-6 pt-12 sm:pt-14 pb-6 sm:pb-8 shadow-xl text-white relative z-10 overflow-hidden ${className}`}
    >
      <HeaderBackground />

      <div className="max-w-md md:max-w-4xl lg:max-w-5xl mx-auto w-full relative z-10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            {backHref ? (
              <Link href={backHref}>{BackButtonContent}</Link>
            ) : onBack ? (
              BackButtonContent
            ) : null}

            <div>
              <div className="flex items-center gap-2">
                {title && (
                  <h1 className="font-display text-xl sm:text-2xl tracking-wider uppercase text-white drop-shadow-xs">
                    {title}
                  </h1>
                )}
                {badge}
              </div>
              {subtitle && (
                <p className="text-xs text-[#A8C7FA] font-normal mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {rightAction && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {rightAction}
            </div>
          )}
        </div>

        {children && <div className="mt-4 sm:mt-6">{children}</div>}
      </div>
    </div>
  );
}

export default TopHeaderBanner;
