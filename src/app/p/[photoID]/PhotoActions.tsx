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
          url: window.location.href
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <a
        href={photoUrl}
        download={fileName}
        className="bg-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-purple-700 transition-colors text-center shadow-lg"
      >
        Download Photo
      </a>
      
      <button
        onClick={handleShare}
        className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-center shadow-lg"
      >
        Share Photo
      </button>
    </div>
  );
}