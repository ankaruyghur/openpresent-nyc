'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { INSTAGRAM_URL, PALETTE, PORTRAIT_SUBS, subSlug } from './data';

type Section = {
  label: string;
  href: string;
  match: (pathname: string) => boolean;
};

const SECTIONS: Section[] = [
  { label: 'Home', href: '/jaecha', match: (p) => p === '/jaecha' },
  { label: 'Portraits', href: '/jaecha/portraits', match: (p) => p.startsWith('/jaecha/portraits') },
  { label: 'Still Life', href: '/jaecha/still-life', match: (p) => p.startsWith('/jaecha/still-life') },
  { label: 'Landscape', href: '/jaecha/landscape', match: (p) => p.startsWith('/jaecha/landscape') },
  { label: 'Commercial', href: '/jaecha/commercial', match: (p) => p.startsWith('/jaecha/commercial') },
];

const MOBILE_BREAKPOINT_PX = 768;

export function NavBar() {
  const pathname = usePathname() ?? '/jaecha';
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileSubOpen, setMobileSubOpen] = useState(false);
  const dropdownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMenuOpen(false);
    setMobileSubOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  const openDropdown = () => {
    if (dropdownTimer.current) clearTimeout(dropdownTimer.current);
    setDropdownOpen(true);
  };
  const closeDropdown = () => {
    dropdownTimer.current = setTimeout(() => setDropdownOpen(false), 150);
  };

  return (
    <>
      <style>{`
        @media (max-width: ${MOBILE_BREAKPOINT_PX - 1}px) {
          .jae-nav-desktop { display: none !important; }
          .jae-nav-mobile-trigger { display: flex !important; }
          .jae-nav { padding: 0 20px !important; }
        }
        @media (min-width: ${MOBILE_BREAKPOINT_PX}px) {
          .jae-nav-mobile-trigger { display: none !important; }
          .jae-nav-mobile-menu { display: none !important; }
        }
        @keyframes jaeMobileMenuIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <nav
        className="jae-nav"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 40px',
          height: 64,
          background: PALETTE.bone + 'F0',
          backdropFilter: 'blur(12px)',
        }}
      >
        <Link
          href="/jaecha"
          style={{
            fontFamily: 'var(--font-jae-sans), sans-serif',
            fontSize: 17,
            letterSpacing: 3,
            fontWeight: 700,
            color: PALETTE.darkSoft,
            userSelect: 'none',
            textDecoration: 'none',
          }}
        >
          Jae Cha
        </Link>

        <div className="jae-nav-desktop" style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
          {SECTIONS.map((s) => {
            const active = s.match(pathname);
            if (s.label === 'Portraits') {
              return (
                <div
                  key={s.label}
                  style={{ position: 'relative' }}
                  onMouseEnter={openDropdown}
                  onMouseLeave={closeDropdown}
                >
                  <Link
                    href={s.href}
                    style={{
                      fontFamily: 'var(--font-jae-mono), monospace',
                      fontSize: 10,
                      letterSpacing: 0.8,
                      color: active ? PALETTE.dark : PALETTE.gray3,
                      transition: 'color 0.15s',
                      borderBottom: active ? `1px solid ${PALETTE.dark}` : '1px solid transparent',
                      paddingBottom: 2,
                      textDecoration: 'none',
                    }}
                  >
                    {s.label}
                  </Link>
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: -8,
                      marginTop: 8,
                      background: PALETTE.bone,
                      border: `1px solid ${PALETTE.gray2}`,
                      padding: '10px 0',
                      minWidth: 160,
                      opacity: dropdownOpen ? 1 : 0,
                      transform: dropdownOpen ? 'translateY(0)' : 'translateY(-4px)',
                      transition: 'opacity 0.15s, transform 0.15s',
                      pointerEvents: dropdownOpen ? 'auto' : 'none',
                      boxShadow: `0 4px 16px ${PALETTE.dark}08`,
                    }}
                  >
                    {PORTRAIT_SUBS.map((sub) => (
                      <Link
                        key={sub}
                        href={`/jaecha/portraits/${subSlug(sub)}`}
                        style={{
                          display: 'block',
                          padding: '8px 20px',
                          fontFamily: 'var(--font-jae-mono), monospace',
                          fontSize: 10,
                          color: PALETTE.gray4,
                          letterSpacing: 0.6,
                          textDecoration: 'none',
                          transition: 'color 0.1s, background 0.1s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = PALETTE.dark;
                          e.currentTarget.style.background = PALETTE.gray1 + '60';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = PALETTE.gray4;
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        {sub}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            }
            return (
              <Link
                key={s.label}
                href={s.href}
                style={{
                  fontFamily: 'var(--font-jae-mono), monospace',
                  fontSize: 10,
                  letterSpacing: 0.8,
                  color: active ? PALETTE.dark : PALETTE.gray3,
                  transition: 'color 0.15s',
                  borderBottom: active ? `1px solid ${PALETTE.dark}` : '1px solid transparent',
                  paddingBottom: 2,
                  textDecoration: 'none',
                }}
              >
                {s.label}
              </Link>
            );
          })}
          <span style={{ color: PALETTE.gray2 }}>|</span>
          <Link
            href="/jaecha/contact"
            style={{
              fontFamily: 'var(--font-jae-mono), monospace',
              fontSize: 10,
              color: pathname.startsWith('/jaecha/contact') ? PALETTE.dark : PALETTE.gray3,
              letterSpacing: 0.8,
              textDecoration: 'none',
            }}
          >
            Info
          </Link>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            style={{ display: 'flex', alignItems: 'center', color: PALETTE.gray3, transition: 'color 0.15s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = PALETTE.dark)}
            onMouseLeave={(e) => (e.currentTarget.style.color = PALETTE.gray3)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <circle cx="12" cy="12" r="5" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
            </svg>
          </a>
        </div>

        <button
          type="button"
          className="jae-nav-mobile-trigger"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          style={{
            display: 'none',
            cursor: 'pointer',
            padding: 8,
            flexDirection: 'column',
            gap: 4,
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
          }}
        >
          <span style={{ width: 20, height: 1.5, background: PALETTE.dark, transition: 'transform 0.2s', transform: menuOpen ? 'rotate(45deg) translateY(2.75px)' : 'none' }} />
          <span style={{ width: 20, height: 1.5, background: PALETTE.dark, transition: 'opacity 0.2s', opacity: menuOpen ? 0 : 1 }} />
          <span style={{ width: 20, height: 1.5, background: PALETTE.dark, transition: 'transform 0.2s', transform: menuOpen ? 'rotate(-45deg) translateY(-2.75px)' : 'none' }} />
        </button>
      </nav>

      {menuOpen && (
        <div
          className="jae-nav-mobile-menu"
          style={{
            position: 'fixed',
            top: 64,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99,
            background: PALETTE.bone + 'FA',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            flexDirection: 'column',
            padding: '32px 24px',
            animation: 'jaeMobileMenuIn 0.2s ease',
          }}
        >
          {SECTIONS.map((s) => {
            if (s.label === 'Portraits') {
              return (
                <div key={s.label}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '16px 0',
                      borderBottom: `1px solid ${PALETTE.gray2}40`,
                    }}
                  >
                    <Link
                      href={s.href}
                      style={{
                        fontFamily: 'var(--font-jae-mono), monospace',
                        fontSize: 13,
                        letterSpacing: 1.5,
                        color: PALETTE.dark,
                        textDecoration: 'none',
                        flex: 1,
                      }}
                    >
                      {s.label}
                    </Link>
                    <button
                      type="button"
                      onClick={() => setMobileSubOpen((v) => !v)}
                      aria-label="Toggle portrait sub-sections"
                      aria-expanded={mobileSubOpen}
                      style={{
                        fontSize: 18,
                        color: PALETTE.gray3,
                        padding: '0 4px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {mobileSubOpen ? '−' : '+'}
                    </button>
                  </div>
                  {mobileSubOpen && (
                    <div style={{ paddingLeft: 16 }}>
                      {PORTRAIT_SUBS.map((sub) => (
                        <Link
                          key={sub}
                          href={`/jaecha/portraits/${subSlug(sub)}`}
                          style={{
                            display: 'block',
                            fontFamily: 'var(--font-jae-mono), monospace',
                            fontSize: 11,
                            color: PALETTE.gray4,
                            padding: '12px 0',
                            letterSpacing: 0.8,
                            borderBottom: `1px solid ${PALETTE.gray2}25`,
                            textDecoration: 'none',
                          }}
                        >
                          {sub}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <Link
                key={s.label}
                href={s.href}
                style={{
                  fontFamily: 'var(--font-jae-mono), monospace',
                  fontSize: 13,
                  letterSpacing: 1.5,
                  color: PALETTE.dark,
                  padding: '16px 0',
                  borderBottom: `1px solid ${PALETTE.gray2}40`,
                  textDecoration: 'none',
                }}
              >
                {s.label}
              </Link>
            );
          })}
          <Link
            href="/jaecha/contact"
            style={{
              fontFamily: 'var(--font-jae-mono), monospace',
              fontSize: 13,
              letterSpacing: 1.5,
              color: PALETTE.dark,
              padding: '16px 0',
              borderBottom: `1px solid ${PALETTE.gray2}40`,
              textDecoration: 'none',
            }}
          >
            Info
          </Link>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: 'var(--font-jae-mono), monospace',
              fontSize: 13,
              letterSpacing: 1.5,
              color: PALETTE.gray3,
              padding: '16px 0',
              textDecoration: 'none',
            }}
          >
            Instagram ↗
          </a>
        </div>
      )}
    </>
  );
}
