'use client';
import { motion } from 'framer-motion';
import React from 'react';

interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  delay = 0,
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        ease: 'easeOut',
        delay,
      }}
      viewport={{ once: true, amount: 0.2 }} // 👈 triggers when visible in scroll
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;
