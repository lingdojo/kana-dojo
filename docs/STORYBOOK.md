# Storybook Setup Guide

This guide explains how to set up and use Storybook for KanaDojo UI component development.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Configuration](#configuration)
- [Creating Stories](#creating-stories)
- [Running Storybook](#running-storybook)
- [Best Practices](#best-practices)
- [Available Stories](#available-stories)

---

## Overview

[Storybook](https://storybook.js.org/) is a tool for developing UI components in isolation. It provides:

- **Visual testing** of components in different states
- **Documentation** automatically generated from stories
- **Interactive development** environment
- **Component gallery** for the design system

---

## Installation

Install Storybook with the following command:

```bash
npx storybook@latest init --type react --builder vite --yes
```

This will:

1. Install dependencies (may take a few minutes)
2. Create `.storybook/` configuration directory
3. Add example stories to `stories/`
4. Update `package.json` with scripts

### Available Scripts

After installation, these scripts are available:

```bash
# Start Storybook development server
npm run storybook

# Build static Storybook for deployment
npm run build-storybook

# Run Storybook tests
npm run test-storybook
```

---

## Configuration

### Path Aliases

Storybook is configured to use the same path aliases as the main application:

```typescript
// .storybook/main.ts
import path from 'path';

const config = {
  // ...
  viteFinal: async config => {
    return {
      ...config,
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '../'),
          '@/features': path.resolve(__dirname, '../features'),
          '@/shared': path.resolve(__dirname, '../shared'),
          '@/core': path.resolve(__dirname, '../core')
        }
      }
    };
  }
};
```

### Preview Configuration

The preview file (`.storybook/preview.ts`) sets global parameters for all stories:

```typescript
import type { Preview } from '@storybook/react-vite';

const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    }
    // Add more global parameters here
  }
};

export default preview;
```

---

## Creating Stories

### Basic Story Structure

Stories are written in TypeScript and follow this pattern:

```typescript
// components/ui/button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost']
    }
  }
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'default'
  }
};

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'default'
  }
};
```

### Story File Location

Place story files next to the components they document:

```
shared/components/
├── ui/
│   ├── button.tsx          # Component
│   └── button.stories.tsx  # Stories
├── dialog.tsx
└── dialog.stories.tsx
```

### Story Organization

Use the `title` property to organize stories in the sidebar:

```typescript
// UI components
export const MyComponent = { title: 'UI/MyComponent' };

// Feature components
export const GameCard = { title: 'Features/Game/GameCard' };

// Layout components
export const Header = { title: 'Layout/Header' };
```

### Args and ArgsTypes

Use `args` to define default props and `argTypes` to configure controls:

```typescript
const meta = {
  component: MyComponent,
  args: {
    variant: 'default',
    size: 'medium'
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: 'The size variant of the component'
    },
    onClick: { action: 'clicked' }
  }
};
```

### Decorators

Use decorators to wrap stories with additional context:

```typescript
const meta = {
  component: MyComponent,
  decorators: [
    (Story) => (
      <div style={{ padding: '2rem' }}>
        <Story />
      </div>
    ),
  ],
};
```

---

## Running Storybook

### Development

Start the Storybook development server:

```bash
npm run storybook
```

This will:

- Start a local server (typically at `http://localhost:6006`)
- Watch for changes and hot reload
- Show component documentation

### Building

Build a static version for deployment:

```bash
npm run build-storybook
```

Output is saved to `storybook-static/` and can be deployed to any static host.

### CI Testing

Run Storybook tests in CI:

```bash
npm run test-storybook
```

---

## Best Practices

### 1. One Story File Per Component

Keep stories co-located with components:

```
components/
└── MyComponent/
    ├── index.ts       # Exports
    ├── MyComponent.tsx
    ├── MyComponent.stories.tsx  # Stories here
    └── MyComponent.test.tsx     # Tests here
```

### 2. Cover Key States

Document important component states:

```typescript
export const States: Story = {
  args: {
    // Default state
  }
};

export const Loading: Story = {
  args: {
    loading: true
  }
};

export const Disabled: Story = {
  args: {
    disabled: true
  }
};

export const Error: Story = {
  args: {
    error: 'Something went wrong'
  }
};
```

### 3. Use Controls Effectively

Configure controls for better DX:

```typescript
argTypes: {
  variant: {
    control: { type: 'select' },
    options: ['primary', 'secondary', 'tertiary'],
  },
  size: {
    control: { type: 'radio' },
    options: ['small', 'medium', 'large'],
  },
  onAction: { action: 'action' },
  children: { control: 'text' },
},
```

### 4. Document Edge Cases

Add stories for edge cases:

```typescript
export const LongText: Story = {
  args: {
    children: 'Very long text that might cause wrapping issues...'
  }
};

export const SpecialCharacters: Story = {
  args: {
    children: 'Special chars: àéïõü 中文 にほんご 🎉'
  }
};
```

---

## Available Stories

Currently documented components:

| Component   | Location                                        | Status      |
| ----------- | ----------------------------------------------- | ----------- |
| Button      | `shared/components/ui/button.stories.tsx`       | ✅ Complete |
| AlertDialog | `shared/components/ui/alert-dialog.stories.tsx` | 📝 To Do    |
| Dialog      | `shared/components/ui/dialog.stories.tsx`       | 📝 To Do    |
| Select      | `shared/components/ui/select.stories.tsx`       | 📝 To Do    |

---

## Addons

Storybook includes these addons:

| Addon                           | Purpose                           |
| ------------------------------- | --------------------------------- |
| `@storybook/addon-essentials`   | Controls, actions, docs, viewport |
| `@storybook/addon-interactions` | Interaction testing               |
| `@storybook/addon-a11y`         | Accessibility testing             |
| `@storybook/addon-docs`         | Auto-generated docs               |

---

## Troubleshooting

### Missing Dependencies

If you see errors about missing modules:

```bash
npm install
```

### Type Errors

If TypeScript errors occur:

```bash
# Restart TypeScript server in your IDE
# Or regenerate types
npm run i18n:generate-types
```

### Styles Not Loading

Ensure CSS is imported in preview:

```typescript
// .storybook/preview.ts
import '../app/globals.css';
```

---

## Resources

- [Storybook Documentation](https://storybook.js.org/docs)
- [Component Story Format](https://storybook.js.org/docs/api/csf)
- [Storybook Addons](https://storybook.js.org/docs/addons)
