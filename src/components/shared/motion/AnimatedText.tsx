'use client';

import type { CSSProperties, ElementType } from 'react';

type AnimatedTextProps = {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  className?: string;
  delay?: number;
  staggerMs?: number;
  duration?: number;
};

/** Accessible word-by-word reveal. The full phrase remains one label to assistive technology. */
export function AnimatedText({
  text,
  as: Tag = 'h2',
  className = '',
  delay = 0,
  staggerMs = 55,
  duration = 520,
}: AnimatedTextProps) {
  let wordIndex = 0;
  const pieces = text.split(/(\s+)/);

  return (
    <Tag
      className={`gb-reveal gb-animated-text ${className}`.trim()}
      data-gb-reveal="hidden"
      aria-label={text}
    >
      {pieces.map((piece, index) => {
        if (/^\s+$/.test(piece)) return piece;
        const currentWord = wordIndex++;
        const style = {
          '--gb-word-delay': `${Math.max(0, delay) + currentWord * Math.max(0, staggerMs)}ms`,
          '--gb-word-duration': `${Math.max(150, duration)}ms`,
        } as CSSProperties;
        return (
          <span aria-hidden="true" data-gb-word key={`${index}-${piece}`} style={style}>
            {piece}
          </span>
        );
      })}
    </Tag>
  );
}
