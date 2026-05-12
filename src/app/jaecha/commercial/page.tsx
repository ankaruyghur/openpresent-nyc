'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getProjectHero } from '../_components/curation';
import { PALETTE, PROJECTS } from '../_components/data';
import { JaePhoto } from '../_components/JaePhoto';
import { useIsMobile } from '../_components/useIsMobile';

export default function CommercialPage() {
  const projects = PROJECTS.filter((p) => p.category === 'Commercial');
  const tiles = projects
    .map((project) => ({ project, hero: getProjectHero(project.id) }))
    .filter((x): x is { project: typeof projects[number]; hero: NonNullable<ReturnType<typeof getProjectHero>> } => x.hero !== null)
    .slice(0, 3);

  const isMobile = useIsMobile();
  const pad = isMobile ? 20 : 60;
  const [viewport, setViewport] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const update = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const desktopImgW = viewport ? Math.floor((viewport.w - 120 - 64) / Math.max(tiles.length, 1)) : 400;
  const mobileTileH = viewport ? Math.round(viewport.h * 0.55) : 500;

  return (
    <div style={{ position: 'relative', height: isMobile ? 'auto' : '100vh', overflow: isMobile ? 'visible' : 'hidden' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          height: isMobile ? 'auto' : 'calc(100% - 64px)',
          marginTop: 64,
          alignItems: 'center',
          justifyContent: 'center',
          gap: isMobile ? 20 : 32,
          padding: isMobile ? `20px ${pad}px 40px` : `0 ${pad}px`,
        }}
      >
        {tiles.map(({ project, hero }, i) => (
          <Link
            key={project.id}
            href={`/jaecha/p/${project.id}`}
            className="jae-commercial-tile"
            style={{
              flex: isMobile ? 'none' : `0 0 ${desktopImgW}px`,
              width: isMobile ? '100%' : undefined,
              height: isMobile ? mobileTileH : '85%',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.3s ease',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <JaePhoto
              photo={hero}
              size="medium"
              sizes={isMobile ? '100vw' : '33vw'}
              priority={i === 0}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: isMobile ? '40px 16px 16px' : '60px 24px 24px',
                background: `linear-gradient(to top, ${PALETTE.bone}DD 0%, ${PALETTE.bone}00 100%)`,
                pointerEvents: 'none',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-jae-serif), Georgia, serif',
                  fontSize: 15,
                  color: PALETTE.dark,
                  letterSpacing: 0.3,
                }}
              >
                {project.title}
              </div>
            </div>
            <div
              className="jae-commercial-overlay"
              style={{
                position: 'absolute',
                inset: 0,
                background: `${PALETTE.dark}12`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0,
                transition: 'opacity 0.2s ease',
                pointerEvents: 'none',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-jae-mono), monospace',
                  fontSize: 10,
                  color: PALETTE.dark,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  background: PALETTE.bone,
                  padding: '10px 20px',
                }}
              >
                View Project →
              </span>
            </div>
          </Link>
        ))}
      </div>
      <style>{`
        @media (hover: hover) {
          .jae-commercial-tile:hover { transform: scale(1.01); }
          .jae-commercial-tile:hover .jae-commercial-overlay { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
