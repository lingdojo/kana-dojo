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
  Library,
  Repeat,
  Package,
  type LucideIcon,
} from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { useClick } from '@/shared/hooks/useAudio';
import { ReactNode, useEffect, useRef, memo, useState } from 'react';
import { useInputPreferences } from '@/features/Preferences';
import { removeLocaleFromPath } from '@/shared/lib/pathUtils';
import type { Experiment } from '@/shared/data/experiments';
import { ActionButton } from '@/shared/components/ui/ActionButton';

const SIDEBAR_SECTION_STORAGE_PREFIX = 'sidebar-collapsible-';

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
    animateWhenInactive: true,
  },
];

// Static sections that don't need lazy loading
const staticSecondaryNavSections: NavSection[] = [
  {
    title: 'Academy',
    items: [
      { href: '/academy', label: 'Guides', icon: BookOpen },
      { href: '/resources', label: 'Resources', icon: Library },
    ],
    collapsible: true,
  },
  {
    title: 'Tools',
    items: [
      { href: '/translate', label: 'Translate', icon: Languages },
      { href: '/conjugate', label: 'Conjugate', icon: Repeat },
      { href: '/anki-converter', label: 'Converter', icon: Package },
    ],
    collapsible: true,
  },
];

// Base experiments section (without dynamic experiments)
const baseExperimentsSection: NavSection = {
  title: 'Experiments',
  // items: [{ href: '/experiments', label: 'All Experiments', icon: Sparkles }],
  items: [],
  collapsible: true,
};

// ============================================================================
// Design Toggle
// ============================================================================

/** Toggle between ActionButton style (true) and simple background style (false) for active nav items */
const USE_ACTION_BUTTON_STYLE = true;

// ============================================================================
// Subcomponents
// ============================================================================

type NavLinkProps = {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
  variant: 'main' | 'secondary';
  /** When true, uses framer-motion sliding indicator behind nav item */
  useSlidingIndicator?: boolean;
};

const NavLink = memo(
  ({
    item,
    isActive,
    onClick,
    variant,
    useSlidingIndicator = false,
  }: NavLinkProps) => {
    const Icon = item.icon;
    const isMain = variant === 'main';

    const baseClasses = clsx(
      'flex items-center gap-2 rounded-2xl transition-all duration-250',
      isMain ? 'text-2xl' : 'text-base',
      'max-lg:justify-center max-lg:px-3 max-lg:py-2 lg:w-full lg:px-4 lg:py-2',
      !isMain && 'max-lg:hidden',
    );

    // Style classes for original (simple) design
    const activeClassesSimple =
      'bg-(--border-color) text-(--main-color) lg:bg-(--card-color)';
    const inactiveClasses =
      'text-(--secondary-color) hover:bg-(--card-color)';

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
              item.iconClassName,
            )}
          />
        );
      }

      return null;
    };

    // Sliding indicator style - indicator is rendered separately and animates between items
    if (useSlidingIndicator) {
      // Different indicator styles based on USE_ACTION_BUTTON_STYLE
      const indicatorClasses = USE_ACTION_BUTTON_STYLE
        ? 'absolute inset-0 rounded-xl lg:rounded-2xl border-b-6 lg:border-b-8 border-(--main-color-accent) bg-(--main-color)'
        : 'absolute inset-0 rounded-2xl bg-(--card-color)';

      // Text color when active differs based on style
      const activeTextClass = USE_ACTION_BUTTON_STYLE
        ? 'text-(--background-color)'
        : 'text-(--main-color)';

      // Padding adjustment for ActionButton style (compensate for border)
      const paddingClasses = USE_ACTION_BUTTON_STYLE
        ? isMain
          ? 'max-lg:pt-1 max-lg:pb-2.5 lg:pt-2 lg:pb-3'
          : 'max-lg:pt-1 max-lg:pb-2.5 lg:pt-1.5 lg:pb-2.5'
        : 'max-lg:py-2 lg:py-2';

      return (
        <div className='relative lg:w-full'>
          {/* Sliding indicator - smooth spring animation */}
          {isActive && (
            <motion.div
              layoutId='sidebar-nav-indicator'
              className={indicatorClasses}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
              }}
            />
          )}
          <Link
            href={item.href}
            prefetch
            onClick={onClick}
            className={clsx(
              'relative z-10 flex items-center gap-2 rounded-2xl',
              isMain ? 'text-2xl' : 'text-base',
              'max-lg:justify-center max-lg:px-3 lg:w-full lg:px-4',
              paddingClasses,
              !isMain && 'max-lg:hidden',
              isActive
                ? activeTextClass
                : 'text-(--secondary-color) hover:bg-(--card-color)',
            )}
          >
            <span className={clsx(!isActive && 'lg:text-(--main-color)')}>
              {renderIcon()}
            </span>
            <span className={isMain ? 'max-lg:hidden' : undefined}>
              {item.label}
            </span>
          </Link>
        </div>
      );
    }

    // Active state with ActionButton style (non-sliding)
    if (isActive && USE_ACTION_BUTTON_STYLE) {
      return (
        <Link
          href={item.href}
          prefetch
          onClick={onClick}
          className='w-full max-lg:contents'
        >
          <ActionButton
            borderBottomThickness={6}
            borderRadius='xl'
            className={clsx(
              'flex items-center gap-2',
              isMain ? 'text-2xl' : 'text-base',
              'max-lg:justify-center max-lg:px-3 max-lg:py-2 lg:w-full lg:px-4 lg:py-2',
              !isMain && 'max-lg:hidden',
            )}
          >
            {renderIcon()}
            <span className={isMain ? 'max-lg:hidden' : undefined}>
              {item.label}
            </span>
          </ActionButton>
        </Link>
      );
    }

    // Default Link style (used for inactive, or active with simple style)
    return (
      <Link
        href={item.href}
        prefetch
        className={clsx(
          baseClasses,
          isActive ? activeClassesSimple : inactiveClasses,
        )}
        onClick={onClick}
      >
        {renderIcon()}
        <span className={isMain ? 'max-lg:hidden' : undefined}>
          {item.label}
        </span>
      </Link>
    );
  },
);

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
  onToggle,
}: SectionHeaderProps) => {
  if (collapsible) {
    return (
      <button
        onClick={onToggle}
        className='mt-3 flex w-full cursor-pointer items-center gap-1 px-4 text-xs text-(--main-color) uppercase opacity-70 transition-opacity hover:opacity-100 max-lg:hidden'
      >
        {isExpanded ? (
          <ChevronDown className='h-3 w-3 text-(--secondary-color)' />
        ) : (
          <ChevronRight className='h-3 w-3 text-(--secondary-color)' />
        )}
        {title}
      </button>
    );
  }

  return (
    <div className='mt-3 w-full px-4 text-xs text-(--main-color) uppercase opacity-70 max-lg:hidden'>
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

  // Collapse state for all collapsible sections
  const [isAcademyExpanded, setIsAcademyExpanded] = useState(() => {
    if (typeof window === 'undefined') return false;

    const stored = sessionStorage.getItem(
      `${SIDEBAR_SECTION_STORAGE_PREFIX}academy`,
    );
    return stored === null ? false : stored === 'true';
  });
  const [isToolsExpanded, setIsToolsExpanded] = useState(() => {
    if (typeof window === 'undefined') return false;

    const stored = sessionStorage.getItem(
      `${SIDEBAR_SECTION_STORAGE_PREFIX}tools`,
    );
    return stored === null ? false : stored === 'true';
  });
  const [isExperimentsExpanded, setIsExperimentsExpanded] = useState(() => {
    if (typeof window === 'undefined') return false;

    const stored = sessionStorage.getItem(
      `${SIDEBAR_SECTION_STORAGE_PREFIX}experiments`,
    );
    return stored === null ? false : stored === 'true';
  });

  useEffect(() => {
    const EXPERIMENTS_ORDER_KEY = 'sidebar-experiments-order';

    const shuffleExperiments = (experiments: Experiment[]) => {
      const shuffled = [...experiments];
      for (let i = shuffled.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    const persistOrder = (experimentsList: Experiment[]) => {
      if (typeof window === 'undefined') return;
      sessionStorage.setItem(
        EXPERIMENTS_ORDER_KEY,
        JSON.stringify(experimentsList.map(exp => exp.href)),
      );
    };

    // Dynamically import experiments data
    import('@/shared/data/experiments').then(module => {
      const experiments = module.experiments;

      if (typeof window === 'undefined') {
        setLoadedExperiments(experiments);
        return;
      }

      const storedOrder = sessionStorage.getItem(EXPERIMENTS_ORDER_KEY);

      if (storedOrder) {
        try {
          const hrefOrder: string[] = JSON.parse(storedOrder);
          const orderMap = new Map(
            hrefOrder.map((href, index) => [href, index]),
          );

          const knownExperiments = experiments
            .filter(exp => orderMap.has(exp.href))
            .sort(
              (a, b) =>
                (orderMap.get(a.href) ?? 0) - (orderMap.get(b.href) ?? 0),
            );
          const newExperiments = experiments.filter(
            exp => !orderMap.has(exp.href),
          );
          const combined = [...knownExperiments, ...newExperiments];

          persistOrder(combined);
          setLoadedExperiments(combined);
          return;
        } catch {
          sessionStorage.removeItem(EXPERIMENTS_ORDER_KEY);
        }
      }

      const shuffledExperiments = shuffleExperiments(experiments);
      persistOrder(shuffledExperiments);
      setLoadedExperiments(shuffledExperiments);
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    sessionStorage.setItem(
      `${SIDEBAR_SECTION_STORAGE_PREFIX}academy`,
      String(isAcademyExpanded),
    );
  }, [isAcademyExpanded]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    sessionStorage.setItem(
      `${SIDEBAR_SECTION_STORAGE_PREFIX}tools`,
      String(isToolsExpanded),
    );
  }, [isToolsExpanded]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    sessionStorage.setItem(
      `${SIDEBAR_SECTION_STORAGE_PREFIX}experiments`,
      String(isExperimentsExpanded),
    );
  }, [isExperimentsExpanded]);

  useEffect(() => {
    if (pathWithoutLocale.startsWith('/experiments')) {
      setIsExperimentsExpanded(prev => (prev ? prev : true));
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
              icon: exp.icon || null,
            }))
          : []),
      ],
    },
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

  const isActive = (href: string) => {
    if (href === '/kana') {
      return (
        pathWithoutLocale === href || pathWithoutLocale.startsWith('/kana/')
      );
    }

    return pathWithoutLocale === href;
  };

  return (
    <div
      id='main-sidebar'
      className={clsx(
        'flex lg:flex-col lg:items-start lg:gap-2',
        'lg:sticky lg:top-0 lg:h-screen lg:w-1/5 lg:overflow-y-auto',
        'lg:pt-6',
        'max-lg:fixed max-lg:bottom-0 max-lg:w-full',
        'max-lg:bg-(--card-color)',
        'z-50',
        'border-(--border-color) max-lg:items-center max-lg:justify-evenly max-lg:border-t-2 max-lg:py-2',
        'lg:h-auto lg:border-r lg:px-3',
        'lg:pb-12',
      )}
      // style={{ scrollbarGutter: 'stable' }}
    >
      {/* Logo */}
      <h1
        className={clsx(
          'flex items-center gap-1.5 pl-4 text-3xl',
          'max-3xl:flex-col max-3xl:items-start max-lg:hidden',
        )}
      >
        <span className='font-bold'>KanaDojo</span>
        <span className='font-normal text-(--secondary-color)'>かな道場️</span>
      </h1>

      {/* Main Navigation - with sliding indicator */}
      <div className='contents max-lg:flex max-lg:w-full max-lg:items-center max-lg:justify-evenly'>
        {mainNavItems.map(item => (
          <NavLink
            key={item.href}
            item={item}
            isActive={isActive(item.href)}
            onClick={playClick}
            variant='main'
            useSlidingIndicator={true}
          />
        ))}
      </div>

      {/* Secondary Navigation Sections */}
      {secondaryNavSections.map(section => {
        // Determine which expand state and toggle function to use based on section title
        const isExpanded =
          section.title === 'Academy'
            ? isAcademyExpanded
            : section.title === 'Tools'
              ? isToolsExpanded
              : isExperimentsExpanded;
        const onToggle =
          section.title === 'Academy'
            ? () => setIsAcademyExpanded(prev => !prev)
            : section.title === 'Tools'
              ? () => setIsToolsExpanded(prev => !prev)
              : () => setIsExperimentsExpanded(prev => !prev);

        return (
          <div key={section.title} className='contents'>
            <SectionHeader
              title={section.title}
              collapsible={section.collapsible}
              isExpanded={isExpanded}
              onToggle={onToggle}
            />
            {/* Only show items if section is expanded or not collapsible */}
            {(!section.collapsible || isExpanded) && section.items.length > 0 && (
              <div className='flex w-full flex-col gap-0 max-lg:hidden'>
                {section.items.map(item => (
                  <NavLink
                    key={item.href}
                    item={item}
                    isActive={isActive(item.href)}
                    onClick={playClick}
                    variant='secondary'
                    useSlidingIndicator={true}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Sidebar;

