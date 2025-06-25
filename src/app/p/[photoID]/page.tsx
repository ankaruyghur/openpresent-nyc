import { decodePhotoId } from '@/lib/photo-id';
import PhotoActions from './PhotoActions';
import Link from 'next/link';

export default async function PhotoPage({ params }: { params: Promise<{ photoID: string }> }) {
  const { photoID } = await params;

  let photoData;
  try {
    photoData = decodePhotoId(photoID);
  } catch {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-gray-50 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Photo Not Found</h1>
          <p className="text-gray-600 mb-6">This photo link appears to be invalid or has expired.</p>
          <Link
            href="/"
            className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const bucketName = process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME;
  if (!bucketName) {
    return <div>Configuration error</div>;
  }

  const sanitizedBrand = photoData.brand.replace(/[^\w-]/g, '_');
  const sanitizedSession = photoData.session.replace(/[^\w-]/g, '_');
  const cloudfrontDomain = process.env.CLOUDFRONT_DOMAIN_PHOTOBOOTH!;
  const photoUrl = `https://${cloudfrontDomain}/${sanitizedBrand}/${sanitizedSession}/${photoData.timestampDir}/${photoData.filename}.jpg`;

  // Format timestamp for display
  const timestamp = photoData.filename;
  const date = `${timestamp.slice(0,4)}-${timestamp.slice(4,6)}-${timestamp.slice(6,8)}`;
  const time = `${timestamp.slice(8,10)}:${timestamp.slice(10,12)}:${timestamp.slice(12,14)}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900  via-slate-900 to-slate-90">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <Link href="/" className="block">
          <div className="max-w-4xl mx-auto px-6 py-2 flex justify-between items-center cursor-pointer hover:bg-white/5 transition-colors">
            <div>
              <h1 className="text-2xl font-bold text-white">Open Present</h1>
              <p className="text-gray-100 mt-1">We&apos;re Your Biggest OPs</p>
            </div>
            <img 
              src="/branding/OP_WHITE.PNG" 
              alt="Open Present Logo" 
              className="h-20 w-auto object-cover object-center"
              style={{ 
                filter: 'brightness(0) invert(1)',
                transform: 'scale(1.3)'
              }}
            />
          </div>
        </Link>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-gray-100 rounded-3xl shadow-2xl overflow-hidden">
          {/* Photo Section */}
          <div className="bg-gray-100 p-8">
            <img
              src={photoUrl}
              alt={`Photo from ${photoData.session}`}
              className="w-full h-auto rounded-2xl shadow-lg max-h-[70vh] object-contain mx-auto"
            />
          </div>

          {/* Info Section */}
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {photoData.session.replace(/_/g, ' ')}
              </h2>
              <p className="text-gray-600">
                Captured on {date} at {time}
              </p>
            </div>

            {/* Action Buttons */}
            <PhotoActions 
              photoUrl={photoUrl} 
              fileName={`${photoData.session}-${date}.jpg`}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-100 text-sm">
            Powered by Open Present • Creative Digital Experiences
          </p>
        </div>
      </main>
    </div>
  );
}