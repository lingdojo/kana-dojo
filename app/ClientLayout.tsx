'use client';
import clsx from 'clsx';
import { useState, useEffect, startTransition, useMemo, useRef } from 'react';
import usePreferencesStore from '@/features/Preferences/store/usePreferencesStore';
import { useCrazyMode } from '@/features/CrazyMode';
import { useShallow } from 'zustand/react/shallow';
import { usePathname } from 'next/navigation';
import { ScrollRestoration } from 'next-scroll-restoration';
import WelcomeModal from '@/shared/ui-composite/Modals/WelcomeModal';
import { DonationModal } from '@/features/Preferences';
import useOnboardingStore from '@/shared/store/useOnboardingStore';
import {
  AchievementNotificationContainer,
  AchievementIntegration,
  AchievementPromptsContainer,
} from '@/features/Achievements/components';
import {
  applyTheme,
  isPremiumThemeId,
} from '@/features/Preferences/theme';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { useIsMobile } from '@/shared/hooks/useIsMobile';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useLocalStorage } from '@/shared/hooks/useLocalStorage';
import { useSession } from 'next-auth/react';
import { useAuth } from '@/features/Auth';
import { useUser } from '@/features/User';
import { useNotifications } from '@/features/Notifications';
import { useSettings } from '@/features/Settings';
import { useProfile } from '@/features/Profile';
import { useDashboard } from '@/features/Dashboard';
import { useAnalytics } from '@/features/Analytics';
import { useReports } from '@/features/Reports';
import { useAuditLog } from '@/features/AuditLog';
import { useSecurity } from '@/features/Security';
import { useCompliance } from '@/features/Compliance';
import { useGovernance } from '@/features/Governance';
import { useRisk } from '@/features/Risk';
import { usePortfolio } from '@/features/Portfolio';
import { useTrading } from '@/features/Trading';
import { useMarketData } from '@/features/MarketData';
import { useOrderBook } from '@/features/OrderBook';
import { useCandlesticks } from '@/features/Candlesticks';
import { useTickers } from '@/features/Tickers';
import { useNews } from '@/features/News';
import { useSentiment } from '@/features/Sentiment';
import { useIndicators } from '@/features/Indicators';
