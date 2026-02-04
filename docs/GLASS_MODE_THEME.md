# Glass Mode Theme - Walkthrough & Documentation

This document provides a comprehensive guide to the **Glass Mode** (Transparent) theme implementation in KanaDojo. This "Special" theme uses a wallpaper-based background with semi-transparent, blurred UI layers to create a premium, modern aesthetic inspired by high-end gaming and chess platforms.

---

## 🎨 Design Philosophy

The Glass Mode theme deviates from traditional "flat" or "solid color" themes by:

1.  **Transparency**: Using alpha-channel OKLCH colors for UI surfaces.
2.  **Depth**: Leveraging `backdrop-filter: blur()` to create separation from the background.
3.  **Immersion**: Applying a fixed-position wallpaper that stays steady while content scrolls.

---

## 🛠️ Implementation Details

### 1. Theme Definition

The theme is defined in `features/Preferences/data/themes.ts` under the **Special** group.

**Theme Object:**

```typescript
{
  id: 'neon-city-glass',
  backgroundColor: 'oklch(0% 0 0 / 0)', // Fully transparent base
  mainColor: 'oklch(100% 0 0)',         // High contrast white
  secondaryColor: 'oklch(85% 0 0)',      // Muted light gray
}
```

### 2. Glass Surface Logic

Because standard theme generation assumes solid colors, glass themes require specialized overrides to ensure card and border transparency.

In `themes.ts`, we use helper functions:

- `getModifiedCardColor(themeId, cardColor)`: Returns a semi-transparent OKLCH for the `neon-city-glass` theme.
- `getModifiedBorderColor(themeId, borderColor)`: Returns a subtle, thin white border with low opacity.

### 3. Wallpaper Application

The wallpaper is managed at the layout level in `app/ClientLayout.tsx`.

```tsx
style={{
  ...(effectiveTheme === 'neon-city-glass' ? {
    backgroundImage: "url('/wallpapers/neonretrocarcity.jpg')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed'
  } : {})
}}
```

### 4. Backdrop Blur

To maintain readability on top of a photographic background, we apply `backdrop-blur-xl` to main containers. This is implemented in components like `MainMenu/index.tsx`:

```tsx
<div className={clsx(
  'rounded-2xl bg-[var(--card-color)]',
  'backdrop-blur-xl',
  // ... other classes
)}>
```

---

## 📂 Assets

- **Wallpaper Directory**: `/public/wallpapers/`
- **Current Wallpaper**: `neonretrocarcity.jpg`

---

## 🧪 Verification Plan

When testing variations of this theme:

1.  **Transparency Check**: Ensure the wallpaper is visible _through_ the cards.
2.  **Blur Check**: Verify that elements behind the cards are blurred, providing focus.
3.  **Readability Check**: Verify that `mainColor` (White) remains legible against the blurred background.
4.  **Scroll Stability**: The `background-attachment: fixed` property ensures the car and city background don't move when the user scrolls the character grid.

---

## 📝 Known Considerations

- **Button Styling**: Classic buttons using solid `--main-color` may appear opaque. If a more glassy look is desired for buttons, consider using a `bg-opacity` modifier or custom glass variables.
- **Performance**: High blur values (`backdrop-blur-xl`) and fixed backgrounds can be heavy on mobile devices. Monitor rendering performance if more complex wallpapers are added.

---

_Last Updated: February 2026_
