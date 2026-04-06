import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './button';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: [
        'default',
        'destructive',
        'outline',
        'secondary',
        'ghost',
        'link',
      ],
    },
    size: {
      control: { type: 'radio' },
      options: ['default', 'sm', 'lg', 'icon'],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// 🔹 Variants
export const Default: Story = {
  args: { children: 'Default', variant: 'default' },
};
export const Destructive: Story = {
  args: { children: 'Delete', variant: 'destructive' },
};
export const Outline: Story = {
  args: { children: 'Outline', variant: 'outline' },
};
export const Secondary: Story = {
  args: { children: 'Secondary', variant: 'secondary' },
};
export const Ghost: Story = { args: { children: 'Ghost', variant: 'ghost' } };
export const Link: Story = { args: { children: 'Link', variant: 'link' } };

// 🔹 Sizes
export const Small: Story = { args: { children: 'Small', size: 'sm' } };
export const Large: Story = { args: { children: 'Large', size: 'lg' } };
export const Icon: Story = { args: { children: '🔍', size: 'icon' } };

// 🔹 States / Edge cases
export const Disabled: Story = {
  args: { children: 'Disabled', disabled: true },
};
export const AsLink: Story = {
  args: { asChild: true, children: <a href='#'>Go somewhere</a> },
};
export const LongText: Story = {
  args: { children: 'This is a very long button text to check wrapping...' },
};
export const SpecialChars: Story = {
  args: {
    children: 'Special chars: àéïõü 中文 🎉',
    size: 'default',
    asChild: false,
    variant: 'outline',
  },
  argTypes: {
    size: { control: { type: 'radio' }, options: ['default', 'sm', 'lg'] },
  },
};
