'use client';

import { INSTAGRAM_URL, PALETTE } from './data';
import { useIsMobile } from './useIsMobile';

export function Footer() {
  const isMobile = useIsMobile();
  return (
    <div
      style={{
        padding: isMobile ? '24px 20px' : '32px 80px',
        borderTop: `1px solid ${PALETTE.gray2}`,
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        gap: isMobile ? 12 : 0,
      }}
    >
      <div style={{ fontFamily: 'var(--font-jae-mono), monospace', fontSize: 9, color: PALETTE.gray3, letterSpacing: 0.8 }}>
        © {new Date().getFullYear()} Jae Cha. All rights reserved.
      </div>
      <div
        style={{
          fontFamily: 'var(--font-jae-mono), monospace',
          fontSize: 9,
          color: PALETTE.gray3,
          letterSpacing: 0.8,
          display: 'flex',
          gap: 20,
        }}
      >
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'inherit', textDecoration: 'none' }}
        >
          Instagram
        </a>
      </div>
    </div>
  );
}
