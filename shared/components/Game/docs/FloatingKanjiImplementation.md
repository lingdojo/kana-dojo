# Floating Kanji Implementation

## Overview

The Floating Kanji feature adds randomly positioned, animated kanji characters to the Streak Milestone Overlay. The number of characters displayed equals the streak milestone value (5, 10, 15, 20, or 25), creating a visually engaging celebration effect.

## Architecture

### Component Structure

```
StreakMilestoneOverlay.tsx (main component)
├── FloatingKanji.tsx (individual kanji component)
└── Utilities
    ├── decorationUtils.ts (kanji loading & color selection)
    └── positioningUtils.ts (random positioning algorithm)
```

### Key Files

1. **`shared/components/Game/StreakMilestoneOverlay.tsx`**
   - Main overlay component
   - Orchestrates kanji generation and rendering
   - Manages responsive sizing

2. **`shared/components/Game/FloatingKanji.tsx`**
   - Individual kanji character component
   - Handles fade-in and float animations
   - Positioned absolutely with x/y coordinates

3. **`shared/lib/decorations/decorationUtils.ts`**
   - Loads kanji characters from `/data-kanji/decorations.json`
   - Provides random color selection from theme palette
   - Caches loaded data for performance

4. **`shared/lib/decorations/positioningUtils.ts`**
   - Random position generation algorithm
   - Personal radius calculations
   - Collision detection logic

## Positioning Algorithm

### Personal Radius Calculation

The personal radius determines the minimum distance between kanji characters. It uses a logarithmic scale to provide more space when there are fewer characters and less space when there are many.

**Formula:**

```typescript
const calculatePersonalRadius = (count: number, baseRadius: number): number => {
  const minMultiplier = 0.8; // At count=25
  const maxMultiplier = 3.0; // At count=1

  // Logarithmic interpolation
  const t = Math.log(count) / Math.log(25);
  const multiplier = maxMultiplier - (maxMultiplier - minMultiplier) * t;

  return baseRadius * multiplier;
};
```

**Why Logarithmic?**

- Linear scaling would create too much empty space at low counts
- Logarithmic provides smooth, natural-feeling transitions
- Maintains visual balance across all milestone values

**Example Values:**

| Count | Base Radius (Desktop) | Multiplier | Personal Radius |
| ----- | --------------------- | ---------- | --------------- |
| 1     | 90px                  | 3.0        | 270px           |
| 5     | 90px                  | 2.1        | 189px           |
| 10    | 90px                  | 1.6        | 144px           |
| 15    | 90px                  | 1.3        | 117px           |
| 20    | 90px                  | 1.1        | 99px            |
| 25    | 90px                  | 0.8        | 72px            |

### Base Radius (Responsive)

The base radius adapts to viewport size:

```typescript
const getBaseRadius = (viewportWidth: number, charSize: number): number => {
  if (viewportWidth < 768) return charSize * 1.5; // Mobile: 36px
  if (viewportWidth < 1024) return charSize * 2; // Tablet: 60px
  return charSize * 2.5; // Desktop: 90px
};
```

### Rejection Sampling Algorithm

The positioning algorithm uses rejection sampling to place characters randomly while respecting constraints:

**Viewport Deadzone Guarantee:**

To ensure characters never extend outside the viewport, a deadzone is enforced on all edges:

- **Deadzone size**: Equal to `charSize` (100% of character size)
- **Why it works**: Characters use `translate(-50%, -50%)` CSS transform, so they extend `charSize/2` in each direction from their center point
- **Safety margin**: Using full `charSize` provides extra buffer beyond the minimum `charSize/2` requirement
- **Result**: Character centers can only be placed in the safe zone, guaranteeing they never clip at viewport edges
- **Example**: For 36px character → 36px deadzone on each edge (top, right, bottom, left)

**Visual representation:**

```
┌─────────────────────────────────────┐
│ ← deadzone (charSize)               │
│   ┌─────────────────────────────┐   │
│   │                             │   │
│   │   Safe placement zone       │   │
│   │   (characters can be here)  │   │
│   │                             │   │
│   └─────────────────────────────┘   │
│               deadzone (charSize) → │
└─────────────────────────────────────┘
```

**Algorithm Steps:**

1. Calculate personal radius based on character count
2. Define deadzone equal to character size on all viewport edges
3. For each character (up to `count`):
   - Generate random x, y position within safe zone (deadzone to viewport - deadzone)
   - Check if position is valid:
     - Not in exclusion zone (central content area)
     - No collision with existing characters
   - If valid, place character
   - If invalid, retry (up to 200 attempts)
   - Fallback: place with same constraints if max attempts reached

**Pseudocode:**

```typescript
const deadzoneEdge = charSize;

for (let i = 0; i < count; i++) {
  let placed = false;
  let attempts = 0;

  while (!placed && attempts < maxAttempts) {
    const x = random(deadzoneEdge, viewportWidth - deadzoneEdge);
    const y = random(deadzoneEdge, viewportHeight - deadzoneEdge);

    if (isValidPosition(x, y)) {
      positions.push({ x, y });
      placed = true;
    }
    attempts++;
  }

  // Fallback placement (still respects deadzone)
  if (!placed) {
    positions.push({
      x: random(deadzoneEdge, viewportWidth - deadzoneEdge),
      y: random(deadzoneEdge, viewportHeight - deadzoneEdge),
    });
  }
}
```

### Exclusion Zone Logic

The exclusion zone prevents characters from overlapping with the central content (Flame icon, text).

**Calculation:**

```typescript
const getExclusionZone = (
  viewportWidth: number,
  viewportHeight: number,
): ExclusionZone => {
  const centerX = viewportWidth / 2;
  const centerY = viewportHeight / 2;

  return {
    x: centerX,
    y: centerY,
    width: viewportWidth < 768 ? 300 : 500, // Mobile: 300px, Desktop: 500px
    height: viewportWidth < 768 ? 400 : 600, // Mobile: 400px, Desktop: 600px
  };
};
```

**Collision Detection:**

```typescript
const isInExclusionZone = (
  x: number,
  y: number,
  zone: ExclusionZone,
  radius: number,
): boolean => {
  const halfWidth = zone.width / 2 + radius;
  const halfHeight = zone.height / 2 + radius;

  return (
    x > zone.x - halfWidth &&
    x < zone.x + halfWidth &&
    y > zone.y - halfHeight &&
    y < zone.y + halfHeight
  );
};
```

The exclusion zone is expanded by the personal radius to ensure characters don't get too close to the edges.

### Character Collision Detection

Prevents characters from overlapping with each other:

```typescript
const hasCollision = (
  x: number,
  y: number,
  positions: Position[],
  radius: number,
): boolean => {
  const minDistance = radius * 2; // Personal space diameter

  return positions.some(pos => {
    const dx = x - pos.x;
    const dy = y - pos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < minDistance;
  });
};
```

Uses Euclidean distance to check if any existing character is within the personal space diameter.

## Animation System

### Fade-in Stagger

Characters fade in smoothly with a staggered effect using Framer Motion:

```typescript
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08, // 80ms between each
      delayChildren: 0.2, // Start after overlay appears
    },
  },
};

const kanjiVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 0.9,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1], // Smooth cubic-bezier easing
    },
  },
};
```

### Float Animation

After fading in, each character floats infinitely using CSS animation:

**CSS Keyframes:**

```css
@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(var(--float-distance, -6px));
  }
}
```

**Animation Properties:**

- Duration: 5.5s
- Easing: ease-in-out
- Iteration: infinite
- Distance: -6px (upward)

### Random Delays

Each character gets a random delay (0-3 seconds) before starting the float animation:

```typescript
const delay = rng.real(0, 3); // Random delay using random-js

// Applied via CSS
style={{
  animationDelay: `${delay}s`,
}}
```

This prevents all characters from floating in unison, creating a more organic, natural effect.

## Responsive Behavior

### Character Sizing

| Viewport            | Size Class | Pixel Size | Tailwind Class |
| ------------------- | ---------- | ---------- | -------------- |
| Mobile (<768px)     | `sm`       | 24px       | `text-2xl`     |
| Tablet (768-1023px) | `md`       | 30px       | `text-3xl`     |
| Desktop (≥1024px)   | `lg`       | 36px       | `text-4xl`     |

### Dynamic Position Updates

The floating kanji positions are **dynamically recalculated** when the viewport is resized:

**Initial Load:**

1. Positions calculated based on current viewport dimensions
2. Characters fade in with stagger effect

**On Resize:**

1. Viewport dimensions detected
2. New positions calculated for current viewport size
3. Characters smoothly transition to new positions using spring animation
4. Character size and personal radius adjust automatically

**Transition Animation:**

- Type: Spring physics
- Stiffness: 100
- Damping: 20
- Duration: ~0.5-1s (physics-based)

This ensures characters remain visible and properly distributed regardless of viewport changes, including:

- Desktop → Mobile (characters reposition to fit smaller viewport)
- Mobile → Desktop (characters spread out to fill larger viewport)
- Window resizing (smooth, continuous repositioning)
- Device rotation (landscape ↔ portrait)

### Spacing Adjustments

Smaller viewports get tighter spacing to prevent overcrowding:

| Viewport | Base Radius | Personal Radius (count=5) |
| -------- | ----------- | ------------------------- |
| Mobile   | 36px        | ~108px                    |
| Tablet   | 60px        | ~180px                    |
| Desktop  | 90px        | ~270px                    |

### Exclusion Zone

The central content exclusion zone also scales:

| Viewport | Width | Height |
| -------- | ----- | ------ |
| Mobile   | 300px | 400px  |
| Desktop  | 500px | 600px  |

## Configuration Parameters

### Adjustable Values

**In `positioningUtils.ts`:**

```typescript
// Personal radius multipliers
const minMultiplier = 0.8; // At count=25
const maxMultiplier = 3.0; // At count=1

// Base radius multipliers
if (viewportWidth < 768) return charSize * 1.5; // Mobile
if (viewportWidth < 1024) return charSize * 2; // Tablet
return charSize * 2.5; // Desktop

// Positioning constraints
const maxAttempts = 200; // Max placement attempts
const deadzoneEdge = charSize; // Viewport edge deadzone (ensures full visibility)
```

**In `FloatingKanji.tsx`:**

```typescript
// Animation properties
opacity: 0.9,                        // Character opacity
duration: 0.6,                       // Fade-in duration
ease: [0.4, 0, 0.2, 1],             // Cubic-bezier easing
'--float-distance': '-6px',          // Float distance
```

**In `StreakMilestoneOverlay.tsx`:**

```typescript
// Float animation delay range
const delay = rng.real(0, 3); // 0-3 seconds
```

## Performance Optimizations

### 1. Caching

- Kanji characters loaded once and cached for session
- Color palette computed at module load time
- Prevents redundant network requests and computations

### 2. Memoization

- Position calculations memoized with `useMemo`
- Prevents recalculation on re-renders
- Only recalculates when milestone changes

### 3. Viewport Resize Handling

- Resize events are debounced (150ms delay)
- Positions recalculated only after resize completes
- Smooth spring animations prevent jarring transitions
- Character styles (color, font) preserved during resize
- Only positions update, avoiding expensive re-renders

### 4. GPU Acceleration

- Uses CSS transforms for animations
- `translateY()` is GPU-accelerated
- Smooth 60fps animations

### 5. Lazy Loading

- Kanji data loaded only when overlay appears
- Async loading doesn't block UI
- Graceful handling of loading states

### 6. Component Optimization

- `FloatingKanji` wrapped in `memo()`
- Prevents unnecessary re-renders
- Each character manages own animation state

## Testing Scenarios

### Milestone Values

- ✅ Test with count=1 (maximum spacing)
- ✅ Test with count=5 (typical low milestone)
- ✅ Test with count=10 (medium milestone)
- ✅ Test with count=15 (medium-high milestone)
- ✅ Test with count=20 (high milestone)
- ✅ Test with count=25 (maximum characters, minimum spacing)

### Viewport Sizes

- ✅ Mobile portrait (375x667)
- ✅ Mobile landscape (667x375)
- ✅ Tablet portrait (768x1024)
- ✅ Tablet landscape (1024x768)
- ✅ Desktop (1920x1080)
- ✅ Ultra-wide (2560x1440)
- ✅ Dynamic resize (desktop → mobile → desktop)
- ✅ Device rotation (portrait ↔ landscape)

### Edge Cases

- ✅ Very small viewport (320x568)
- ✅ Very large viewport (3840x2160)
- ✅ Rapid milestone changes
- ✅ Overlay dismiss during animation
- ✅ Reduced motion preference

### Visual Verification

- ✅ No characters overlap central content
- ✅ No characters overlap each other
- ✅ Characters stay within viewport bounds
- ✅ Smooth fade-in animation
- ✅ Organic floating motion
- ✅ Proper z-indexing (behind main content)
- ✅ Correct opacity (90%)

## Future Improvements

### Potential Enhancements

1. **Advanced Positioning Algorithms**
   - Implement true Poisson Disk Sampling for more uniform distribution
   - Add blue noise sampling for aesthetic placement
   - Consider force-directed layout for organic clustering

2. **Animation Variations**
   - Add subtle rotation to float animation
   - Implement parallax effect based on scroll
   - Add occasional "twinkle" or pulse effects

3. **Performance**
   - Use Web Workers for position calculation
   - Implement virtual scrolling for very high counts
   - Add requestAnimationFrame optimization

4. **Accessibility**
   - Add option to disable animations
   - Respect `prefers-reduced-motion` more granularly
   - Add screen reader announcements

5. **Visual Effects**
   - Add subtle glow or shadow effects
   - Implement color transitions
   - Add particle trails during fade-in

6. **Configuration**
   - Expose configuration via preferences
   - Allow custom character sets
   - Add density/spacing controls

## Dependencies

- **random-js** (v2.1.0): Seedable random number generation
- **framer-motion**: Animation library for smooth transitions
- **React**: Component framework
- **TypeScript**: Type safety

## Related Files

- `/data-kanji/decorations.json` - Kanji character data
- `features/Preferences/index.ts` - Theme color definitions
- `shared/styles/animations.css` - Float animation keyframes
- `tailwind.config.ts` - Animation configuration

---

**Last Updated:** 2026-04-06  
**Author:** KanaDojo Development Team  
**Version:** 1.0.0
