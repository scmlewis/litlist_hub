# LitList Hub - Design System Master Document

**Project**: LitList Hub - Book Tracking Application  
**Theme**: Dark Library - Leather-bound books & aged paper  
**Last Updated**: January 28, 2026

---

## 🎨 Design Philosophy

LitList Hub evokes the warm, intimate atmosphere of a personal library at night. The design draws inspiration from:
- **Leather-bound books** with warm brown tones
- **Aged parchment** with soft, cream undertones
- **Ambient library lighting** with subtle glows
- **Traditional craftsmanship** meets modern interaction

### Core Principles
1. **Warmth over coldness** - Brown/copper tones instead of blue/gray
2. **Tactile feedback** - Glass morphism and subtle shadows create depth
3. **Reading-focused** - Typography optimized for long-form content
4. **Accessible elegance** - Beautiful but functional for all users

---

## 🎨 Color Palette

### Primary Colors (Brown - Leather)
```css
--primary-50: #faf6f1;   /* Lightest cream */
--primary-100: #f5ebe0;  /* Parchment */
--primary-200: #e8d5bd;  /* Aged paper */
--primary-300: #d4b896;  /* Light leather */
--primary-400: #c9a66b;  /* Tan leather */
--primary-500: #8b5a2b;  /* Main leather brown */
--primary-600: #704214;  /* Deep leather */
--primary-700: #5c3610;  /* Rich brown */
--primary-800: #4a2c0d;  /* Dark chocolate */
--primary-900: #3d240b;  /* Espresso */
--primary-950: #2d1810;  /* Deepest brown */
```

### Accent Colors (Copper/Bronze)
```css
--accent-50: #fdf8f3;    /* Light copper highlight */
--accent-100: #f9ede0;   /* Soft bronze */
--accent-200: #f2d9bf;   /* Copper glow */
--accent-300: #e8bf94;   /* Bronze */
--accent-400: #d9a066;   /* Burnished copper */
--accent-500: #b87333;   /* Main copper */
--accent-600: #a05a1c;   /* Deep copper */
--accent-700: #854a17;   /* Oxidized bronze */
--accent-800: #6d3d16;   /* Dark bronze */
--accent-900: #5a3315;   /* Deepest bronze */
```

### Semantic Colors
```css
--background: #0d0906;        /* Deep charcoal */
--foreground: #f5f0e8;        /* Warm off-white */
--card-bg: rgba(26, 20, 16, 0.92);  /* Semi-transparent brown */
--card-border: rgba(180, 140, 100, 0.12);  /* Subtle gold */

--success: #10b981;           /* Emerald (for public lists) */
--error: #ef4444;             /* Red */
--warning: #f59e0b;           /* Amber (ratings) */
--info: #3b82f6;              /* Blue */
```

### Color Usage Guidelines
- **Primary 500-700**: Main interactive elements (buttons, links)
- **Primary 200-400**: Hover states, highlights
- **Accent 500-600**: Call-to-action buttons, important badges
- **Background + Primary 950**: Layered depth
- **Semantic colors**: Status indicators only, not decorative

### Accessibility Requirements
- **Minimum contrast**: 4.5:1 for normal text, 3:1 for large text
- **Interactive elements**: 3:1 against background
- **Test with**: Chrome DevTools Contrast Checker
- **Avoid**: Red-green combinations without additional indicators

---

## 📝 Typography

### Font Families
```css
--font-primary: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-code: 'Monaco', 'Courier New', monospace;
```

### Type Scale (Fluid Typography)
```css
--text-xs: 0.75rem;    /* 12px - Small labels */
--text-sm: 0.875rem;   /* 14px - Secondary text */
--text-base: 1rem;     /* 16px - Body text (WCAG minimum) */
--text-lg: 1.125rem;   /* 18px - Large body */
--text-xl: 1.25rem;    /* 20px - Small headings */
--text-2xl: 1.5rem;    /* 24px - Section headings */
--text-3xl: 1.875rem;  /* 30px - Page headings */
--text-4xl: 2.25rem;   /* 36px - Hero headings */
```

### Font Weights
```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
```

### Line Heights
```css
--leading-tight: 1.25;    /* Headings */
--leading-normal: 1.5;    /* Body text (WCAG recommendation) */
--leading-relaxed: 1.75;  /* Long-form content */
```

### Typography Best Practices
1. **Body text**: Minimum 16px on mobile (--text-base)
2. **Line length**: Max 65-75 characters per line
3. **Hierarchy**: Use size + weight + color to distinguish levels
4. **Button text**: --font-medium or --font-semibold for emphasis
5. **Accessibility**: Avoid italic-only emphasis, use bold or color

---

## 📐 Spacing & Layout

### Spacing Scale (4px base unit)
```css
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
```

### Border Radius
```css
--radius-sm: 0.375rem;   /* 6px - Small elements */
--radius-md: 0.5rem;     /* 8px - Inputs, badges */
--radius-lg: 0.75rem;    /* 12px - Buttons */
--radius-xl: 1rem;       /* 16px - Cards */
--radius-2xl: 1.5rem;    /* 24px - Large cards */
--radius-full: 9999px;   /* Pills, avatars */
```

### Touch Targets
- **Minimum size**: 44px × 44px (WCAG 2.5.5)
- **Spacing between targets**: 8px minimum
- **Mobile buttons**: Add `touch-target` class for safe areas

### Grid System
```css
/* Responsive grid */
.grid-responsive {
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-6);
}
```

---

## 🎭 Visual Effects

### Shadows
```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.15);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.2);

/* Warm glow for interactive elements */
--glow-primary: 0 0 20px rgba(139, 90, 43, 0.4);
--glow-accent: 0 0 20px rgba(184, 115, 51, 0.4);
```

### Glass Morphism (Signature Effect)
```css
.glass-card {
  background: rgba(26, 20, 16, 0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(180, 140, 100, 0.12);
}
```

### Gradients
```css
/* Background mesh gradient */
--gradient-mesh: 
  radial-gradient(ellipse 100% 80% at 50% -30%, rgba(139, 90, 43, 0.18) 0%, transparent 60%),
  radial-gradient(ellipse 80% 60% at 90% 10%, rgba(112, 66, 20, 0.12) 0%, transparent 50%),
  radial-gradient(ellipse 60% 60% at 10% 80%, rgba(201, 166, 107, 0.06) 0%, transparent 50%),
  linear-gradient(180deg, #0d0906 0%, #1a110c 100%);

/* Button gradient */
--gradient-button: linear-gradient(135deg, #8b5a2b 0%, #b87333 100%);
```

---

## ⚡ Animation & Motion

### Duration
```css
--duration-fast: 150ms;      /* Micro-interactions */
--duration-normal: 200ms;    /* Standard transitions */
--duration-slow: 300ms;      /* Modal openings */
--duration-slower: 500ms;    /* Page transitions */
```

### Easing Functions
```css
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);  /* Playful bounce */
```

### Animation Patterns
```css
/* Fade in */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide up */
@keyframes slide-up {
  from { 
    transform: translateY(20px);
    opacity: 0;
  }
  to { 
    transform: translateY(0);
    opacity: 1;
  }
}

/* Scale in (modals) */
@keyframes scale-in {
  from { 
    transform: scale(0.95);
    opacity: 0;
  }
  to { 
    transform: scale(1);
    opacity: 1;
  }
}

/* Gradient shift (animated borders) */
@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Usage Guidelines
1. **Hover transitions**: --duration-fast (150ms)
2. **Button clicks**: --duration-normal (200ms)
3. **Modal openings**: --duration-slow (300ms) with scale-in
4. **Page transitions**: --duration-slower (500ms) with fade
5. **Performance**: Use transform and opacity only (GPU-accelerated)

---

## 🧩 Component Patterns

### Button Variants
```tsx
// Primary - Main actions
<Button className="bg-primary-500 hover:bg-primary-600 text-white">
  Add Book
</Button>

// Secondary - Less emphasis
<Button variant="outline" className="border-primary-500 text-primary-400">
  Cancel
</Button>

// Ghost - Tertiary actions
<Button variant="ghost" className="text-primary-300 hover:text-primary-400">
  Learn More
</Button>

// Destructive - Dangerous actions
<Button variant="destructive">Delete List</Button>
```

### Card Patterns
```tsx
// Glass card (signature)
<Card className="glass-card rounded-2xl p-6">
  {/* Content */}
</Card>

// Solid card (for contrast)
<Card className="bg-primary-950 border border-primary-800 rounded-xl p-6">
  {/* Content */}
</Card>

// Interactive card (hover effect)
<Card className="glass-card rounded-2xl p-6 transition-all duration-200 
               hover:border-primary-700 hover:shadow-glow-primary cursor-pointer">
  {/* Content */}
</Card>
```

### Modal/Dialog Pattern
```tsx
<Dialog>
  <DialogContent className="glass-card border-primary-700 max-w-md">
    <DialogHeader>
      <DialogTitle className="text-2xl font-semibold text-primary-100">
        Confirm Action
      </DialogTitle>
    </DialogHeader>
    <DialogDescription className="text-primary-300">
      This action cannot be undone.
    </DialogDescription>
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button variant="destructive">Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Empty State Pattern
```tsx
<EmptyState
  icon={<Library className="w-16 h-16 text-primary-700" />}
  title="No books in this list"
  description="Add your first book to start tracking your reading journey."
  action={
    <Button className="bg-accent-500 hover:bg-accent-600">
      <Plus className="w-4 h-4 mr-2" />
      Add Book
    </Button>
  }
/>
```

### Loading State Pattern
```tsx
// Skeleton loader
<div className="glass-card rounded-2xl p-6 space-y-4">
  <Skeleton className="h-6 w-3/4 bg-primary-900" />
  <Skeleton className="h-4 w-1/2 bg-primary-900" />
  <Skeleton className="h-40 w-full bg-primary-900" />
</div>

// Spinner
<Loader2 className="w-6 h-6 animate-spin text-primary-500" />
```

---

## ♿ Accessibility Guidelines

### Focus States
```css
/* Global focus style */
*:focus-visible {
  outline: 2px solid var(--primary-400);
  outline-offset: 2px;
}

/* Interactive elements */
button:focus-visible,
a:focus-visible {
  outline: 2px solid var(--primary-400);
  outline-offset: 2px;
  box-shadow: var(--glow-primary);
}
```

### ARIA Best Practices
1. **Icon-only buttons**: Always add `aria-label`
   ```tsx
   <Button aria-label="Delete book">
     <Trash2 className="w-4 h-4" />
   </Button>
   ```

2. **Modal dialogs**: Use `aria-describedby` and `aria-labelledby`
   ```tsx
   <Dialog aria-labelledby="dialog-title" aria-describedby="dialog-description">
     <DialogTitle id="dialog-title">Confirm</DialogTitle>
     <DialogDescription id="dialog-description">
       Are you sure?
     </DialogDescription>
   </Dialog>
   ```

3. **Loading states**: Add `aria-busy` and `aria-live`
   ```tsx
   <div aria-busy={loading} aria-live="polite">
     {loading ? <Skeleton /> : <Content />}
   </div>
   ```

4. **Form validation**: Use `aria-invalid` and `aria-errormessage`
   ```tsx
   <Input
     aria-invalid={hasError}
     aria-errormessage="error-message"
   />
   {hasError && <span id="error-message" role="alert">Error</span>}
   ```

### Keyboard Navigation
- **Tab order**: Matches visual order
- **Escape key**: Closes modals and clears selections
- **Enter/Space**: Activates buttons
- **Arrow keys**: Navigate lists and menus
- **Home/End**: Jump to first/last item

### Screen Reader Considerations
- **Skip to content**: Add skip link at page top
- **Live regions**: Announce dynamic updates with `aria-live="polite"`
- **Status messages**: Use `role="status"` for non-critical updates
- **Error announcements**: Use `role="alert"` for critical errors

---

## 📱 Responsive Design

### Breakpoints
```css
--screen-sm: 640px;   /* Small devices */
--screen-md: 768px;   /* Tablets */
--screen-lg: 1024px;  /* Laptops */
--screen-xl: 1280px;  /* Desktops */
--screen-2xl: 1536px; /* Large screens */
```

### Mobile-First Patterns
1. **Bottom navigation**: Use for mobile (<640px)
2. **Collapsible filters**: Expand on mobile, sidebar on desktop
3. **Touch targets**: Minimum 44px on mobile
4. **Font sizes**: Minimum 16px to prevent zoom

### Safe Areas (iOS)
```css
.mobile-nav {
  padding-bottom: env(safe-area-inset-bottom, 0);
}
```

---

## 🚀 Performance Guidelines

### Image Optimization
- Use Next.js `<Image>` component
- WebP format preferred
- Lazy load below-the-fold images
- Define width/height to prevent layout shift

### Animation Performance
- **Use**: `transform`, `opacity` (GPU-accelerated)
- **Avoid**: `width`, `height`, `top`, `left` (causes reflow)
- **Will-change**: Apply sparingly for critical animations

### Loading Priorities
1. **Critical**: Above-the-fold content, fonts
2. **High**: Primary images, essential data
3. **Low**: Analytics, non-essential scripts
4. **Lazy**: Below-the-fold content, modals

---

## 🎯 UX Patterns

### Error Handling
```tsx
// Error state with retry
<ErrorState
  icon={<AlertCircle />}
  title="Failed to load books"
  description="Please check your connection and try again."
  action={
    <Button onClick={retry}>
      <RefreshCw className="w-4 h-4 mr-2" />
      Retry
    </Button>
  }
/>
```

### Optimistic Updates
1. Update UI immediately
2. Show subtle loading indicator
3. Rollback on error with toast notification
4. Log error for debugging

### Toast Notifications
- **Success**: Emerald background, 4s duration
- **Error**: Red background, persist until dismissed
- **Info**: Blue background, 4s duration
- **Warning**: Amber background, 6s duration

---

## 🔧 Implementation Checklist

### Before Launch
- [ ] Color contrast audit (all text meets 4.5:1)
- [ ] Keyboard navigation test (tab through entire app)
- [ ] Screen reader test (NVDA/JAWS/VoiceOver)
- [ ] Mobile responsiveness (test on real devices)
- [ ] Performance audit (Lighthouse score >90)
- [ ] Error boundary implementation
- [ ] Loading states for all async operations
- [ ] Empty states for all data views
- [ ] Form validation with clear errors
- [ ] Offline support basics

### Ongoing Maintenance
- Review new components against this guide
- Update design tokens when adding features
- Test accessibility with every major change
- Monitor performance metrics
- Gather user feedback on UX patterns

---

**End of Design System Master Document**
