'use client';

import { useEffect } from 'react';
import useAchievementStore from '../../store/useAchievementStore';
import type {
  Achievement,
  AchievementNotification,
} from '../../store/useAchievementStore';

const DUMMY_ACHIEVEMENT: Achievement = {
  id: '__dev_preview__',
  title: 'Dev Preview',
  description:
    'This is a dummy achievement shown in dev/preview environments only.',
  icon: '🛠️',
  rarity: 'rare',
  points: 42,
  category: 'milestone',
  requirements: { type: 'total_correct', value: 0 },
};

/**
 * Fires a dummy achievement notification on every mount.
 * Only rendered in development and Vercel preview environments.
 * Bypasses the already-unlocked guard by injecting a notification directly.
 */
const DevAchievementPreview = () => {
  useEffect(() => {
    const state = useAchievementStore.getState();
    // Strict Mode mounts twice in dev — skip if one is already pending
    if (state.unseenNotifications.some(n => n.id.startsWith('__dev_preview__')))
      return;

    const notification: AchievementNotification = {
      id: `__dev_preview__-${Date.now()}`,
      achievement: DUMMY_ACHIEVEMENT,
      timestamp: new Date(),
      seen: false,
    };
    useAchievementStore.setState(state => ({
      notifications: [...state.notifications, notification],
      unseenNotifications: [...state.unseenNotifications, notification],
      hasUnseenNotifications: true,
    }));
  }, []);

  return null;
};

export default DevAchievementPreview;
