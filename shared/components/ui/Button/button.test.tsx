import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { Button } from './button';
import Link from 'next/link';

describe('Button component', () => {
    const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const;
    const sizes = ['default', 'sm', 'lg', 'icon'] as const;

    // Helper: check if an element has any class that starts with a prefix
    const hasClassStartingWith = (el: HTMLElement, prefix: string) =>
        Array.from(el.classList).some((c) => c.startsWith(prefix));

    // Test variants
    variants.forEach((variant) => {
        it(`renders variant: ${variant}`, () => {
            render(<Button variant={variant}>Button</Button>);
            const btn = screen.getByRole('button', { name: /button/i });

            switch (variant) {
                case 'link':
                    expect(btn).toHaveClass('underline-offset-4');
                    break;
                case 'outline':
                    expect(btn).toHaveClass('border');
                    break;
                case 'ghost':
                    expect(btn).toHaveClass('bg-transparent');
                    break;
                default:
                    // default, destructive, secondary
                    expect(hasClassStartingWith(btn, 'bg-')).toBe(true);
            }
        });
    });

    // Test sizes
    sizes.forEach((size) => {
        it(`renders size: ${size}`, () => {
            render(<Button size={size}>Button</Button>);
            const btn = screen.getByRole('button', { name: /button/i });

            switch (size) {
                case 'sm':
                    expect(btn).toHaveClass('h-8');
                    break;
                case 'lg':
                    expect(btn).toHaveClass('h-12');
                    break;
                case 'icon':
                    expect(btn).toHaveClass('w-10');
                    break;
                default:
                    expect(btn).toHaveClass('h-10');
            }
        });
    });

    // Edge cases
    it('renders disabled', () => {
        render(<Button disabled>Button</Button>);
        expect(screen.getByRole('button', { name: /button/i })).toBeDisabled();
    });

    it('renders asChild with Link', () => {
        render(
            <Button asChild>
                <Link href="/test">Link</Link>
            </Button>
        );
        const link = screen.getByRole('link', { name: /link/i });
        expect(link).toBeInTheDocument();
        expect(link.tagName).toBe('A');
    });

    it('renders long text', () => {
        const text = 'This is a very long button text to check wrapping...';
        render(<Button>{text}</Button>);
        expect(screen.getByRole('button', { name: text })).toBeInTheDocument();
    });

    it('renders special characters', () => {
        const text = 'Special chars: àéïõü 中文 🎉';
        render(<Button>{text}</Button>);
        expect(screen.getByRole('button', { name: text })).toBeInTheDocument();
    });
});