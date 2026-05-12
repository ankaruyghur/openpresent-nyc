'use client';

import type { CSSProperties, MouseEventHandler } from 'react';
import { PALETTE } from './data';

type Props = {
  width: number | string;
  height: number | string;
  label?: string;
  accent?: string;
  style?: CSSProperties;
  onClick?: MouseEventHandler<HTMLDivElement>;
  className?: string;
};

export function PlaceholderImg({ width, height, label, accent, style, onClick, className }: Props) {
  const c = accent || PALETTE.gray3;
  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        width,
        height,
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(175deg, ${c}33 0%, ${c}18 40%, ${PALETTE.gray2}44 100%)`,
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.08,
          background: `repeating-linear-gradient(135deg, ${PALETTE.dark}, ${PALETTE.dark} 1px, transparent 1px, transparent 18px)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-jae-mono), monospace',
          fontSize: 11,
          color: PALETTE.gray4,
          textTransform: 'uppercase',
          letterSpacing: 1.5,
          opacity: 0.5,
          padding: 20,
          textAlign: 'center',
        }}
      >
        {label || 'photograph'}
      </div>
    </div>
  );
}
