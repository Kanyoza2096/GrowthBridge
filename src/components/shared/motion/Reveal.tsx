import type { CSSProperties, ReactNode } from 'react';

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  distance?: number;
  once?: boolean;
};

/** Progressive-enhancement reveal: content remains visible until the observer activates. */
export function Reveal({
  children,
  className = '',
  delay = 0,
  duration = 650,
  distance = 18,
  once = true,
}: RevealProps) {
  const style = {
    '--gb-reveal-delay': `${Math.max(0, delay)}ms`,
    '--gb-reveal-duration': `${Math.max(150, duration)}ms`,
    '--gb-reveal-distance': `${Math.max(0, distance)}px`,
  } as CSSProperties;

  return (
    <div
      className={`gb-reveal ${className}`.trim()}
      data-gb-reveal="hidden"
      data-gb-reveal-once={once ? 'true' : 'false'}
      style={style}
    >
      {children}
    </div>
  );
}

type StaggerGroupProps = {
  children: ReactNode;
  className?: string;
};

/** Semantic wrapper for a group of individually revealed items. */
export function StaggerGroup({ children, className = '' }: StaggerGroupProps) {
  return <div className={`gb-stagger-group ${className}`.trim()}>{children}</div>;
}

type StaggerItemProps = RevealProps & {
  index?: number;
  staggerMs?: number;
};

/** Reveals a card/item with a predictable delay inside a StaggerGroup. */
export function StaggerItem({
  children,
  index = 0,
  staggerMs = 90,
  delay = 0,
  ...props
}: StaggerItemProps) {
  return (
    <Reveal {...props} delay={delay + Math.max(0, index) * staggerMs}>
      {children}
    </Reveal>
  );
}
