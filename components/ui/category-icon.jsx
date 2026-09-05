import React from 'react';
import { Home, Hammer, Sparkles, Droplets, Zap, Wrench, Paintbrush, Flame, HardHat } from 'lucide-react';

const ICONS = {
  househelp: Home,
  carpenter: Hammer,
  cleaning: Sparkles,
  plumbing: Droplets,
  plumber: Droplets,
  electrician: Zap,
  technician: Wrench,
  appliance: Wrench,
  painter: Paintbrush,
  painting: Paintbrush,
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
