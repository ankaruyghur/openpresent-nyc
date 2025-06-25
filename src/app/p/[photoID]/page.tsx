import { decodePhotoId } from '@/lib/photo-id';
import PhotoActions from './PhotoActions';

export default async function PhotoPage({ params }: { params: Promise<{ photoID: string }> }) {
  const { photoID } = await params;

  let photoData;
  try {
    photoData = decodePhotoId(photoID);
  } catch (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Photo Not Found</h1>
          <p className="text-gray-600 mb-6">This photo link appears to be invalid or has expired.</p>
          <a
            href="/"
            className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Return Home
          </a>
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-white">OpenPresent NYC</h1>
          <p className="text-purple-200 mt-1">Your Photo Experience</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Photo Section */}
          <div className="bg-gray-50 p-8">
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
          <p className="text-purple-200 text-sm">
            Powered by OpenPresent • Creative Digital Experiences
          </p>
        </div>
      </main>
    </div>
  );
}