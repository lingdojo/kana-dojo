'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import clsx from 'clsx';
import { Trophy, X } from 'lucide-react';
import useAchievementStore, {
  type AchievementNotification as NotificationType
} from '@/features/Achievements/store/useAchievementStore';
import { useClick } from '@/shared/hooks/useAudio';
import { cardBorderStyles } from '@/shared/lib/styles';

interface AchievementNotificationProps {
  notification: NotificationType;
  onDismiss: (id: string) => void;
  onViewDetails: (achievement: NotificationType['achievement']) => void;
}

const AchievementNotification = ({
  notification,
  onDismiss,
  onViewDetails
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
          className={clsx(
            'relative w-80 p-4 cursor-pointer',
            'bg-[var(--card-color)] shadow-lg',
            cardBorderStyles,
            'border-l-4 border-l-yellow-500',
            'hover:shadow-xl transition-shadow duration-200'
          )}
          onClick={handleViewDetails}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className={clsx(
              'absolute top-2 right-2 p-1 rounded',
              'text-[var(--secondary-color)] hover:text-[var(--main-color)]',
              'hover:bg-[var(--background-color)] transition-colors duration-200'
            )}
          >
            <X size={14} />
          </button>

          <div className='flex items-start gap-3 pr-6'>
            {/* Achievement Icon */}
            <div className='flex-shrink-0'>
              <div
                className={clsx(
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  'bg-yellow-100 text-yellow-600 text-lg font-bold'
                )}
              >
                {notification.achievement.icon}
              </div>
            </div>

            {/* Content */}
            <div className='flex-1 min-w-0'>
              <div className='flex items-center gap-2 mb-1'>
                <Trophy size={14} className='text-yellow-500' />
                <span className='text-xs font-semibold text-yellow-600 uppercase tracking-wide'>
                  Achievement Unlocked
                </span>
              </div>

              <h4 className='font-semibold text-[var(--main-color)] text-sm mb-1 truncate'>
                {notification.achievement.title}
              </h4>

              <p className='text-xs text-[var(--secondary-color)] line-clamp-2'>
                {notification.achievement.description}
              </p>

              <div className='flex items-center justify-between mt-2'>
                <span className='text-xs text-yellow-600 font-medium'>
                  +{notification.achievement.points} points
                </span>
                <span className='text-xs text-[var(--secondary-color)]'>
                  Click to view
                </span>
              </div>
            </div>
          </div>

          {/* Progress bar animation */}
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: 8, ease: 'linear' }}
            className='absolute bottom-0 left-0 h-1 bg-yellow-500 rounded-b-lg'
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
    state => state.markNotificationSeen
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
          className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]'
          onClick={handleCloseModal}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={clsx(
              'w-full max-w-md p-6 text-center',
              'bg-[var(--card-color)]',
              cardBorderStyles
            )}
            onClick={e => e.stopPropagation()}
          >
            <div className='text-4xl mb-4'>{selectedAchievement.icon}</div>
            <h3 className='text-xl font-bold text-[var(--main-color)] mb-2'>
              {selectedAchievement.title}
            </h3>
            <p className='text-[var(--secondary-color)] mb-4'>
              {selectedAchievement.description}
            </p>
            <div className='text-sm text-yellow-600 font-medium mb-4'>
              +{selectedAchievement.points} Achievement Points
            </div>
            <button
              onClick={handleCloseModal}
              className={clsx(
                'px-6 py-2 rounded-lg',
                'bg-[var(--background-color)] text-[var(--main-color)]',
                'hover:bg-[var(--border-color)] transition-colors duration-200'
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
