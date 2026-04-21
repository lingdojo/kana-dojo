'use client';
import { Link, useRouter, usePathname } from '@/core/i18n/routing';
import {
  House,
  Star,
  Sparkles,
  BookOpen,
  FlaskConical,
  Languages,
  ChevronDown,
  ChevronRight,
  Library,
  Repeat,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { useClick } from '@/shared/hooks/generic/useAudio';
import { useScrollVisibility } from '@/shared/hooks/generic/useScrollVisibility';
import { ReactNode, useEffect, useRef, memo, useState } from 'react';
import { useInputPreferences } from '@/features/Preferences';
import { removeLocaleFromPath } from '@/shared/utils/pathUtils';
import type { Experiment } from '@/shared/data/experiments';
import AuroraText from '@/shared/ui/components/magicui/AuroraText';

const SIDEBAR_SECTION_STORAGE_PREFIX = 'sidebar-collapsible-';
const SIDEBAR_DESKTOP_COLLAPSED_STORAGE_KEY = 'sidebar-desktop-collapsed';
const SIDEBAR_PREFERENCES_VISITED_STORAGE_KEY = 'sidebar-preferences-visited';
const SIDEBAR_ACTIVE_FLOAT_CLASSES =
  'motion-safe:animate-float [--float-distance:-3.5px]';

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

/** Toggle between aurora gradient heading (true) and original heading style (false) */
const USE_AURORA_SIDEBAR_HEADING = false;
/** Toggle between new desktop expanded nav badge icons (true) and previous icon style (false) */
const USE_NEW_SIDEBAR_ICON_BADGES = false;

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
  /** Whether desktop sidebar is collapsed */
  isDesktopCollapsed?: boolean;
  /** Overrides whether the icon should bounce while inactive */
  animateIconWhenInactive?: boolean;
};

const NavLink = memo(
  ({
    item,
    isActive,
    onClick,
    variant,
    useSlidingIndicator = false,
    isDesktopCollapsed = false,
    animateIconWhenInactive,
  }: NavLinkProps) => {
    const Icon = item.icon;
    const isMain = variant === 'main';
    const shouldUseDesktopExpandedBadges =
      USE_NEW_SIDEBAR_ICON_BADGES && !isDesktopCollapsed;

    const baseClasses = clsx(
      'flex items-center gap-2 rounded-2xl transition-all duration-250',
      isMain ? 'text-2xl' : 'text-sm',
      'max-lg:justify-center max-lg:px-3 max-lg:py-2 lg:w-full lg:px-4 lg:py-2',
      !isMain && 'max-lg:hidden',
    );

    const inactiveClasses = 'text-(--secondary-color) hover:bg-(--card-color)';

    const renderIconGlyph = (className?: string): ReactNode => {
      if (item.charIcon) {
        return (
          <span
            className={clsx(
              'inline-flex items-center justify-center leading-none',
              !isMain && 'text-sm',
              className,
            )}
          >
            {item.charIcon}
          </span>
        );
      }

      if (Icon) {
        return (
          <Icon
            className={clsx(
              'shrink-0',
              !isMain && 'h-4 w-4',
              (animateIconWhenInactive ?? item.animateWhenInactive) &&
                !isActive &&
                !(isDesktopCollapsed && isMain) &&
                'motion-safe:animate-bounce',
              item.iconClassName,
              className,
            )}
          />
        );
      }

      return null;
    };

    const renderIcon = (): ReactNode => {
      if (!shouldUseDesktopExpandedBadges) {
        return renderIconGlyph();
      }

      return (
        <>
          <span className='lg:hidden'>{renderIconGlyph()}</span>
          <span className='hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl border-b-4 border-(--main-color-accent) bg-(--main-color) text-(--background-color) lg:flex'>
            {renderIconGlyph('text-(--background-color)')}
          </span>
        </>
      );
    };

    // Sliding indicator style - indicator is rendered separately and animates between items
    if (useSlidingIndicator) {
      const indicatorClasses =
        'h-full w-full rounded-xl lg:rounded-2xl border-b-6 lg:border-b-8 border-(--main-color-accent) bg-(--main-color)';
      const activeTextClass = 'text-(--background-color)';
      const paddingClasses = isMain
        ? 'max-lg:pt-1 max-lg:pb-2.5 lg:pt-2 lg:pb-3'
        : 'max-lg:pt-1 max-lg:pb-2.5 lg:pt-1.5 lg:pb-2.5';

      return (
        <div className='relative lg:w-full'>
          {/* Sliding indicator - smooth spring animation */}
          {isActive && (
            <motion.div
              layoutId='sidebar-nav-indicator'
              className='absolute inset-0 rounded-2xl'
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
              }}
            >
              <div
                className={clsx(indicatorClasses, SIDEBAR_ACTIVE_FLOAT_CLASSES)}
              />
            </motion.div>
          )}
          <Link
            href={item.href}
            prefetch
            onClick={onClick}
            className={clsx(
              'relative z-10 flex items-center gap-2 rounded-2xl',
              isMain ? 'text-2xl' : 'text-sm',
              'max-lg:justify-center max-lg:px-3 lg:w-full lg:px-4',
              isDesktopCollapsed && isMain && 'lg:justify-center lg:px-3',
              paddingClasses,
              !isMain && 'max-lg:hidden',
              isActive && SIDEBAR_ACTIVE_FLOAT_CLASSES,
              isActive
                ? activeTextClass
                : 'text-(--secondary-color) hover:bg-(--card-color)',
            )}
          >
            <span
              className={clsx(
                !isActive &&
                  !(isDesktopCollapsed && isMain) &&
                  'lg:text-(--main-color)',
              )}
            >
              {renderIcon()}
            </span>
            <span
              className={clsx(
                isMain && 'max-lg:hidden',
                isMain && isDesktopCollapsed && 'lg:hidden',
              )}
            >
              {item.label}
            </span>
          </Link>
        </div>
      );
    }

    // Default Link style (inactive)
    return (
      <Link
        href={item.href}
        prefetch
        className={clsx(
          baseClasses,
          isDesktopCollapsed && isMain && 'lg:justify-center lg:px-3',
          inactiveClasses,
        )}
        onClick={onClick}
      >
        {renderIcon()}
        <span
          className={clsx(
            isMain && 'max-lg:hidden',
            isMain && isDesktopCollapsed && 'lg:hidden',
          )}
        >
          {item.label}
        </span>
      </Link>
    );
  },
);

NavLink.displayName = 'NavLink';

type SectionHeaderProps = {
  title: string;
  icon: LucideIcon;
  collapsible?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
};

const SectionHeader = ({
  title,
  icon: Icon,
  collapsible = false,
  isExpanded = false,
  onToggle,
}: SectionHeaderProps) => {
  if (collapsible) {
    return (
      <button
        onClick={onToggle}
        className='group mt-2 mb-2 flex w-full cursor-pointer items-center gap-2 px-4 text-base text-(--main-color) uppercase opacity-70 transition-opacity hover:opacity-100 max-lg:hidden'
      >
        {isExpanded ? (
          <ChevronDown className='h-4 w-4 text-(--border-color) transition-colors duration-300 group-hover:text-(--main-color)' />
        ) : (
          <ChevronRight className='h-4 w-4 text-(--border-color) transition-colors duration-300 group-hover:text-(--main-color)' />
        )}
        <span className='hidden h-7 w-7 shrink-0 items-center justify-center rounded-lg border-b-4 border-(--secondary-color-accent) bg-(--secondary-color) text-(--background-color) transition-colors duration-300 group-hover:border-(--main-color-accent) group-hover:bg-(--main-color) lg:flex'>
          <Icon className='h-4 w-4 text-(--background-color)' />
        </span>
        {title}
      </button>
    );
  }

  return (
    <div className='mt-3 w-full px-4 text-sm text-(--main-color) uppercase opacity-70 max-lg:hidden'>
      <span className='flex items-center gap-1'>
        <span className='hidden h-7 w-7 shrink-0 items-center justify-center rounded-lg border-b-4 border-(--secondary-color-accent) bg-(--secondary-color) text-(--background-color) transition-colors duration-300 group-hover:border-(--main-color-accent) group-hover:bg-(--main-color) lg:flex'>
          <Icon className='h-4 w-4 text-(--background-color)' />
        </span>
        {title}
      </span>
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
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const isVisible = useScrollVisibility();
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(
    () => {
      if (typeof window === 'undefined') return false;
      return (
        sessionStorage.getItem(SIDEBAR_DESKTOP_COLLAPSED_STORAGE_KEY) === 'true'
      );
    },
  );
  const [hasVisitedPreferences, setHasVisitedPreferences] = useState(() => {
    if (typeof window === 'undefined') return false;

    return (
      localStorage.getItem(SIDEBAR_PREFERENCES_VISITED_STORAGE_KEY) === 'true'
    );
  });

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
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(
      SIDEBAR_DESKTOP_COLLAPSED_STORAGE_KEY,
      String(isDesktopSidebarCollapsed),
    );
  }, [isDesktopSidebarCollapsed]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (pathWithoutLocale !== '/preferences' || hasVisitedPreferences) return;

    localStorage.setItem(SIDEBAR_PREFERENCES_VISITED_STORAGE_KEY, 'true');
    setHasVisitedPreferences(true);
  }, [hasVisitedPreferences, pathWithoutLocale]);

  useEffect(() => {
    if (pathWithoutLocale.startsWith('/experiments')) {
      setIsExperimentsExpanded(prev => (prev ? prev : true));
    }
  }, [pathWithoutLocale]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1023px)');
    const updateViewport = () => setIsMobileViewport(mediaQuery.matches);

    updateViewport();
    mediaQuery.addEventListener('change', updateViewport);

    return () => {
      mediaQuery.removeEventListener('change', updateViewport);
    };
  }, []);

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

  const toggleDesktopSidebarCollapse = () => {
    playClick();
    setIsDesktopSidebarCollapsed(prev => !prev);
  };

  return (
    <motion.aside
      id='main-sidebar'
      initial={false}
      animate={{
        y: isMobileViewport ? (isVisible ? 0 : '100%') : 0,
        opacity: isMobileViewport ? (isVisible ? 1 : 0) : 1,
      }}
      transition={{
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      }}
      className={clsx(
        'flex lg:flex-col lg:items-start',
        'lg:relative lg:sticky lg:top-0 lg:h-screen lg:overflow-x-hidden lg:overflow-y-auto',
        'lg:pt-6',
        'max-lg:fixed max-lg:bottom-0 max-lg:w-full',
        'max-lg:bg-(--card-color)',
        'z-50',
        'border-(--border-color) max-lg:items-center max-lg:justify-evenly max-lg:border-t-2 max-lg:py-2',
        'lg:h-auto lg:border-r lg:px-3',
        'lg:transition-[width] lg:duration-300 lg:ease-in-out',
        isDesktopSidebarCollapsed ? 'lg:w-20' : 'lg:w-80',
        'lg:pb-4',
      )}
      // style={{ scrollbarGutter: 'stable' }}
    >
      {/* Logo */}
      <motion.div
        className='hidden overflow-hidden lg:block'
        initial={false}
        animate={{
          height: isDesktopSidebarCollapsed ? 0 : 'auto',
          opacity: isDesktopSidebarCollapsed ? 0 : 1,
          marginBottom: isDesktopSidebarCollapsed ? 0 : 8,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <h1 className='max-3xl:flex-col max-3xl:items-start flex items-center gap-1.5 pl-4 text-3xl'>
          {USE_AURORA_SIDEBAR_HEADING ? (
            <>
              <AuroraText className='font-bold'>KanaDojo</AuroraText>
              <AuroraText className='font-normal'>かな道場️</AuroraText>
            </>
          ) : (
            <>
              <span className='font-bold'>KanaDojo</span>
              <span className='font-normal text-(--secondary-color)'>
                かな道場️
              </span>
            </>
          )}
        </h1>
      </motion.div>

      {/* Main Navigation - with sliding indicator */}
      <div
        className={clsx(
          'max-lg:flex max-lg:w-full max-lg:items-center max-lg:justify-evenly',
          'lg:flex lg:w-full lg:flex-col lg:gap-1',
        )}
      >
        {mainNavItems.map(item => (
          <NavLink
            key={item.href}
            item={item}
            isActive={isActive(item.href)}
            onClick={playClick}
            variant='main'
            useSlidingIndicator={true}
            isDesktopCollapsed={isDesktopSidebarCollapsed}
            animateIconWhenInactive={
              !hasVisitedPreferences && item.href === '/preferences'
            }
          />
        ))}
      </div>

      {/* Secondary Navigation Sections */}
      {!isDesktopSidebarCollapsed &&
        secondaryNavSections.map(section => {
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
                icon={
                  section.title === 'Academy'
                    ? BookOpen
                    : section.title === 'Tools'
                      ? Languages
                      : FlaskConical
                }
                collapsible={section.collapsible}
                isExpanded={isExpanded}
                onToggle={onToggle}
              />
              {/* Only show items if section is expanded or not collapsible */}
              {(!section.collapsible || isExpanded) &&
                section.items.length > 0 && (
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

      <button
        onClick={toggleDesktopSidebarCollapse}
        className={clsx(
          'hidden cursor-pointer items-center rounded-2xl px-3 py-1.5 text-(--secondary-color) transition-colors hover:bg-(--card-color) hover:text-(--main-color) lg:absolute lg:bottom-8 lg:left-5 lg:flex',
        )}
        aria-label={
          isDesktopSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'
        }
      >
        {isDesktopSidebarCollapsed ? (
          <PanelLeftOpen className='h-5 w-5 shrink-0' />
        ) : (
          <PanelLeftClose className='h-5 w-5 shrink-0' />
        )}
      </button>
    </motion.aside>
  );
};

export default Sidebar;

