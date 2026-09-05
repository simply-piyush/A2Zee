import React from 'react';
import {
  Home,
  Hammer,
  Sparkles,
  Droplets,
  Zap,
  Wrench,
  Brush,
  Paintbrush,
  Car,
  TreeDeciduous,
  Flame,
  HardHat,
} from 'lucide-react';

/**
 * Praying hands icon (Namaste / Caregiver prayer gesture)
 * Crafted to match Lucide icon specifications (24x24 viewBox, stroke-width 2, rounded caps/joins)
 */
function PrayingHands({ className = 'w-6 h-6', ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M12 3v12" />
      <path d="M10 5.5C10 4.1 10.9 3 12 3s2 1.1 2 2.5V15l2 2.5V21h-8v-3.5l2-2.5V5.5z" />
      <path d="M8 9.5v5l-2 2" />
      <path d="M16 9.5v5l2 2" />
    </svg>
  );
}

const ICONS = {
  househelp: Home,
  carpenter: Hammer,
  carpenters: Hammer,
  cleaning: Sparkles,
  cleaners: Sparkles,
  plumbing: Droplets,
  plumber: Droplets,
  plumbers: Droplets,
  electrician: Zap,
  technician: Wrench,
  technicians: Wrench,
  appliance: Wrench,
  painter: Brush,
  painters: Brush,
  painting: Brush,
  brush: Brush,
  caregiver: PrayingHands,
  caregivers: PrayingHands,
  prayer: PrayingHands,
  praying: PrayingHands,
  driver: Car,
  drivers: Car,
  gardener: TreeDeciduous,
  gardeners: TreeDeciduous,
  tree: TreeDeciduous,
  bush: TreeDeciduous,
  welder: Flame,
  welding: Flame,
  mason: HardHat,
  masonry: HardHat,
};

export function CategoryIcon({ id, className = "w-6 h-6" }) {
  const normalizedKey = (id || '').toLowerCase().trim();
  const Component = ICONS[normalizedKey] || Wrench;
  return <Component className={className} />;
}

export default CategoryIcon;
