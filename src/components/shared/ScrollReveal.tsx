import type { ReactNode } from 'react';
import { Reveal } from '@/components/shared/motion/Reveal';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}

/**
 * Backwards-compatible adapter for existing page sections.
 * All scroll entrances now use the shared MotionProvider and Reveal primitives.
 */
export function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = 'up',
}: ScrollRevealProps) {
  return (
    <Reveal
      className={className}
      delay={delay}
      direction={direction}
      distance={direction === 'none' ? 0 : 18}
      duration={680}
    >
      {children}
    </Reveal>
  );
}
