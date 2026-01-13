# Design System - Refined Functional

> Modern productivity SaaS design inspired by Calendly, Linear, and Notion
>
> **Rating:** 8.5-9/10
> **Aesthetic:** Clean, functional, polished - not luxury, just professional

---

## 🎨 Design Philosophy

**"Refined Functional"** - Design that shows craftsmanship through subtle details and micro-interactions, without being flashy or luxury-oriented. Perfect for B2B SaaS tools.

**Key Principles:**
- Clarity over decoration
- Consistency over creativity
- Polish over complexity
- Function over form

---

## 🎭 Typography

### Font Family

```tsx
// Primary: Outfit (geometric, modern, friendly)
font-outfit // For all headings (h1-h6), titles, stats

// Body: System Stack (optimized performance)
font-sans // Default for body text, descriptions
```

### Font Weights & Sizes

```tsx
// Headings
text-2xl font-outfit font-bold tracking-tight     // Page titles
text-xl font-outfit font-bold                      // Card titles (large)
text-lg font-outfit font-semibold                  // Card titles (medium)

// Section Headers
text-sm font-semibold text-gray-500 uppercase tracking-wider

// Stats Numbers
text-4xl font-outfit font-bold tracking-tight     // Large stats

// Body
text-sm font-medium text-gray-600                  // Descriptions
text-xs font-semibold uppercase tracking-wide      // Labels
```

---

## 🎨 Color Palette

### Primary Colors

```tsx
// Blue - Primary Actions
blue-600: #2563eb   // Primary buttons, main actions
blue-700: #1d4ed8   // Hover states
blue-50: #eff6ff    // Light backgrounds
blue-500: #3b82f6   // Icons, accents

// Teal - Secondary/Accent
teal-600: #0d9488   // Secondary actions, alternating colors
teal-700: #0f766e   // Hover states
teal-50: #f0fdfa    // Light backgrounds
teal-500: #14b8a6   // Icons, accents
```

### Neutral Colors

```tsx
// Gray Scale
gray-900: #111827   // Primary text
gray-800: #1f2937   // Secondary text
gray-700: #374151   // Tertiary text
gray-600: #4b5563   // Muted text
gray-500: #6b7280   // Section headers
gray-400: #9ca3af   // Disabled text
gray-300: #d1d5db   // Borders
gray-200: #e5e7eb   // Dividers
gray-100: #f3f4f6   // Subtle backgrounds
gray-50: #f9fafb    // Page background
```

### Status Colors

```tsx
// Success
green-50: #f0fdf4
green-600: #059669

// Warning
amber-50: #fffbeb
amber-600: #d97706

// Error
red-50: #fef2f2
red-500: #ef4444
red-600: #dc2626

// Info
blue-50: #eff6ff
blue-600: #2563eb
```

---

## 📦 Components

### ModernCard

```tsx
// Base Card
<ModernCard>
  className: "rounded-xl border border-gray-200/60 bg-white shadow-soft"
  hover: "shadow-medium border-gray-300/80 -translate-y-0.5"
  transition: "all duration-300 ease-out"
</ModernCard>

// Usage
<ModernCard className="group">
  <ModernCardHeader>
    <ModernCardTitle className="font-outfit">Title</ModernCardTitle>
    <ModernCardDescription>Description</ModernCardDescription>
  </ModernCardHeader>
  <ModernCardContent>
    Content here
  </ModernCardContent>
</ModernCard>
```

### Buttons

```tsx
// Primary
<Button>                          // Blue gradient, shadow-soft, active scale
<Button variant="destructive">    // Red, for delete actions
<Button variant="outline">        // Border, gray, for secondary actions
<Button variant="ghost">          // No background, for tertiary
<Button size="sm">                // Smaller, rounded-lg
<Button size="icon">              // Square, for icons

// Button states
default: shadow-soft hover:shadow-medium active:scale-[0.98]
```

### Stats Cards

```tsx
// Enhanced stats card with gradient icons
<ModernCard className="overflow-hidden relative">
  {/* Hover background */}
  <div className="absolute inset-0 bg-blue-50/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

  <ModernCardHeader className="pb-4 relative">
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Label</p>
        <p className="text-4xl font-outfit font-bold text-gray-900 tracking-tight">Value</p>
      </div>
      <div className="relative p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-soft transition-transform duration-300 group-hover:scale-110 group-hover:shadow-medium">
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
  </ModernCardHeader>
</ModernCard>
```

### Headers

```tsx
// Sticky header with backdrop blur
<header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 sticky top-0 z-10">
  <div className="container mx-auto max-w-6xl px-8 py-4 flex items-center">
    <div className="flex items-center gap-4">
      <Link href="/">
        <Button variant="ghost" size="icon">
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </Link>
      <div>
        <h1 className="text-2xl font-outfit font-bold text-gray-900 tracking-tight">
          Page Title
        </h1>
        <p className="text-sm font-medium text-gray-500">
          Subtitle
        </p>
      </div>
    </div>
  </div>
</header>
```

### Section Headers

```tsx
// Uppercase section titles
<h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
  Section Title
</h2>
```

---

## 🎭 Shadows

```tsx
// Shadow System
shadow-soft: "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)"
shadow-medium: "0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.06)"
shadow-lift: "0 8px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08)"

// Glow effects (for hover states)
shadow-glow-blue: "0 0 0 3px rgba(37, 99, 235, 0.1), 0 4px 16px rgba(37, 99, 235, 0.2)"
shadow-glow-teal: "0 0 0 3px rgba(13, 148, 136, 0.1), 0 4px 16px rgba(13, 148, 136, 0.2)"
```

---

## 🎬 Animations

```tsx
// Fade in
animate-fade-in
@keyframes fadeIn {
  0%: opacity-0
  100%: opacity-1
}

// Slide up
animate-slide-up
@keyframes slideUp {
  0%: transform-translateY(10px) opacity-0
  100%: transform-translateY(0) opacity-1
}

// Scale in
animate-scale-in
@keyframes scaleIn {
  0%: transform-scale(0.95) opacity-0
  100%: transform-scale(1) opacity-1
}

// Staggered delays
style={{ animationDelay: `${index * 50}ms` }}
```

---

## 🎯 Spacing System

```tsx
// Consistent spacing (8pt grid)
gap-2: 0.5rem (8px)
gap-3: 0.75rem (12px)
gap-4: 1rem (16px)
gap-6: 1.5rem (24px)
gap-8: 2rem (32px)

// Page margins
container max-w-6xl px-6 lg:px-8
mt-8 space-y-8  // Sections
mt-12           // Legacy (avoid in new code)
```

---

## 🎨 Gradients

```tsx
// Icon backgrounds
bg-gradient-to-br from-blue-600 to-blue-700
bg-gradient-to-br from-teal-600 to-teal-700
bg-gradient-to-br from-blue-500 to-blue-600
bg-gradient-to-br from-teal-500 to-teal-600

// Page backgrounds
bg-gradient-to-br from-gray-50 to-gray-100/50

// Glow effects (backdrop)
bg-gradient-to-br from-blue-600 to-teal-600 rounded-xl blur-md opacity-40
```

---

## 🎭 Border Radius

```tsx
rounded-xl: 14px    // Cards, buttons (default)
rounded-lg: 12px    // Icons, smaller elements
rounded-md: 8px     // Small buttons
```

---

## 🎯 Hover States

```tsx
// Cards
hover:shadow-medium hover:border-gray-300/80 hover:-translate-y-0.5

// Buttons
hover:shadow-medium active:scale-[0.98]

// Icons
group-hover:scale-110 group-hover:shadow-medium

// Arrows/Indicators
group-hover:text-gray-600 group-hover:translate-x-1
```

---

## 📐 Layout Patterns

### Page Structure

```tsx
<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50 pb-20 lg:pb-4">
  <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 sticky top-0 z-10">
    {/* Header content */}
  </header>

  <main className="container mx-auto px-6 max-w-6xl mt-8 space-y-10">
    {/* Section 1 */}
    <div>
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
        Section Title
      </h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Cards */}
      </div>
    </div>

    {/* Section 2 */}
    {/* ... */}
  </main>
</div>
```

### Grid Layouts

```tsx
// Stats (responsive 2-4 columns)
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">

// Cards (responsive 1-3 columns)
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

// Quick actions (1-2 columns)
<div className="grid gap-4 md:grid-cols-2">
```

---

## ✅ Usage Guidelines

### Do's ✅
- Use Outfit for all headings and titles
- Use uppercase section headers with tracking-wider
- Apply hover states to interactive elements
- Use staggered animations for lists
- Maintain 8pt grid spacing
- Use gradient icons for visual interest
- Apply shadow-soft as default, shadow-medium on hover

### Don'ts ❌
- Don't mix font families in headings
- Don't use text-3xl without font-outfit
- Don't use arbitrary spacing (use 8pt grid)
- Don't use solid colors for primary buttons (use gradients)
- Don't skip hover states on cards
- Don't use heavy animations (keep it subtle)

---

## 🚀 Implementation Checklist

When creating new features:

- [ ] Headers use Outfit font with tracking-tight
- [ ] Section titles are uppercase with tracking-wider
- [ ] Cards have shadow-soft and hover states
- [ ] Buttons follow the variant system
- [ ] Icons use gradient backgrounds where appropriate
- [ ] Spacing follows 8pt grid
- [ ] Hover states include subtle transforms
- [ ] Animations use staggered delays
- [ ] Page has sticky header with backdrop-blur
- [ ] Layout uses container max-w-6xl

---

## 📝 Examples

See implemented pages:
- `app/page.tsx` - Home with enhanced stats cards
- `app/clientes/page.tsx` - List page with refined cards
- `app/veiculos/page.tsx` - Grid layout
- `app/servicos/page.tsx` - Service catalog
- `app/agendamentos/page.tsx` - Timeline view

Component files:
- `components/ui/modern-card.tsx` - Card system
- `components/ui/button.tsx` - Button variants
- `components/ui/status-badge.tsx` - Status indicators

---

**Last updated:** 2026-01-13
**Version:** 2.0 (Refined Functional)
**Rating:** 8.5-9/10
