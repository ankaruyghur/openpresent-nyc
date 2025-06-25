'use client';

import { useState, useRef } from 'react';

export default function Home() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  // Video switching state
  const videos = ['OP_VHS_compressed.mp4', 'OP_VHS_GREEN_compressed.mp4'];
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const video1Ref = useRef<HTMLVideoElement>(null);
  const video2Ref = useRef<HTMLVideoElement>(null);
  const transitionDuration = 0.5; // in seconds


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple password check - you can modify this
    if (password === 'openpresent' && false) { // Always false
      setIsAuthenticated(true);
    } else {
      setIsShaking(true);
      setPassword('');
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const handleTimeUpdate = (videoIndex: number) => {
    const video = videoIndex == 0 ? video1Ref.current : video2Ref.current;
    if (!video || isTransitioning || activeVideoIndex != videoIndex) return;

    const timeLeft = video.duration - video.currentTime;

    // Start transition n seconds before end
    if (timeLeft <= transitionDuration) {
      startTransition();
    }
  };

  const startTransition = () => {
    setIsTransitioning(true);
    const nextIndex = activeVideoIndex == 0 ? 1 : 0;
    const nextVideo = nextIndex == 0 ? video1Ref.current : video2Ref.current;

    // Start playing the next video
    nextVideo?.play();

    // Switch active video (trigger opacity transition)
    setActiveVideoIndex(nextIndex);

    // After transition, pause the old video and reset state
    setTimeout(() => {
      const oldVideo = activeVideoIndex == 0 ? video1Ref.current : video2Ref.current;
      oldVideo?.pause();
      oldVideo!.currentTime = 0; //Reset to beginning
      setIsTransitioning(false);
    }, transitionDuration * 1000)
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center px-8">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight">
            OpenPresent
          </h1>
          <h2 className="text-xl md:text-2xl text-purple-200 mb-8">
            Creative Digital Experiences • NYC
          </h2>
          <p className="text-lg text-purple-100 max-w-2xl mx-auto mb-12 leading-relaxed">
            A platform for interactive art, custom scripts, and digital creativity. 
            Coming soon: TouchDesigner photobooths, generative art, and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-purple-900 px-8 py-3 rounded-full font-semibold hover:bg-purple-50 transition-colors">
              Get Notified
            </button>
            <button className="border-2 border-purple-300 text-purple-100 px-8 py-3 rounded-full font-semibold hover:bg-purple-800 transition-colors">
              Learn More
            </button>
          </div>
          <div className="mt-16 text-purple-300 text-sm">
            openpresent.nyc
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative">

      <video
        ref={video1Ref}
        src={`https://${process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN_WEB}/videos/${videos[0]}`}
        autoPlay
        muted
        playsInline
        webkit-playsinline="true"
        className="fixed inset-0 w-full h-full object-cover z-0 transition-opacity"
        style={{
          transitionDuration: `${transitionDuration * 1000}ms`,
          opacity: activeVideoIndex === 0 ? 0.2 : 0
        }}
        onTimeUpdate={() => handleTimeUpdate(0)}
      />
      <video
        ref={video2Ref}
        src={`https://${process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN_WEB}/videos/${videos[1]}`}
        muted
        playsInline
        webkit-playsinline="true"
        className="fixed inset-0 w-full h-full object-cover z-0 transition-opacity}"
        style={{
          transitionDuration: `${transitionDuration * 1000}ms`,
          opacity: activeVideoIndex === 1 ? 0.2 : 0
        }}
        onTimeUpdate={() => handleTimeUpdate(1)}
      />

      <div className={`text-center px-8 transition-transform duration-500 ${isShaking ? 'animate-pulse' : ''}`}>
        <div className="mb-12">
          <h1 className="text-6xl md:text-8xl font-black text-white mb-4 tracking-widest" style={{fontFamily: 'Impact, "Arial Black", sans-serif'}}>
            OPEN SOON
          </h1>
          <div className="w-50 h-0.5 bg-white mx-auto mb-12"></div>
          
          {/* Logo under the line */}
          <div className="flex justify-center mb-2">
            <img 
              src="/branding/OP_WHITE.PNG" 
              alt="Open Present Logo" 
              className="h-9 w-auto"
              style={{ 
                filter: 'brightness(0) invert(1)',
                transform: 'scale(3.5)'
              }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 mt-1" suppressHydrationWarning>
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter access code"
              className="w-full max-w-md bg-transparent border-b-2 border-gray-600 text-white text-center py-3 px-4 text-lg tracking-wide focus:outline-none focus:border-white transition-colors placeholder-gray-600"
              suppressHydrationWarning
            />
          </div>
          
          <button
            type="submit"
            className="bg-white text-black px-8 py-3 font-mono font-bold tracking-widest uppercase hover:bg-gray-200 transition-colors"
          >
            Access
          </button>
        </form>

        <div className="mt-16 text-gray-600 text-xs font-mono">
          openpresent.nyc
        </div>
      </div>
    </div>
  );
}
