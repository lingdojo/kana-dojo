import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

/**
 * Tool recommendation for the callout
 */
export interface ToolRecommendation {
  /** Tool name */
  name: string;
  /** Tool URL */
  href: string;
  /** Short description of how this tool helps */
  description: string;
  /** Icon emoji or component (optional) */
  icon?: string;
}

export interface ToolsCalloutProps {
  /** Title for the callout section */
  title?: string;
  /** List of recommended tools */
  tools: ToolRecommendation[];
  /** Variant style */
  variant?: 'default' | 'compact';
}

/**
 * ToolsCallout Component
 * 
 * Context-aware component to promote relevant tools from learning content pages.
 * Creates internal linking mesh connecting tools to the Japanese learning ecosystem.
 * 
 * Based on kanjikana.com's strategy of dense internal linking (29+ connections).
 */
export function ToolsCallout({
  title = 'Related Tools',
  tools,
  variant = 'default',
}: ToolsCalloutProps) {
  if (tools.length === 0) {
    return null;
  }

  if (variant === 'compact') {
    return (
      <aside className='my-6 rounded-lg border border-(--border-color) bg-(--card-color) p-4'>
        <h3 className='mb-3 text-sm font-semibold text-(--main-color)'>
          {title}
        </h3>
        <div className='flex flex-wrap gap-2'>
          {tools.map(tool => (
            <Link
              key={tool.href}
              href={tool.href}
              className='inline-flex items-center gap-1.5 rounded-md border border-(--border-color) bg-(--background-color) px-3 py-1.5 text-sm font-medium text-(--main-color) transition-colors hover:bg-(--main-color) hover:text-white'
            >
              {tool.icon && <span className='text-base'>{tool.icon}</span>}
              {tool.name}
              <ChevronRight className='h-3 w-3' />
            </Link>
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside className='my-8 rounded-xl border border-(--border-color) bg-(--card-color) p-6'>
      <h3 className='mb-4 text-lg font-semibold text-(--main-color)'>
        {title}
      </h3>
      <div className='grid gap-4 sm:grid-cols-2'>
        {tools.map(tool => (
          <Link
            key={tool.href}
            href={tool.href}
            className='group flex items-start gap-3 rounded-lg border border-(--border-color) p-4 transition-all hover:border-(--main-color) hover:bg-(--main-color)/5'
          >
            {tool.icon && (
              <span className='text-2xl flex-shrink-0'>{tool.icon}</span>
            )}
            <div className='flex-1 min-w-0'>
              <div className='flex items-center gap-2'>
                <h4 className='font-medium text-(--main-color) group-hover:underline'>
                  {tool.name}
                </h4>
                <ChevronRight className='h-4 w-4 text-(--secondary-color) transition-transform group-hover:translate-x-0.5' />
              </div>
              <p className='mt-1 text-sm text-(--secondary-color)'>
                {tool.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </aside>
  );
}
