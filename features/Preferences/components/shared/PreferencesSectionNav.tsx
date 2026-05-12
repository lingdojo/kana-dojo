'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/utils/utils';
import { useClick } from '@/shared/hooks/generic/useAudio';
import { Joystick, Palette, Wand2 } from 'lucide-react';

const ACTIVE_SECTION_OFFSET = 156;
const NAV_CLICK_SUPPRESSION_MS = 3000;
const SCROLL_TIMEOUT_MS = 350;
const SCROLL_CONTAINER_SELECTOR = '[data-scroll-restoration-id="container"]';

type SectionId = 'behavior' | 'display' | 'effects';

interface SectionItem {
  id: SectionId;
  label: string;
  icon: typeof Joystick;
}

const sections: SectionItem[] = [
  {
    id: 'behavior',
    label: 'Behavior',
    icon: Joystick,
  },
  {
    id: 'display',
    label: 'Display',
    icon: Palette,
  },
  {
    id: 'effects',
    label: 'Effects',
    icon: Wand2,
  },
];

const getSectionElements = () =>
  sections
    .map(section => document.getElementById(section.id))
    .filter((element): element is HTMLElement => Boolean(element));

const getScrollContainer = () =>
  document.querySelector(SCROLL_CONTAINER_SELECTOR) as HTMLElement | null;

const PreferencesSectionNav = () => {
  const [activeSection, setActiveSection] = useState<SectionId>('behavior');
  const { playClick } = useClick();
  const suppressedSectionRef = useRef<SectionId | null>(null);
  const suppressionTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const scrollContainer = getScrollContainer();
    if (!scrollContainer) return;

    const updateActiveSection = () => {
      const sectionElements = getSectionElements();
      if (sectionElements.length === 0) return;

      if (suppressedSectionRef.current) {
        const suppressedSection = suppressedSectionRef.current;
        setActiveSection(currentSection =>
          currentSection === suppressedSection
            ? currentSection
            : suppressedSection,
        );
        return;
      }

      const triggerLine =
        scrollContainer.getBoundingClientRect().top + ACTIVE_SECTION_OFFSET;

      const crossedSections = sectionElements.filter(
        sectionElement =>
          sectionElement.getBoundingClientRect().top <= triggerLine,
      );

      const nextActiveSection: SectionId =
        crossedSections.length > 0
          ? (crossedSections[crossedSections.length - 1].id as SectionId)
          : (sectionElements[0].id as SectionId);

      setActiveSection(currentSection =>
        currentSection === nextActiveSection
          ? currentSection
          : nextActiveSection,
      );
    };

    updateActiveSection();
    scrollContainer.addEventListener('scroll', updateActiveSection, {
      passive: true,
    });
    window.addEventListener('resize', updateActiveSection);

    return () => {
      if (suppressionTimeoutRef.current) {
        window.clearTimeout(suppressionTimeoutRef.current);
      }
      scrollContainer.removeEventListener('scroll', updateActiveSection);
      window.removeEventListener('resize', updateActiveSection);
    };
  }, []);

  const handleNavigate = (
    event: React.MouseEvent<HTMLAnchorElement>,
    sectionId: SectionId,
  ) => {
    event.preventDefault();
    playClick();

    const section = document.getElementById(sectionId);
    const scrollContainer = getScrollContainer();
    if (!section || !scrollContainer) return;

    if (suppressionTimeoutRef.current) {
      window.clearTimeout(suppressionTimeoutRef.current);
    }

    suppressedSectionRef.current = sectionId;
    setActiveSection(sectionId);

    const containerRect = scrollContainer.getBoundingClientRect();
    const sectionRect = section.getBoundingClientRect();
    const targetTop =
      scrollContainer.scrollTop +
      (sectionRect.top - containerRect.top) -
      ACTIVE_SECTION_OFFSET;

    scrollContainer.scrollTo({
      top: Math.max(0, targetTop),
      behavior: 'smooth',
    });

    suppressionTimeoutRef.current = window.setTimeout(() => {
      suppressedSectionRef.current = null;
      suppressionTimeoutRef.current = null;
    }, NAV_CLICK_SUPPRESSION_MS);

    window.setTimeout(() => {
      window.history.replaceState(null, '', `#${sectionId}`);
    }, SCROLL_TIMEOUT_MS);
  };

  return (
    <div className='sticky top-2 z-40'>
      <div className='mx-auto w-full max-w-fit rounded-2xl border-1 border-(--border-color) bg-(--background-color) p-1 shadow-[0_12px_40px_rgba(0,0,0,0.18)] backdrop-blur-xl'>
        <div className='flex w-full gap-0 rounded-2xl bg-(--card-color) p-0'>
          {sections.map(section => {
            const isSelected = activeSection === section.id;
            const Icon = section.icon;

            return (
              <div key={section.id} className='relative flex-1'>
                {isSelected && (
                  <motion.div
                    layoutId='activePreferencesSectionTab'
                    className='absolute inset-0 rounded-2xl border-b-10 border-(--main-color-accent) bg-(--main-color)'
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 30,
                    }}
                  />
                )}
                <a
                  href={`#${section.id}`}
                  onClick={event => handleNavigate(event, section.id)}
                  className={cn(
                    'relative z-10 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl px-5 pt-2 pb-4 text-sm font-semibold no-underline transition-colors duration-300 sm:px-5',
                    isSelected
                      ? 'text-(--background-color)'
                      : 'text-(--secondary-color)/70 hover:text-(--main-color)',
                  )}
                  aria-label={section.label}
                  aria-current={isSelected ? 'location' : undefined}
                >
                  <Icon className='h-5 w-5 shrink-0' />
                  <span className='hidden sm:inline'>{section.label}</span>
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PreferencesSectionNav;

