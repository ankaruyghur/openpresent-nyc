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
          title: 'Your Photo | Open Present',
          text: 'View and share your OP photobooth photo',
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

  const handleDownload = async () => {
    try {
      // Try Web Share API
      if (navigator.share && navigator.canShare) {
        const response = await fetch(photoUrl);
        const blob = await response.blob();
        const file = new File([blob], fileName, { type: blob.type });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Your Open Present Photo'
        });
        return; // Success, Exit
        }
      }

      // Fallback - programmatic download
      const response = await fetch(photoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch {
      window.open(photoUrl, '_blank')
    }
  } 

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <button
        onClick={handleDownload}  // TODO: vulnerable cloudfront url
        className="bg-zinc-900 text-white px-8 py-4 rounded-xl font-semibold hover:bg-purple-700 transition-colors text-center shadow-lg"
      >
        Download Photo
      </button>
      
      <button
        onClick={handleShare}
        className="bg-white-900 text-zinc-900 px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-center shadow-lg"
      >
        Share Photo
      </button>
    </div>
  );
}