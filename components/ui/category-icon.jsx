import React from 'react';
import { Home, Hammer, Sparkles, Droplets, Zap, Wrench } from 'lucide-react';

const ICONS = {
  househelp: Home,
  carpenter: Hammer,
  cleaning: Sparkles,
  plumbing: Droplets,
  electrician: Zap,
  technician: Wrench,
};

export function CategoryIcon({ id, className = "w-6 h-6" }) {
  const Component = ICONS[id] || Wrench;
  return <Component className={className} />;
}
