# Design System Master File - A2Zee
## Cooperative Gig Services Platform
**Motto:** *"Your Need. Our People. One Platform."*  
**Problem Statement ID:** 26089 (Ministry of Cooperation / NCCT)  
**Intelligence Source:** `ui-ux-pro-max` + Figma Dev Mode `A2Zee` (`pCxLJ7xeWPg0NnRltW8aH9`)

---

## 1. Verified Brand & Color Palette (Figma A2Zee Variables)

| Role | Hex | Tailwind Token | CSS Variable | WCAG Contrast Role |
| :--- | :--- | :--- | :--- | :--- |
| **Primary (Brand / Navy)** | `#1F4072` | `bg-brand-navy` | `--primary` | 8.8:1 on white (Exceeds AAA) |
| **Secondary Surface** | `#FFF3EB` | `bg-brand-cream` | `--secondary` | Card background & accent fills |
| **Peach Card Fill** | `#FFEDE0` | `bg-brand-peach` | `--surface-peach` | Subtle card borders & active tabs |
| **Text Foreground** | `#1E1E1E` | `text-brand-dark` | `--foreground` | 15.6:1 on white (AAA accessible) |
| **Muted Text** | `#757575` / `#4C4C4C` | `text-brand-muted` | `--muted` | 4.6:1 on white (AA accessible) |
| **Dividers & Borders** | `#E6E6E6` | `border-brand-border` | `--border` | Structural visual dividers |
| **Cooperative Emerald** | `#10B981` | `bg-emerald-600` | `--accent-emerald` | Success, Verified badges, 85% payout |
| **Saffron Accent** | `#F97316` | `bg-amber-500` | `--accent-saffron` | Highlights, warnings, CTAs |

---

## 2. Typography Hierarchy

- **Brand Headers & Accent Display:** `Rubik Mono One` (from Figma Dev Mode specs, uppercase tracking, bold punch)
- **Body, Inputs & Numerical Tables:** `Inter` (14px/16px, line-height 1.5, weight 400/500/600/700)
- **Code / Reference Numbers:** Monospace (`JetBrains Mono` / `ui-monospace`)

---

## 3. Mandatory UI/UX Pro Max Pre-Delivery Checklist

| Priority | Category | Rule | Implementation in A2Zee |
| :--- | :--- | :--- | :--- |
| **1** | **No Emojis as Icons** | Use SVG icons only (Lucide-React) | Replaced all category & worker emojis with Lucide SVG components (`Sparkles`, `Hammer`, `Wrench`, `Droplets`, `Zap`, `UserCheck`, `ShieldCheck`). |
| **2** | **Touch & Interaction** | Minimum 44×44px touch targets with 8px+ spacing | All buttons, chips, and inputs enforce `min-h-[44px]` with comfortable spacing. |
| **3** | **Cursor & Hover States** | `cursor-pointer` and smooth 150-300ms transitions | Added explicit `cursor-pointer`, `transition-all duration-200`, and `active:scale-[0.98]`. |
| **4** | **Accessibility (WCAG AA)** | 4.5:1 text contrast minimum & visible keyboard focus | Navy `#1F4072` (8.8:1) and dark `#1E1E1E` (15.6:1). All interactive elements use `focus-visible:ring-2 focus-visible:ring-[#1F4072]`. |
| **5** | **Reduced Motion** | Respect user motion preferences | Added `@media (prefers-reduced-motion: reduce)` in `app/globals.css`. |
| **6** | **Responsive Layout** | Mobile-first with desktop layout (375px, 768px, 1024px, 1440px) | Single codebase running seamlessly on mobile viewport and full desktop screen. |
