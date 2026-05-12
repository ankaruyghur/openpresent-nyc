'use client';

import { getProjectHero, getProjectPhotos } from '../_components/curation';
import { PORTRAIT_SUBS, PROJECTS, subSlug } from '../_components/data';
import { PortraitRow, type RowItem } from '../_components/PortraitRow';

export default function PortraitsIndex() {
  return (
    <div style={{ background: '#F5F0EB', paddingTop: 64 }}>
      {PORTRAIT_SUBS.map((sub) => {
        const subProjects = PROJECTS.filter((p) => p.sub === sub);
        if (subProjects.length === 0) return null;

        let items: RowItem[] = [];

        if (sub === 'Environmental') {
          // Single flat project — show first 3 photos as zoom-only tiles.
          const envProject = subProjects[0];
          items = getProjectPhotos(envProject.id)
            .slice(0, 3)
            .map((photo) => ({ kind: 'zoom', photo }));
        } else {
          // Multiple projects — one hero photo per project, link to its detail page.
          const built: RowItem[] = [];
          for (const project of subProjects) {
            const hero = getProjectHero(project.id);
            if (!hero) continue;
            built.push({
              kind: 'link',
              photo: hero,
              href: `/jaecha/p/${project.id}`,
              caption: project.title,
            });
          }
          items = built.slice(0, 3);
        }

        return (
          <PortraitRow
            key={sub}
            label={sub}
            items={items}
            viewAllHref={`/jaecha/portraits/${subSlug(sub)}`}
          />
        );
      })}
    </div>
  );
}
