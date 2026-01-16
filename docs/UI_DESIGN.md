# UI Design Guidelines

> **Design System Documentation for KanaDojo**  
> A comprehensive guide to UI development, theming, and best practices for our TypeScript Next.js application using Tailwind CSS.

---

## 📋 Table of Contents

- [Project Stack](#project-stack)
- [Current Approach](#current-approach)
- [Theming System](#theming-system)
- [Accessibility Guidelines](#accessibility-guidelines)
- [Component Patterns](#component-patterns)
- [shadcn/ui Adoption Strategy](#shadcnui-adoption-strategy)
- [Best Practices](#best-practices)
- [Code Examples](#code-examples)

---

## 🛠️ Project Stack

KanaDojo is built with modern web technologies optimized for performance and developer experience:

- **TypeScript** - Type-safe development
- **Next.js 15** - App Router with React 19
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - High-quality, accessible component library (slow adoption in progress)
- **Framer Motion** - Smooth animations via `motion` package
- **Zustand** - Lightweight state management
- **Lucide React** - Icon system

### Key Dependencies

- `clsx` + `tailwind-merge` - Conditional class management via `cn()` utility
- `class-variance-authority` - Component variant management
- `@radix-ui` - Accessible component primitives (via shadcn/ui)

---

## 🎨 Current Approach

### How We Use Tailwind CSS

KanaDojo leverages Tailwind CSS as the primary styling solution with a heavy emphasis on **CSS custom properties (CSS variables)** for theming. This approach provides:

1. **Dynamic theming** - Runtime theme switching without rebuilding styles
2. **Consistency** - Centralized color and spacing values
3. **Flexibility** - Easy theme creation and customization

### Current Conventions

#### 1. CSS Variables Over Hardcoded Colors

**✅ DO:**

```tsx
<div className="bg-[var(--card-color)] text-[var(--main-color)]">Content</div>
```

**❌ DON'T:**

```tsx
<div className="bg-gray-100 text-black">Content</div>
```

#### 2. Utility Classes with `cn()` Helper

We use the `cn()` utility from `lib/utils.ts` to merge Tailwind classes intelligently:

```tsx
import { cn } from '@/lib/utils';

<button
  className={cn(
    'px-4 py-2 rounded-lg',
    isActive && 'bg-[var(--main-color)]',
    disabled && 'opacity-50 cursor-not-allowed'
  )}
>
  Click me
</button>;
```

#### 3. Reusable Style Constants

Common patterns are extracted to `shared/lib/styles.ts`:

```typescript
// shared/lib/styles.ts
import clsx from 'clsx';

export const cardBorderStyles = clsx('rounded-xl bg-[var(--card-color)]');

export const buttonBorderStyles = clsx(
  'rounded-xl bg-[var(--card-color)] hover:cursor-pointer',
  'duration-250 transition-all ease-in-out',
  'hover:bg-[var(--border-color)]'
);
```

**Usage:**

```tsx
import { buttonBorderStyles } from '@/shared/lib/styles';

<button className={buttonBorderStyles}>Click me</button>;
```

#### 4. Responsive Design

Use Tailwind's responsive prefixes consistently:

```tsx
<div className="flex flex-col md:flex-row gap-4 md:gap-6 lg:gap-8">
  {/* Content adapts to screen size */}
</div>
```

**Breakpoints:**

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px
- `xs`: 30rem (custom)
- `3xl`: 110rem (custom)

---

## 🎭 Theming System

### Core Theme Variables

KanaDojo uses a **5-variable color system** defined in `app/globals.css`:

```css
:root {
  /* Layout Colors */
  --background-color: hsla(210, 17%, 100%, 1); /* Page background */
  --card-color: hsla(210, 17%, 91%, 1); /* Card/elevated surfaces */
  --border-color: hsla(210, 17%, 76%, 1); /* Borders and dividers */

  /* Content Colors */
  --main-color: hsl(0, 0%, 0%); /* Primary text and actions */
  --secondary-color: hsl(0, 0%, 35%); /* Secondary text and icons */
}
```

### Theme Structure

Themes are defined in `features/Preferences/data/themes.ts` with TypeScript interfaces:

```typescript
interface Theme {
  id: string;
  backgroundColor: string; // Page background
  cardColor: string; // Cards, modals, elevated surfaces
  borderColor: string; // Borders, dividers, hover states
  mainColor: string; // Primary text, icons, CTAs
  secondaryColor: string; // Secondary text, subtle elements
}
```

### How Themes Work

1. **Theme Definition** - Themes are organized into groups (Base, Light, Dark) in `features/Preferences/data/themes.ts`
2. **Theme Storage** - Selected theme ID is persisted via Zustand in `features/Preferences/store/usePreferencesStore.ts`
3. **Theme Application** - The `applyTheme()` function dynamically updates CSS variables:

```typescript
export function applyTheme(themeId: string) {
  const theme = themeMap.get(themeId);
  if (!theme) return;

  const root = document.documentElement;
  root.style.setProperty('--background-color', theme.backgroundColor);
  root.style.setProperty('--card-color', theme.cardColor);
  root.style.setProperty('--border-color', theme.borderColor);
  root.style.setProperty('--main-color', theme.mainColor);
  root.style.setProperty('--secondary-color', theme.secondaryColor);
  root.setAttribute('data-theme', theme.id);
}
```

### Creating New Themes

To add a new theme:

1. **Define the theme** in `features/Preferences/data/themes.ts`:

```typescript
{
  id: 'my-custom-theme',
  backgroundColor: 'hsla(220, 20%, 12%, 1)',
  cardColor: 'hsla(220, 20%, 18%, 1)',
  borderColor: 'hsla(220, 20%, 30%, 1)',
  mainColor: 'hsla(280, 80%, 65%, 1)',
  secondaryColor: 'hsla(180, 70%, 55%, 1)'
}
```

2. **Test contrast ratios** (see Accessibility section)
3. **Add to appropriate theme group** (Base, Light, or Dark)

#### Sumi Theme (Example)

The `sumi` theme is a minimal, sumi-e (Japanese ink) inspired dark theme added in `features/Preferences/data/themes.ts`. It's designed for low visual distraction, high focus, and a neutral, high-clarity UI where content stands out against an almost-black page background.

- **Palette (from `features/Preferences/data/themes.ts`)**:

```ts
{
  id: 'sumi',
  backgroundColor: 'hsla(0, 0%, 10%, 1)',   // deep charcoal / paper black
  cardColor: 'hsla(0, 0%, 14%, 1)',         // slightly lighter surface
  borderColor: 'hsla(0, 0%, 22%, 1)',       // subtle divider / hover
  mainColor: 'hsla(0, 0%, 72%, 1)',         // warm off-white for primary text
  secondaryColor: 'hsla(45, 35%, 88%, 1)',  // soft warm accent (paper/cream)
}
```

- **Usage guidance**:

  - Use `--background-color` for large page surfaces and overlays.
  - Use `--card-color` for cards, panels, and elevated UI pieces.
  - Use `--border-color` for separators, subtle hover/backdrop outlines and focus rings when appropriate.
  - Use `--main-color` for primary text, icons, and CTAs that need high readability.
  - Use `--secondary-color` for subtle accents, tertiary text, dividers or decorative strokes.

- **Tailwind example (recommended pattern)**:

```tsx
<div className="bg-[var(--background-color)] min-h-screen text-[var(--main-color)]">
  <div className="rounded-xl bg-[var(--card-color)] border border-[var(--border-color)] p-6">
    <h1 className="text-2xl font-bold text-[var(--main-color)]">
      Sumi — Focus Mode
    </h1>
    <p className="text-sm text-[var(--secondary-color)]">
      Subtle helper text and accents
    </p>
  </div>
</div>
```

- **Accessibility / contrast notes**:

  - The `sumi` theme is intentionally high-contrast for primary content: `--main-color` (near-white) on `--background-color` (very dark charcoal) is appropriate for body text and passes typical AA thresholds for normal text in most sizes — still run specific checks for bright UI elements and CTA buttons.
  - For smaller UI chrome (icons, borders), ensure `--border-color` on `--card-color` meets at least a 3:1 ratio for interactive affordances, or increase border opacity when used as the primary focus indicator.
  - When using `--secondary-color` for secondary text, verify it maintains adequate contrast on both `--background-color` and `--card-color` for the sizes you use (tooling: WebAIM, axe, Lighthouse).

- **Developer checklist when adding/using `sumi`**:

  - Copy the theme object into `features/Preferences/data/themes.ts` exactly (IDs must be kebab-case).
  - Verify `applyTheme('sumi')` updates CSS variables and `data-theme` attribute correctly.
  - Test interactive components (buttons, inputs, dialogs) visually and via automated contrast checks.
  - Consider providing a slightly lighter variant of `--main-color` for disabled/low-emphasis states to avoid blending with `--card-color`.

  #### Momiji Theme (Dark — Autumn Maple)

  The `momiji` theme is inspired by autumn maple leaves — warm, cozy, and subtly vibrant. It pairs a deep, neutral page background with amber and yellow-green accents for highlights and CTAs. Use this theme when you want a seasonal, warm-dark aesthetic that still prioritizes readability and clear affordances.

  - **Palette (from `features/Preferences/data/themes.ts`):**

  ```ts
  {
    id: 'momiji',
    backgroundColor: 'hsla(15, 35%, 11%, 1)',
    cardColor: 'hsla(15, 33%, 15%, 1)',
    borderColor: 'hsla(15, 30%, 23%, 1)',
    mainColor: 'hsla(5, 85%, 58%, 1)',
    secondaryColor: 'hsla(45, 88%, 62%, 1)',
  }
  ```

  - **Usage guidance:**

    - Use `--background-color` for full-page backgrounds and large overlays.
    - Use `--card-color` for cards, panels, and elevated UI surfaces to create subtle separation from the page background.
    - Use `--border-color` for separators, subtle hover outlines, and focus affordances.
    - Use `--main-color` for primary text, icons, and CTAs that need emphasis.
    - Use `--secondary-color` for accent highlights, badges, and secondary CTAs.

  - **Tailwind example:**

  ```tsx
  <div className="bg-[var(--background-color)] min-h-screen text-[var(--main-color)]">
    <div className="rounded-xl bg-[var(--card-color)] border border-[var(--border-color)] p-6">
      <h1 className="text-2xl font-bold text-[var(--main-color)]">
        Momiji — Autumn Warmth
      </h1>
      <p className="text-sm text-[var(--secondary-color)]">
        Accent and supportive text
      </p>
    </div>
  </div>
  ```

  - **Accessibility / contrast notes:**

    - `--main-color` (warm amber) on `--background-color` (deep charcoal) should provide strong contrast for body text; still validate with WebAIM, axe, or Lighthouse.
    - `--secondary-color` (yellow-green) is an accent — confirm contrast on both `--background-color` and `--card-color` when used for small or secondary text; reduce saturation or increase lightness if below AA.
    - Ensure `--border-color` on `--card-color` meets at least a 3:1 contrast ratio for interactive affordances; increase opacity if necessary when used as a primary focus indicator.

  - **Developer checklist when adding/using `momiji`:**
    - Add the theme object to `features/Preferences/data/themes.ts` under the `Dark` theme group.
    - Verify `applyTheme('momiji')` updates CSS variables and `data-theme` attribute correctly.
    - Run automated contrast checks (axe, Lighthouse) and manual spot checks for CTAs and small text.
    - Test interactive components (buttons, inputs, dialogs) visually across breakpoints and accessibility modes.

  ### Theme Color Guidelines

#### Color Format

- Use **HSLA** for flexibility: `hsla(hue, saturation%, lightness%, alpha)`
- HSL makes it easier to create harmonious color schemes

#### Naming Convention

- Theme IDs should be descriptive: `'midnight-purple'`, `'sunset-orange'`
- Use kebab-case for consistency

#### Color Relationships

- `backgroundColor` → Lightest/darkest (depending on light/dark theme)
- `cardColor` → Slightly elevated from background
- `borderColor` → More prominent than card, used for hover states
- `mainColor` → High contrast with background
- `secondaryColor` → Medium contrast, complementary to main

**Example Hierarchy (Dark Theme):**

```
backgroundColor: hsl(220, 15%, 10%)  ← Darkest
cardColor:       hsl(220, 15%, 15%)  ← Slightly lighter
borderColor:     hsl(220, 15%, 25%)  ← More prominent
mainColor:       hsl(280, 80%, 70%)  ← Vibrant, high contrast
secondaryColor:  hsl(180, 60%, 60%)  ← Complementary accent
```

---

## ♿ Accessibility Guidelines

### Color Contrast

**All themes MUST meet WCAG 2.1 Level AA standards:**

- **Normal text** (< 18pt): Contrast ratio ≥ 4.5:1
- **Large text** (≥ 18pt or ≥ 14pt bold): Contrast ratio ≥ 3:1
- **UI components** (buttons, borders): Contrast ratio ≥ 3:1

**Tools for Testing:**

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Chrome DevTools Lighthouse
- Browser extension: WAVE or axe DevTools

**Example Validation:**

```typescript
// Test main text readability
mainColor (hsl(280, 80%, 70%)) on backgroundColor (hsl(220, 15%, 10%))
→ Contrast ratio: 8.2:1 ✅ Passes AA and AAA

// Test secondary text readability
secondaryColor (hsl(180, 60%, 60%)) on backgroundColor (hsl(220, 15%, 10%))
→ Contrast ratio: 5.1:1 ✅ Passes AA
```

### Focus States

**All interactive elements MUST have visible focus indicators:**

```tsx
// Example from components/ui/button.tsx
const buttonVariants = cva(
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--main-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background-color)]'
  // ... other styles
);
```

**Focus Ring Guidelines:**

- Use `focus-visible:ring-2` for keyboard navigation
- Ring color: `ring-[var(--main-color)]`
- Ring offset: `ring-offset-2` for separation
- Ring offset color: `ring-offset-[var(--background-color)]`

### Semantic HTML

Use proper HTML elements for their intended purpose:

**✅ DO:**

```tsx
<button onClick={handleClick}>Submit</button>
<a href="/about">Learn More</a>
```

**❌ DON'T:**

```tsx
<div onClick={handleClick}>Submit</div>
<span onClick={navigate}>Learn More</span>
```

### ARIA Labels

Provide context for screen readers when visual cues aren't sufficient:

```tsx
<button aria-label="Close modal">
  <X size={20} />
</button>

<input
  type="checkbox"
  aria-checked={isSelected}
  aria-label="Select all Hiragana characters"
/>
```

### Keyboard Navigation

- Ensure all interactive elements are keyboard accessible
- Support `Tab`, `Enter`, `Space`, `Escape`, and arrow keys where appropriate
- Maintain logical tab order

---

## 🧩 Component Patterns

### Component Structure

Follow these patterns for consistency:

```tsx
'use client'; // Add for client components (state, effects, etc.)

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { usePreferencesStore } from '@/features/Preferences';

interface MyComponentProps {
  title: string;
  isActive?: boolean;
  onClick?: () => void;
}

const MyComponent = ({
  title,
  isActive = false,
  onClick,
}: MyComponentProps) => {
  const [state, setState] = useState('');
  const theme = useThemeStore(state => state.theme);

  return (
    <div
      className={cn(
        'rounded-xl p-4',
        'bg-[var(--card-color)] text-[var(--main-color)]',
        isActive && 'border-2 border-[var(--main-color)]'
      )}
    >
      <h3 className="text-xl font-semibold">{title}</h3>
      {/* ... */}
    </div>
  );
};

export default MyComponent;
```

### Styling Patterns

#### 1. Container Layouts

```tsx
<div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
  {/* Responsive container with proper padding */}
</div>
```

#### 2. Card Components

```tsx
<div className="rounded-xl bg-[var(--card-color)] p-6 shadow-sm">
  {/* Card content */}
</div>
```

#### 3. Buttons (Custom Styles)

```tsx
<button
  className={cn(
    'px-6 py-3 rounded-lg',
    'bg-[var(--main-color)] text-[var(--background-color)]',
    'hover:brightness-110 active:brightness-95',
    'transition-all duration-200',
    'focus-visible:ring-2 focus-visible:ring-[var(--main-color)] focus-visible:ring-offset-2'
  )}
>
  Action
</button>
```

#### 4. Text Hierarchy

```tsx
<h1 className="text-4xl md:text-5xl font-bold text-[var(--main-color)]">
  Main Heading
</h1>
<h2 className="text-2xl md:text-3xl font-semibold text-[var(--main-color)]">
  Subheading
</h2>
<p className="text-base text-[var(--secondary-color)]">
  Body text with secondary color
</p>
```

#### 5. Hover States

```tsx
<div
  className={cn(
    'p-4 rounded-lg',
    'bg-[var(--card-color)]',
    'hover:bg-[var(--border-color)] hover:cursor-pointer',
    'transition-all duration-200'
  )}
>
  {/* Hoverable content */}
</div>
```

### Animation Patterns

Use Framer Motion (`motion` package) for complex animations:

```tsx
import { motion } from 'motion/react';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  {/* Animated content */}
</motion.div>;
```

Use Tailwind transitions for simple interactions:

```tsx
<button className="transition-all duration-200 hover:scale-105 active:scale-95">
  Click me
</button>
```

---

## 🚀 shadcn/ui Adoption Strategy

KanaDojo is gradually adopting [shadcn/ui](https://ui.shadcn.com/) for consistent, accessible components.

### Current shadcn/ui Components

- ✅ `Button` (`components/ui/button.tsx`)
- ✅ `Select` (`components/ui/select.tsx`)

### shadcn/ui Integration Guidelines

#### 1. Theme Variable Compatibility

shadcn/ui components are customized to use our CSS variable system:

```tsx
// components/ui/button.tsx
const buttonVariants = cva(
  'bg-[var(--main-color)] text-[var(--background-color)]' // Uses our theme
  // ...
);
```

#### 2. Installing New Components

Use the shadcn CLI to add components:

```bash
npx shadcn@latest add [component-name]
```

**After installation:**

1. Review the generated component
2. Replace hardcoded colors with CSS variables:
   - `bg-primary` → `bg-[var(--main-color)]`
   - `text-primary-foreground` → `text-[var(--background-color)]`
   - `border` → `border-[var(--border-color)]`
3. Test with multiple themes to ensure compatibility

#### 3. Component Customization

**Example: Customizing Button variants**

```tsx
// components/ui/button.tsx
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-transparent text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--main-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background-color)] disabled:pointer-events-none disabled:opacity-60',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--main-color)] text-[var(--background-color)] shadow-[0_10px_30px_-12px_rgba(0,0,0,0.45)] hover:brightness-110',
        outline:
          'border border-[var(--border-color)] bg-transparent text-[var(--main-color)] hover:bg-[var(--card-color)]',
        ghost:
          'bg-transparent text-[var(--main-color)] hover:bg-[var(--card-color)]',
        // Add custom variants as needed
      },
      size: {
        default: 'h-10 px-5',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-12 rounded-xl px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
  }
);
```

#### 4. Migration Strategy

**Phase 1: High-Priority Components (Current)**

- ✅ Button
- ✅ Select
- 🔄 Input (next)
- 🔄 Checkbox (next)

**Phase 2: Form Components**

- 🔜 Form wrapper
- 🔜 Label
- 🔜 Textarea
- 🔜 Switch

**Phase 3: Overlay Components**

- 🔜 Dialog/Modal
- 🔜 Dropdown Menu
- 🔜 Tooltip

**Migration Guidelines:**

1. **Don't break existing UI** - Migrate incrementally, one component at a time
2. **Test thoroughly** - Verify all game modes and features still work
3. **Maintain theme compatibility** - Always use CSS variables
4. **Update documentation** - Document new shadcn components in this file

### Future-Proofing for shadcn

**DO:**

- ✅ Use CSS variables consistently
- ✅ Follow Radix UI patterns (shadcn is built on Radix)
- ✅ Use the `cn()` utility for class management
- ✅ Maintain semantic HTML structure

**DON'T:**

- ❌ Hardcode colors or theme values
- ❌ Create custom components that duplicate shadcn functionality
- ❌ Override Radix UI accessibility features

---

## ✅ Best Practices

### Do's and Don'ts

#### Styling

**✅ DO:**

```tsx
// Use CSS variables for dynamic theming
<div className="bg-[var(--card-color)] text-[var(--main-color)]" />

// Use cn() for conditional classes
<button className={cn(
  "px-4 py-2",
  isActive && "bg-[var(--main-color)]"
)} />

// Extract repeated patterns to shared/lib/styles.ts
import { buttonBorderStyles } from '@/shared/lib/styles';

// Use responsive prefixes consistently
<div className="flex flex-col md:flex-row lg:gap-8" />
```

**❌ DON'T:**

```tsx
// Don't hardcode colors
<div className="bg-gray-100 text-black" />

// Don't use string concatenation for classes
<button className={"px-4 py-2 " + (isActive ? "bg-blue-500" : "")} />

// Don't repeat complex class strings
<button className="rounded-xl bg-[var(--card-color)] hover:bg-[var(--border-color)] transition-all duration-200" />
<div className="rounded-xl bg-[var(--card-color)] hover:bg-[var(--border-color)] transition-all duration-200" />

// Don't use arbitrary breakpoint values
<div className="flex flex-col min-[850px]:flex-row" /> // Use md: instead
```

#### Typography

**✅ DO:**

```tsx
// Use semantic heading levels
<h1 className="text-4xl font-bold">Main Title</h1>
<h2 className="text-2xl font-semibold">Section Title</h2>

// Use secondary color for less prominent text
<p className="text-[var(--secondary-color)]">Helper text</p>

// Use responsive text sizes
<h1 className="text-3xl md:text-4xl lg:text-5xl">Responsive Title</h1>
```

**❌ DON'T:**

```tsx
// Don't skip heading levels
<h1>Title</h1>
<h3>Skipped h2</h3>

// Don't use hardcoded gray values
<p className="text-gray-500">Text</p>

// Don't use fixed sizes that don't scale
<p className="text-[14px]">Fixed size text</p>
```

#### Spacing

**✅ DO:**

```tsx
// Use Tailwind spacing scale
<div className="p-4 md:p-6 lg:p-8" />
<div className="space-y-4" /> // Consistent vertical spacing
<div className="gap-4 md:gap-6" /> // Responsive gaps in flex/grid

// Use consistent spacing within components
const spacing = "p-6 space-y-4";
```

**❌ DON'T:**

```tsx
// Don't use arbitrary values unnecessarily
<div className="p-[17px] space-y-[23px]" />

// Don't mix spacing units
<div className="p-4 mb-[2rem]" /> // Inconsistent
```

#### Interactions

**✅ DO:**

```tsx
// Add hover states for interactive elements
<button className="hover:brightness-110 transition-duration-200" />

// Use focus-visible for keyboard navigation
<button className="focus-visible:ring-2 focus-visible:ring-[var(--main-color)]" />

// Provide feedback on active/pressed states
<button className="active:brightness-95" />

// Use appropriate cursor styles
<div className="cursor-pointer" onClick={handler} />
```

**❌ DON'T:**

```tsx
// Don't forget hover states
<button onClick={handler}>No hover feedback</button>

// Don't use focus instead of focus-visible (affects mouse users)
<button className="focus:ring-2" />

// Don't make non-interactive elements look clickable
<div className="cursor-pointer">Not actually clickable</div>
```

#### Component Organization

**✅ DO:**

```tsx
// Group related components
components/
  Settings/
    Themes.tsx
    Preferences.tsx
  Dojo/
    Kana/
    Kanji/
    Vocab/

// Use TypeScript interfaces from lib/interfaces.ts
import { KanaCharacter } from '@/lib/interfaces';

// Use custom hooks from lib/hooks/
import { useClick } from '@/lib/hooks/useAudio';
```

**❌ DON'T:**

```tsx
// Don't create deeply nested component structures
components / Settings / ThemeSection / ThemesList / ThemeItem / index.tsx; // Too deep

// Don't duplicate interface definitions
interface KanaCharacter {} // Already in lib/interfaces.ts
```

### Performance Considerations

1. **Use `'use client'` directive wisely** - Only add to components that need client-side features (state, effects, event handlers)
2. **Optimize images** - Use Next.js Image component for automatic optimization
3. **Lazy load heavy components** - Use dynamic imports for large components
4. **Memoize expensive calculations** - Use `useMemo` and `useCallback` appropriately
5. **Minimize re-renders** - Use Zustand selectors to subscribe to specific state slices

---

## 💡 Code Examples

### Example 1: Themed Card Component

```tsx
'use client';

import { cn } from '@/lib/utils';
import { cardBorderStyles } from '@/shared/lib/styles';

interface CardProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

const Card = ({ title, description, children, className }: CardProps) => {
  return (
    <div className={cn(cardBorderStyles, 'p-6 space-y-4', className)}>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-[var(--main-color)]">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-[var(--secondary-color)]">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
};

export default Card;
```

### Example 2: Interactive Selection Button

```tsx
'use client';

import { cn } from '@/lib/utils';
import { buttonBorderStyles } from '@/shared/lib/styles';
import { useClick } from '@/lib/hooks/useAudio';
import { Check } from 'lucide-react';

interface SelectionButtonProps {
  label: string;
  isSelected: boolean;
  onToggle: () => void;
}

const SelectionButton = ({
  label,
  isSelected,
  onToggle,
}: SelectionButtonProps) => {
  const { playClick } = useClick();

  const handleClick = () => {
    playClick();
    onToggle();
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        buttonBorderStyles,
        'p-4 flex items-center justify-between gap-3',
        'transition-all duration-200',
        isSelected && 'border-2 border-[var(--main-color)]'
      )}
      aria-pressed={isSelected}
    >
      <span className="text-[var(--main-color)] font-medium">{label}</span>
      {isSelected && (
        <Check
          className="text-[var(--secondary-color)]"
          size={20}
        />
      )}
    </button>
  );
};

export default SelectionButton;
```

### Example 3: Responsive Grid Layout

```tsx
<div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
  <h1 className="text-3xl md:text-4xl font-bold text-[var(--main-color)] mb-8">
    Character Selection
  </h1>

  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
    {characters.map(char => (
      <CharacterCard
        key={char.id}
        character={char}
      />
    ))}
  </div>
</div>
```

### Example 4: Themed Modal with Overlay

```tsx
'use client';

import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={cn(
              'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
              'w-full max-w-md max-h-[85vh] overflow-y-auto',
              'bg-[var(--background-color)] rounded-2xl shadow-2xl',
              'p-6'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[var(--main-color)]">
                {title}
              </h2>
              <button
                onClick={onClose}
                className={cn(
                  'rounded-lg p-2',
                  'hover:bg-[var(--card-color)]',
                  'transition-colors duration-200',
                  'focus-visible:ring-2 focus-visible:ring-[var(--main-color)]'
                )}
                aria-label="Close modal"
              >
                <X
                  className="text-[var(--secondary-color)]"
                  size={24}
                />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;
```

### Example 5: Custom Checkbox Styling

The project uses custom checkbox styling in `app/globals.css`:

```css
/* Custom styled checkbox using CSS variables */
input[type='checkbox'] {
  appearance: none;
  -webkit-appearance: none;
  background-color: var(--card-color);
  border: 2px solid var(--border-color);
  width: 1.1em;
  height: 1.1em;
  border-radius: 0.25em;
  display: inline-block;
  position: relative;
  vertical-align: middle;
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;
}

input[type='checkbox']:checked {
  background-color: var(--main-color);
  border-color: var(--main-color);
}

input[type='checkbox']:checked::after {
  content: '';
  display: block;
  position: absolute;
  left: 0.28em;
  top: 0.05em;
  width: 0.3em;
  height: 0.6em;
  border: solid var(--background-color);
  border-width: 0 0.18em 0.18em 0;
  transform: rotate(45deg);
}
```

**Usage in JSX:**

```tsx
<label className="flex items-center gap-2 cursor-pointer">
  <input
    type="checkbox"
    checked={isSelected}
    onChange={e => setIsSelected(e.target.checked)}
    className="focus-visible:ring-2 focus-visible:ring-[var(--main-color)]"
  />
  <span className="text-[var(--main-color)]">Option label</span>
</label>
```

### Example 6: Using shadcn/ui Button

```tsx
import { Button } from '@/components/ui/button';

// Default variant - primary action
<Button onClick={handleSubmit}>
  Submit
</Button>

// Outline variant - secondary action
<Button variant="outline" onClick={handleCancel}>
  Cancel
</Button>

// Ghost variant - tertiary action
<Button variant="ghost" onClick={handleReset}>
  Reset
</Button>

// Different sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">
  <Settings size={20} />
</Button>

// With custom classes
<Button className="w-full md:w-auto">
  Responsive Width
</Button>
```

---

## 📚 Additional Resources

### Internal Documentation

- `CLAUDE.md` - Project overview and architecture
- `CONTRIBUTING.md` - Contribution guidelines and code style
- `features/Preferences/data/themes.ts` - Theme definitions and management
- `lib/interfaces.ts` - TypeScript interfaces
- `shared/lib/styles.ts` - Reusable style constants

### External Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Radix UI Documentation](https://www.radix-ui.com/primitives)

### Design Tools

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Coolors.co](https://coolors.co/) - Color palette generator
- [Realtime Colors](https://realtimecolors.com/) - Theme visualization
- [HSL Color Picker](https://hslpicker.com/)

---

## 🔄 Document Maintenance

This document should be updated whenever:

- New theming patterns are established
- shadcn/ui components are added or customized
- CSS variable naming conventions change
- New accessibility requirements are identified
- Major design system changes are implemented

**Last Updated:** January 2025
**Maintained By:** KanaDojo Team

---

**Questions or Suggestions?**  
Please open an issue or discussion on GitHub to improve this documentation.
