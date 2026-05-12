export const PALETTE = {
  bone: '#F5F0EB',
  boneLight: '#FAF7F3',
  boneDark: '#EDE7E0',
  gray1: '#E8E3DE',
  gray2: '#D4CFC9',
  gray3: '#8A847D',
  gray4: '#7A746D',
  dark: '#2C2824',
  darkSoft: '#3D3832',
  accent: '#8B7355',
} as const;

export type Category = 'Portraits' | 'Still Life' | 'Landscape' | 'Commercial' | 'Info';
export type PortraitSub = 'Environmental' | 'Events' | 'Behind the Scenes';

/**
 * The ID of the project containing the bio / self-portrait used on
 * /jaecha/contact. Not a portfolio project — filter it out of any iteration
 * that's meant to reach actual work.
 */
export const INFO_PROJECT_ID = 'info';

export type Project = {
  id: string;
  title: string;
  category: Category;
  sub: PortraitSub | null;
  year: string;
  accent: string;
  /**
   * Path (relative to the source root passed to the upload script) where the
   * original photos for this project live. Only consumed by
   * scripts/process-jaecha-photos.ts.
   */
  sourceFolder: string;
};

/**
 * Projects, mirroring Jae's "Portfolio 2026" folder structure.
 *
 * Flat categories (Environmental, Still Life, Landscape) collapse into one
 * project apiece — the source folders contain individual photos, not
 * sub-projects.
 *
 * Project IDs are stable S3 keys. Don't rename without renaming in S3 too.
 */
export const PROJECTS: Project[] = [
  // Portraits — Environmental (one flat collection)
  {
    id: 'env',
    title: 'Environmental',
    category: 'Portraits',
    sub: 'Environmental',
    year: '2024',
    accent: '#6B7B6E',
    sourceFolder: 'Portrait/Environmental',
  },

  // Portraits — Events
  {
    id: 'evt-jungle-jungle-2024',
    title: 'Jungle Jungle 2024',
    category: 'Portraits',
    sub: 'Events',
    year: '2024',
    accent: '#5E6B7B',
    sourceFolder: 'Portrait/Events/Jungle Jungle 2024',
  },
  {
    id: 'evt-open-soul-vol-iii-2025',
    title: 'Open Soul Vol. III 2025',
    category: 'Portraits',
    sub: 'Events',
    year: '2025',
    accent: '#7B6E5E',
    sourceFolder: 'Portrait/Events/Open Soul Vol III 2025',
  },
  {
    id: 'evt-pinky-promise-2026',
    title: 'Pinky Promise 2026',
    category: 'Portraits',
    sub: 'Events',
    year: '2026',
    accent: '#6B5E7B',
    sourceFolder: 'Portrait/Events/Pinky Promise 2026',
  },

  // Portraits — Behind the Scenes
  {
    id: 'bts-a-preserving-sweet-2023',
    title: 'A Preserving Sweet 2023',
    category: 'Portraits',
    sub: 'Behind the Scenes',
    year: '2023',
    accent: '#6E5E7B',
    sourceFolder: 'Portrait/Behind the Scene/A Preserving Sweet 2023',
  },
  {
    id: 'bts-america-fever-lancaster',
    title: 'America Fever — Lancaster',
    category: 'Portraits',
    sub: 'Behind the Scenes',
    year: '2024',
    accent: '#5E7B6E',
    sourceFolder: 'Portrait/Behind the Scene/America Fever - Lancaster',
  },
  {
    id: 'bts-america-fever-malibu',
    title: 'America Fever — Malibu',
    category: 'Portraits',
    sub: 'Behind the Scenes',
    year: '2024',
    accent: '#7B7B6E',
    sourceFolder: 'Portrait/Behind the Scene/America Fever - Malibu',
  },
  {
    id: 'bts-america-fever-salton-sea',
    title: 'America Fever — Salton Sea',
    category: 'Portraits',
    sub: 'Behind the Scenes',
    year: '2024',
    accent: '#6E7B5E',
    sourceFolder: 'Portrait/Behind the Scene/America Fever - Salton Sea',
  },
  {
    id: 'bts-america-fever-tujunga-dam',
    title: 'America Fever — Tujunga Dam',
    category: 'Portraits',
    sub: 'Behind the Scenes',
    year: '2024',
    accent: '#5E6B6E',
    sourceFolder: 'Portrait/Behind the Scene/America Fever - Tujunga Dam',
  },
  {
    id: 'bts-kelsey-kuan-roller-coaster-mv',
    title: 'Kelsey Kuan — Roller Coaster MV',
    category: 'Portraits',
    sub: 'Behind the Scenes',
    year: '2024',
    accent: '#6B6E7B',
    sourceFolder: 'Portrait/Behind the Scene/Kelsey Kuan - Roller Coaster MV',
  },

  // Still Life (flat)
  {
    id: 'still-life',
    title: 'Still Life',
    category: 'Still Life',
    sub: null,
    year: '2024',
    accent: '#7B7B5E',
    sourceFolder: 'Still Life',
  },

  // Landscape (flat)
  {
    id: 'landscape',
    title: 'Landscape',
    category: 'Landscape',
    sub: null,
    year: '2024',
    accent: '#5E6E7B',
    sourceFolder: 'Landscape',
  },

  // Commercial
  {
    id: 'cm-by-way-of-2021-lily',
    title: 'By Way Of 2021 — Lily',
    category: 'Commercial',
    sub: null,
    year: '2021',
    accent: '#7B6B5E',
    sourceFolder: 'Commercial/By Way Of 2021 Lily',
  },
  {
    id: 'cm-by-way-of-2024-hypnotic-glasses',
    title: 'By Way Of 2024 — Hypnotic Glasses',
    category: 'Commercial',
    sub: null,
    year: '2024',
    accent: '#6B6E5E',
    sourceFolder: 'Commercial/By Way of 2024 Hypnotic Glasses',
  },

  // Bio / self-portrait used on the contact page. Excluded from portfolio
  // iteration via `PORTFOLIO_PROJECTS` and category === 'Info' filters.
  {
    id: INFO_PROJECT_ID,
    title: 'Self Portrait',
    category: 'Info',
    sub: null,
    year: '2026',
    accent: '#7B6E6B',
    sourceFolder: 'Info Self Portrait',
  },
];

/**
 * Use this whenever you need "the actual photography projects" — it filters
 * out the Info / bio entry. The home grid, portrait rows, gallery pages, and
 * project-detail prev/next nav all use this. Raw `PROJECTS` is reserved for
 * the upload script and anywhere the bio photo needs to be discoverable.
 */
export const PORTFOLIO_PROJECTS: Project[] = PROJECTS.filter((p) => p.category !== 'Info');

export const PORTRAIT_SUBS: PortraitSub[] = ['Environmental', 'Events', 'Behind the Scenes'];

export const INSTAGRAM_URL = 'https://www.instagram.com/jaebin_cha/';

export function subSlug(sub: PortraitSub): string {
  return sub.toLowerCase().replace(/\s+/g, '-');
}

export function subFromSlug(slug: string): PortraitSub | null {
  const match = PORTRAIT_SUBS.find((s) => subSlug(s) === slug);
  return match ?? null;
}
