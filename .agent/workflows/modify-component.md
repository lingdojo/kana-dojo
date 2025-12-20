---
description: how to modify existing components
---

When modifying existing React components, follow these guidelines from AGENTS.md:

## Component Modification Rules

1. **Understand the architecture first:**
   - Check if the component is in `features/` (feature-specific) or `shared/` (reusable)
   - Review existing patterns in similar components

2. **Follow component structure:**

   ```typescript
   'use client'; // Only if needed (client-side interactivity)

   import { useState } from 'react';
   import { useTranslations } from 'next-intl';
   import { cn } from '@/shared/lib/utils';
   import useFeatureStore from '../store/useFeatureStore';

   interface ComponentProps {
     // Props interface
   }

   export default function Component({ prop }: ComponentProps) {
     const t = useTranslations('namespace');
     // Component logic
     return (
       // JSX
     );
   }
   ```

3. **Styling conventions:**
   - Use `cn()` utility for conditional class merging
   - Use Tailwind CSS utilities
   - Use CSS variables for theme colors: `var(--main-color)`, `var(--background-color)`

4. **Audio feedback:**

   ```typescript
   import { useClick, useCorrect, useError } from '@/shared/hooks/useAudio';
   const { playClick } = useClick();
   ```

5. **State management:**
   - Use Zustand stores from `features/[Feature]/store/`
   - Use React hooks for local component state

6. **Before finishing:**
   // turbo
   - Run `cmd /c npm run check` to verify no errors
