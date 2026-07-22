'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import useAchievementStore, {
  type AchievementNotification as NotificationType,
} from '../../store/useAchievementStore';
import { useClick } from '@/shared/hooks/generic/useAudio';
import { AchievementCard } from '@/shared/ui';
import { cardBorderStyles } from '@/shared/utils/styles';

interface AchievementNotificationProps {
  notification: NotificationType;
  onDismiss: (id: string) => void;
  onViewDetails: (achievement: NotificationType['achievement']) => void;
}

const AchievementNotification = ({
  notification,
  onDismiss,
  onViewDetails,
}: AchievementNotificationProps) => {
  const { playClick } = useClick();
  const [isVisible, setIsVisible] = useState(true);

  // Auto-dismiss after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss();
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss(notification.id);
    }, 300);
  };

  const handleViewDetails = () => {
    playClick();
    onViewDetails(notification.achievement);
    handleDismiss();
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClick();
    handleDismiss();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          <AchievementCard
            achievement={notification.achievement}
            isUnlocked
            variant='notification'
            onClick={handleViewDetails}
            onClose={handleClose}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Container component for managing multiple notifications
export const AchievementNotificationContainer = () => {
  const [isClient, setIsClient] = useState(false);
  const notifications = useAchievementStore(state => state.unseenNotifications);
  const markNotificationSeen = useAchievementStore(
    state => state.markNotificationSeen,
  );
  const [selectedAchievement, setSelectedAchievement] = useState<
    NotificationType['achievement'] | null
  >(null);
  const [showModal, setShowModal] = useState(false);

  // Client-side only initialization
  useEffect(() => {
    setIsClient(true);
    // Initialize computed properties
    useAchievementStore.getState().updateComputedProperties();
  }, []);

  if (!isClient) {
    return null;
  }

  const handleDismiss = (notificationId: string) => {
    markNotificationSeen(notificationId);
  };

  const handleViewDetails = (achievement: NotificationType['achievement']) => {
    setSelectedAchievement(achievement);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAchievement(null);
  };

  return (
    <>
      {/* Notification Stack */}
      <div className='fixed top-4 right-4 z-50 space-y-2'>
        {notifications.slice(0, 3).map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ y: -20 * index }}
            animate={{ y: 0 }}
            style={{ zIndex: 50 - index }}
          >
            <AchievementNotification
              notification={notification}
              onDismiss={handleDismiss}
              onViewDetails={handleViewDetails}
            />
          </motion.div>
        ))}
      </div>

      {/* Achievement Modal - Import dynamically to avoid circular dependencies */}
      {showModal && selectedAchievement && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm'
          onClick={handleCloseModal}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={clsx(
              'w-full max-w-md p-6 text-center',
              'bg-(--card-color)',
              cardBorderStyles,
            )}
            onClick={e => e.stopPropagation()}
          >
            <div className='mb-4 text-4xl'>{selectedAchievement.icon}</div>
            <h3 className='mb-2 text-xl font-bold text-(--main-color)'>
              {selectedAchievement.title}
            </h3>
            <p className='mb-4 text-(--secondary-color)'>
              {selectedAchievement.description}
            </p>
            <div className='mb-4 text-sm font-medium text-yellow-600'>
              +{selectedAchievement.points} Achievement Points
            </div>
            <button
              onClick={handleCloseModal}
              className={clsx(
                'cursor-pointer rounded-lg px-6 py-2',
                'bg-(--background-color) text-(--main-color)',
                'transition-colors duration-200 hover:bg-(--border-color)',
              )}
            >
              Continue Learning
            </button>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default AchievementNotification;

