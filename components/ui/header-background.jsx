'use client';

import React from 'react';

/**
 * Reusable Header Background Component with dimmed wavy pattern
 * Uses primary brand blue (#1F4072) with its lighter blue variant (#3B82F6).
 *
 * @param {Object} props
 * @param {string} [props.className] - Additional classes for the container
 * @param {string} [props.patternOpacity='opacity-25'] - Opacity class for dimming the wavy pattern
 * @param {string} [props.baseGradient] - Base background gradient or color
 * @param {boolean} [props.showVignette=true] - Whether to show the black depth/vignette gradient overlay
 * @param {React.ReactNode} [props.children] - Optional overlay children
 */
export function HeaderBackground({
  className = '',
  patternOpacity = 'opacity-25',
  baseGradient = 'bg-gradient-to-br from-[#275294] via-[#1F4072] to-[#1A3865]',
  showVignette = false,
  children,
}) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none select-none overflow-hidden ${baseGradient} ${className}`}
      aria-hidden="true"
    >
      {/* Dimmed Wavy Radial Pattern Layer */}
      <div className={`absolute inset-0 header-wavy-pattern ${patternOpacity}`} />

      {/* Optional Vignette Overlay (disabled by default) */}
      {showVignette && (
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/25" />
      )}

      {children}
    </div>
  );
}

export default HeaderBackground;
