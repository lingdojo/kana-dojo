'use client';
import { Link, useRouter, usePathname } from '@/core/i18n/routing';
import {
  House,
  Star,
  Sparkles,
  BookOpen,
  Languages,
  ChevronDown,
  ChevronRight,
  type LucideIcon
} from 'lucide-react';
import clsx from 'clsx';
import { useClick } from '@/shared/hooks/useAudio';
import { ReactNode, useEffect, useRef, memo, useState } from 'react';
import { useInputPreferences } from '@/features/Preferences';
import { removeLocaleFromPath } from '@/shared/lib/pathUtils';
import type { Experiment } from '@/shared/data/experiments';

// ============================================================================
// Types
// ============================================================================

type NavItem = {
  href: string;
  label: string;
  icon?: LucideIcon | null;
  /** Japanese character to use as icon (e.g., あ, 語, 字) */
  charIcon?: string;
  /** Custom icon class overrides */
  iconClassName?: string;
  /** Whether to animate the icon when not active */
  animateWhenInactive?: boolean;
};

type NavSection = {
  title: string;
  items: NavItem[];
  collapsible?: boolean;
};

// ============================================================================
// Navigation Data
// ============================================================================

const mainNavItems: NavItem[] = [
  { href: '/', label: 'Home', icon: House },
  { href: '/progress', label: 'Progress', icon: Star },
  { href: '/kana', label: 'Kana', charIcon: 'あ' },
  { href: '/vocabulary', label: ' Vocabulary', charIcon: '語' },
  { href: '/kanji', label: ' Kanji', charIcon: '字' },
  {
    href: '/preferences',
    label: 'Preferences',
    icon: Sparkles,
    animateWhenInactive: true
  }
];

// Static sections that don't need lazy loading
const staticSecondaryNavSections: NavSection[] = [
  {
    title: 'Academy',
    items: [{ href: '/academy', label: 'Guides', icon: BookOpen }]
  },
  {
    title: 'Tools',
    items: [{ href: '/translate', label: 'Translate', icon: Languages }]
  }
];

// Base experiments section (without dynamic experiments)
const baseExperimentsSection: NavSection = {
  title: 'Experiments',
  items: [{ href: '/experiments', label: 'All Experiments', icon: Sparkles }],
  collapsible: true
};

// ============================================================================
// Subcomponents
// ============================================================================

type NavLinkProps = {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
  variant: 'main' | 'secondary';
};

const NavLink = memo(({ item, isActive, onClick, variant }: NavLinkProps) => {
  const Icon = item.icon;
  const isMain = variant === 'main';

  const baseClasses = clsx(
    'flex items-center gap-2 rounded-xl transition-all duration-250',
    isMain
      ? 'text-2xl max-lg:justify-center max-lg:px-3 max-lg:py-2 lg:w-full lg:px-4 lg:py-2'
      : 'w-full px-4 py-2 text-xl max-lg:hidden'
  );

  const stateClasses = isActive
    ? 'bg-[var(--border-color)] text-[var(--main-color)] lg:bg-[var(--card-color)]'
    : 'text-[var(--secondary-color)] hover:bg-[var(--card-color)]';

  const renderIcon = (): ReactNode => {
    if (item.charIcon) {
      return item.charIcon;
    }

    if (Icon) {
      return (
        <Icon
          className={clsx(
            'shrink-0',
            item.animateWhenInactive &&
              !isActive &&
              'motion-safe:animate-bounce',
            item.iconClassName
          )}
        />
      );
    }

    return null;
  };

  return (
    <Link
      href={item.href}
      className={clsx(baseClasses, stateClasses)}
      onClick={onClick}
    >
      {renderIcon()}
      <span className={isMain ? 'max-lg:hidden' : undefined}>{item.label}</span>
    </Link>
  );
});

NavLink.displayName = 'NavLink';

type SectionHeaderProps = {
  title: string;
  collapsible?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
};

const SectionHeader = ({
  title,
  collapsible = false,
  isExpanded = false,
  onToggle
}: SectionHeaderProps) => {
  if (collapsible) {
    return (
      <button
        onClick={onToggle}
        className='mt-3 flex w-full items-center gap-1 px-4 text-xs text-[var(--main-color)] uppercase opacity-70 transition-opacity hover:opacity-100 max-lg:hidden'
      >
        {isExpanded ? (
          <ChevronDown className='h-3 w-3' />
        ) : (
          <ChevronRight className='h-3 w-3' />
        )}
        {title}
      </button>
    );
  }

  return (
    <div className='mt-3 w-full px-4 text-xs text-[var(--main-color)] uppercase opacity-70 max-lg:hidden'>
      {title}
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const pathWithoutLocale = removeLocaleFromPath(pathname);

  const { hotkeysOn } = useInputPreferences();
  const { playClick } = useClick();

  const escButtonRef = useRef<HTMLButtonElement | null>(null);

  // Lazy load experiments
  const [loadedExperiments, setLoadedExperiments] = useState<Experiment[]>([]);

  // Collapse state for experiments section
  const [isExperimentsExpanded, setIsExperimentsExpanded] = useState(false);

  useEffect(() => {
    // Dynamically import experiments data
    import('@/shared/data/experiments').then(module => {
      setLoadedExperiments(module.experiments);
    });
  }, []);

  useEffect(() => {
    if (pathWithoutLocale.startsWith('/experiments')) {
      setIsExperimentsExpanded(true);
    }
  }, [pathWithoutLocale]);

  // Build secondary nav sections with lazy-loaded experiments
  const secondaryNavSections: NavSection[] = [
    ...staticSecondaryNavSections,
    {
      ...baseExperimentsSection,
      items: [
        ...baseExperimentsSection.items,
        ...(isExperimentsExpanded
          ? loadedExperiments.map(exp => ({
              href: exp.href,
              label: exp.name,
              icon: exp.icon || null
            }))
          : [])
      ]
    }
  ];

  useEffect(() => {
    if (!hotkeysOn) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in form elements
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (event.key === 'Escape') {
        escButtonRef.current?.click();
      } else if (event.key.toLowerCase() === 'h') {
        router.push('/');
      } else if (event.key.toLowerCase() === 'p') {
        router.push('/preferences');
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [hotkeysOn, router]);

  const isActive = (href: string) => pathWithoutLocale === href;

  return (
    <div
      id='main-sidebar'
      className={clsx(
        'flex lg:flex-col lg:items-start lg:gap-2',
        'lg:sticky lg:top-0 lg:h-screen lg:w-1/5 lg:overflow-y-auto',
        'lg:pt-6',
        'max-lg:fixed max-lg:bottom-0 max-lg:w-full',
        'max-lg:bg-[var(--card-color)]',
        'z-50',
        'border-[var(--border-color)] max-lg:items-center max-lg:justify-evenly max-lg:border-t-2 max-lg:py-2',
        'lg:h-auto lg:border-r-1 lg:px-3',
        'lg:pb-12'
      )}
    >
      {/* Logo */}
      <h1
        className={clsx(
          'flex items-center gap-1.5 pl-4 text-3xl',
          'max-3xl:flex-col max-3xl:items-start max-lg:hidden'
        )}
      >
        <span className='font-bold'>KanaDojo</span>
        <span className='font-normal text-[var(--secondary-color)]'>
          かな道場️
        </span>
      </h1>

      {/* Main Navigation */}
      {mainNavItems.map(item => (
        <NavLink
          key={item.href}
          item={item}
          isActive={isActive(item.href)}
          onClick={playClick}
          variant='main'
        />
      ))}

      {/* Secondary Navigation Sections */}
      {secondaryNavSections.map(section => (
        <div key={section.title} className='contents'>
          <SectionHeader
            title={section.title}
            collapsible={section.collapsible}
            isExpanded={isExperimentsExpanded}
            onToggle={() => setIsExperimentsExpanded(!isExperimentsExpanded)}
          />
          {section.items.map(item => (
            <NavLink
              key={item.href}
              item={item}
              isActive={isActive(item.href)}
              onClick={playClick}
              variant='secondary'
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
