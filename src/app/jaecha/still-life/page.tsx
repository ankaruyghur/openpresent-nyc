'use client';

import { getProjectPhotos } from '../_components/curation';
import { ScatteredGallery } from '../_components/ScatteredGallery';

export default function StillLifePage() {
  const photos = getProjectPhotos('still-life');
  return <ScatteredGallery title="Still Life" photos={photos} />;
}
