'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/shared/lib/utils';

interface AuroraTextProps extends HTMLMotionProps<'span'> {
  children: React.ReactNode;
}

const AuroraText = ({
  children,
  className,
  ...props
}: AuroraTextProps) => {
  return (
    <motion.span
      {...props}
      className={cn(
        'inline-block bg-clip-text text-transparent',
        '[background-image:linear-gradient(90deg,var(--main-color),var(--secondary-color),var(--main-color))]',
        '[background-size:200%_100%]',
        className,
      )}
      animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
      transition={{ duration: 6, ease: 'linear', repeat: Infinity }}
    >
      {children}
    </motion.span>
  );
};

export default AuroraText;
