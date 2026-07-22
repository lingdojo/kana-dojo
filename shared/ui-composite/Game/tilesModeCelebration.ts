'use client';

export const celebrationContainerVariants = {
  idle: {},
  celebrate: {
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.08,
    },
  },
};

export const celebrationBounceVariants = {
  idle: {
    y: 0,
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
  },
  celebrate: {
    y: [0, -32, -35, 0, -10, 0],
    scaleX: [1, 0.94, 0.96, 1.06, 0.98, 1],
    scaleY: [1, 1.08, 1.04, 0.92, 1.02, 1],
    opacity: [1, 1, 1, 1, 1, 1],
    transition: {
      duration: 1,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      times: [0, 0.25, 0.35, 0.6, 0.8, 1],
    },
  },
};

export const celebrationExplodeContainerVariants = {
  idle: {},
  celebrate: {
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.04,
    },
  },
};

export const explosionKeyframes = `
@keyframes explode {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.5);
    opacity: 0.5;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
`;
