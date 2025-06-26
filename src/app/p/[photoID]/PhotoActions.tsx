'use client';

interface PhotoActionsProps {
  photoUrl: string;
  fileName: string;
}

export default function PhotoActions({ photoUrl, fileName }: PhotoActionsProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out my photo!',
          text: 'Check out this awesome photo!',
          url: window.location.href
        });
      } catch {
        // User cancelled share
      }
    } else {
      // Fallback for development/HTTP environments
      alert(`Share this link: ${window.location.href}`);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <a
        href={photoUrl}  // TODO: vulnerable cloudfront url
        download={fileName}
        className="bg-zinc-900 text-white px-8 py-4 rounded-xl font-semibold hover:bg-purple-700 transition-colors text-center shadow-lg"
      >
        Download Photo
      </a>
      
      <button
        onClick={handleShare}
        className="bg-white-900 text-zinc-900 px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-center shadow-lg"
      >
        Share Photo
      </button>
    </div>
  );
}