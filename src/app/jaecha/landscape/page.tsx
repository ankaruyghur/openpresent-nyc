'use client';

import { getProjectPhotos } from '../_components/curation';
import { ScatteredGallery } from '../_components/ScatteredGallery';

export default function LandscapePage() {
  const photos = getProjectPhotos('landscape');
  return <ScatteredGallery title="Landscape" photos={photos} featuredIndex={0} />;
}
