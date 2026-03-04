'use client'

import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import styles from './epk.module.css';
import { Noise } from "@/components/ui/shadcn-io/noise";
import { Magnetic } from '@/components/ui/magnetic';
import { SilkBackground } from '@/components/ui/shadcn-io/silk-background';
import {
    IconBrandInstagram,
    IconBrandSoundcloud,
    IconBrandYoutube,
    IconMail,
    IconExternalLink,
} from '@tabler/icons-react';

const SETS = [
    {
        title: 'Soulful Valentine\'s House Mix',
        duration: '58m',
        tags: ['Soul House', 'Live Set'],
        platform: 'soundcloud' as const,
        url: 'https://soundcloud.com/ikaros_escape/ikaros-escape-soulful',
        primary: true,
    },
    {
        title: 'JUNGLE JUNGLE: Takuya Nakamura',
        duration: '1h 30m',
        tags: ['Jungle'],
        platform: 'youtube' as const,
        url: 'https://www.youtube.com/watch?v=CnCWxJzQ7vs&t=2889s',
    },
    {
        title: 'OPEN WORLD RADIO: ASIA',
        duration: '27m',
        tags: ['Jersey Club', 'Global'],
        platform: 'youtube' as const,
        url: 'https://www.youtube.com/watch?v=xhRbYgaSNd0',
    },
    {
        title: 'OP SOUNDS: Hi-Note Radio',
        duration: '',
        tags: ['Soul House', 'Vinyl', 'Digital'],
        platform: 'youtube' as const,
        url: 'https://youtu.be/nID327THfqo?si=e7zzedXsyrXcBLva',
    },
    {
        title: 'Mixed With Love v1.0',
        duration: '1h 15m',
        tags: ['Soul House', 'Nu Disco'],
        platform: 'soundcloud' as const,
        url: 'https://soundcloud.com/ikaros_escape/mixed-with-love-v10',
    },
];

const SHOWS = [
    {
        name: 'JUNGLE JUNGLE',
        detail: 'Opening for Takuya Nakamura @ Brooklyn, NY',
        url: 'https://www.youtube.com/watch?v=CnCWxJzQ7vs&t=2889s',
    },
    {
        name: 'PINKY PROMISE: A Soulful House Affair',
        detail: 'Pinky Swear, NYC',
        url: 'https://soundcloud.com/ikaros_escape/ikaros-escape-soulful',
    },
    {
        name: 'OPEN WORLD RADIO: ASIA',
        detail: 'AAPI Month Charity Event @ The Red Pavilion',
        url: 'https://www.youtube.com/watch?v=xhRbYgaSNd0',
    },
    {
        name: 'OPENSOUL',
        detail: 'Multiple shows @ The Last Call (Listening Bar)',
    },
    {
        name: 'OP SOUNDS',
        detail: 'Mixed Digital + Vinyl Set @ Hi-Note Radio (Listening Bar)',
        url: 'https://youtu.be/nID327THfqo?si=HG-7mBq3Uo55firL',
    },
];

const CLIPS = [
    // Featured (shown by default)
    {
        context: 'BOLERO DUB',
        src: '/epk/clips/JUNGLEJUNLGE-bolero-jungle-drop-aura-also-hype-ass-drop.mp4',
        poster: '/epk/clips/JUNGLEJUNLGE-bolero-jungle-drop-aura-also-hype-ass-drop-poster.jpg',
        featured: true,
    },
    {
        context: 'BETWEEN THE SHEETS JERSEY CLUB',
        src: '/epk/clips/aapi-crazy-crowd-dance-clap-jersey-music-ENERGY-VIBES-ULTIMATE.mp4',
        poster: '/epk/clips/aapi-crazy-crowd-dance-clap-jersey-music-ENERGY-VIBES-ULTIMATE-poster.jpg',
        featured: true,
    },
    {
        context: 'OP SOUNDS @ HI-NOTE RADIO',
        src: '/epk/clips/hinote-03-slow-vinyl-transition.mp4',
        poster: '/epk/clips/hinote-03-slow-vinyl-transition-poster.jpg',
        featured: true,
    },
    // More clips (revealed on click)
    {
        context: 'JERSEY ENERGY',
        src: '/epk/clips/aapi-jersey-drop-crowd-dances-hype-drop.mp4',
        poster: '/epk/clips/aapi-jersey-drop-crowd-dances-hype-drop-poster.jpg',
    },
    {
        context: 'SYRIAN CLUB',
        src: '/epk/clips/aapi-omar-suleyman-lebanese-club-music-with-people-dancing.mp4',
        poster: '/epk/clips/aapi-omar-suleyman-lebanese-club-music-with-people-dancing-poster.jpg',
    },
    {
        context: 'UYGHUR RAGGAETON',
        src: '/epk/clips/aapi-uyghur-raggeton-crowd-shaking-ass.mp4',
        poster: '/epk/clips/aapi-uyghur-raggeton-crowd-shaking-ass-poster.jpg',
    },
    {
        context: 'TOM N JERRY',
        src: '/epk/clips/JUNGLEJUNGLE-between-the-sheets-jungle-flip-playing-with-hotcue-samples-on-cdj.mp4',
        poster: '/epk/clips/JUNGLEJUNGLE-between-the-sheets-jungle-flip-playing-with-hotcue-samples-on-cdj-poster.jpg',
    },
    {
        context: 'SUPER SHARP SHOOTER',
        src: '/epk/clips/JUNGLEJUNLGE-crazy-jungle-drop-crowd-goes-crazy.mp4',
        poster: '/epk/clips/JUNGLEJUNLGE-crazy-jungle-drop-crowd-goes-crazy-poster.jpg',
    },
    {
        context: 'TEYANA TAYLOR - WTP',
        src: '/epk/clips/hinote-01-digital-transitino-but-nice-track.mp4',
        poster: '/epk/clips/hinote-01-digital-transitino-but-nice-track-poster.jpg',
    },
    {
        context: 'TAKUYA NAKAMURA',
        src: '/epk/clips/JUNGLEJUNGLE-takuya-nakamura-pulls-up-and-i-introduce-him-to-the-crowd-and-crowd-cheers.mp4',
        poster: '/epk/clips/JUNGLEJUNGLE-takuya-nakamura-pulls-up-and-i-introduce-him-to-the-crowd-and-crowd-cheers-poster.jpg',
    },
    {
        context: 'HAPPY BIRTHDAY',
        src: '/epk/clips/JUNGLEJUNGLE-singing-happy-borthday-in-theclub-with-a-cake-crowd-moment.mp4',
        poster: '/epk/clips/JUNGLEJUNGLE-singing-happy-borthday-in-theclub-with-a-cake-crowd-moment-poster.jpg',
    },
];

function HighlightsSection() {
    const [showAll, setShowAll] = useState(false);
    const activeVideoRef = useRef<HTMLVideoElement | null>(null);
    const featured = CLIPS.filter(c => c.featured);
    const rest = CLIPS.filter(c => !c.featured);

    const handleVideoPlay = (e: React.SyntheticEvent<HTMLVideoElement>) => {
        const video = e.currentTarget;
        if (activeVideoRef.current && activeVideoRef.current !== video) {
            activeVideoRef.current.pause();
        }
        activeVideoRef.current = video;
    };

    const handleVideoClick = (e: React.MouseEvent<HTMLVideoElement>) => {
        const video = e.currentTarget;
        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
    };

    return (
        <div className="px-6 md:px-12 py-12 border-t border-white/5">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                <h2 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-6">Highlights</h2>

                {/* Featured clips */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {featured.map((clip, i) => (
                        <motion.div
                            key={clip.src}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.4 }}
                            className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-4"
                        >
                            <video
                                className="w-full aspect-video rounded-lg mb-3 cursor-pointer"
                                poster={clip.poster}
                                preload="none"
                                controls
                                playsInline
                                onPlay={handleVideoPlay}
                                onClick={handleVideoClick}
                            >
                                <source src={clip.src} type="video/mp4" />
                            </video>
                            <p className="text-zinc-400 text-sm">{clip.context}</p>
                        </motion.div>
                    ))}
                </div>

                {/* More clips (expandable) */}
                {rest.length > 0 && (
                    <>
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="mt-6 px-5 py-2.5 text-sm text-zinc-400 hover:text-white border border-white/10 hover:border-white/30 rounded-lg transition-all"
                        >
                            {showAll ? 'Show Less' : `More Clips (${rest.length})`}
                        </button>

                        {showAll && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4"
                            >
                                {rest.map((clip, i) => (
                                    <motion.div
                                        key={clip.src}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.06, duration: 0.4 }}
                                        className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-4"
                                    >
                                        <video
                                            className="w-full aspect-video rounded-lg mb-3 cursor-pointer"
                                            poster={clip.poster}
                                            preload="none"
                                            controls
                                            playsInline
                                            onPlay={handleVideoPlay}
                                            onClick={handleVideoClick}
                                        >
                                            <source src={clip.src} type="video/mp4" />
                                        </video>
                                        <p className="text-zinc-400 text-sm">{clip.context}</p>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </>
                )}
            </motion.div>
        </div>
    );
}

const PRESS = [
    { text: 'New York Times, Dec 2022', url: 'https://www.nytimes.com/2022/12/05/nyregion/new-york-china-protests.html', igUrl: 'https://www.instagram.com/p/ClzLy41OAz_?img_index=2' },
    { text: 'Human Rights Foundation' },
];

export default function IkarosEscapeEPK() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1023);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div
            className={`min-h-screen ${styles['epk-bg']} relative`}
            style={{ fontFamily: 'var(--font-geist-sans)' }}
        >
            {/* Film grain overlay */}
            <div className="fixed inset-0 pointer-events-none z-50 mix-blend-overlay">
                <Noise
                    patternSize={isMobile ? 150 : 200}
                    patternScaleX={isMobile ? 1 : 2}
                    patternScaleY={isMobile ? 1 : 2}
                    patternRefreshInterval={1}
                    patternAlpha={25}
                />
            </div>

            {/* Silk background */}
            <SilkBackground
                className="fixed inset-0 -z-10"
                speed={2}
                scale={0.7}
                color="#d4754c"
                noiseIntensity={3}
                rotation={0.2}
            />

            {/* ============ PAGE 1: ABOVE THE FOLD ============ */}
            <div className="min-h-screen flex flex-col">

                {/* Top bar: collective logo */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="px-6 md:px-12 pt-6 flex justify-between items-center"
                >
                    <span className="text-zinc-500 text-xs tracking-widest uppercase">Open Present</span>
                    <span className="text-zinc-500 text-xs tracking-widest uppercase">Brooklyn, NYC</span>
                </motion.div>

                {/* Main content: photo left, info right */}
                <div className="flex-1 flex flex-col lg:flex-row px-6 md:px-12 py-6 gap-6 lg:gap-12">

                    {/* LEFT: Photo with name overlay */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="lg:w-1/2 relative rounded-xl overflow-hidden min-h-[60vh] lg:min-h-0"
                    >
                        <img
                            src="/epk/dj-02.jpg"
                            alt="Ikaros Escape DJing"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        {/* Name overlay top-right of photo */}
                        <div className="absolute top-4 right-4 md:top-6 md:right-6 text-right z-10">
                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.85] tracking-tight"
                                style={{
                                    textShadow: '0 2px 20px rgba(0,0,0,0.9), 0 0 60px rgba(0,0,0,0.7), 0 0 40px rgba(255,255,255,0.4)',
                                }}
                            >
                                IKA<br/>
                                ROS<br/>
                                <span className="text-zinc-300">ESC<br/>APE</span>
                            </h1>
                        </div>
                        {/* Subtle gradient at bottom for readability */}
                        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
                        {/* OP Logo bottom-left */}
                        <img
                            src="/branding/OP_WHITE.PNG"
                            alt="Open Present"
                            className="absolute bottom-4 left-4 md:bottom-6 md:left-6 h-16 md:h-20 w-auto z-10 opacity-80"
                            style={{ filter: 'brightness(0) invert(1)' }}
                        />
                    </motion.div>

                    {/* RIGHT: Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="lg:w-1/2 flex flex-col justify-between"
                    >
                        {/* Bio + Genre */}
                        <div>
                            <p className="text-zinc-300 text-base md:text-lg leading-relaxed mb-6 max-w-md">
                                Uyghur artist based in Brooklyn. As someone from a diaspora with a culture actively being erased, music became the way in. 90s soulful house for its message of freedom and love. Jungle for the way it tears apart tradition and rebuilds it into something new.
                            </p>
                            <p className="text-zinc-300 text-base md:text-lg leading-relaxed mb-6 max-w-md -mt-4">
                                DJ, producer, and founder of Open Present.
                            </p>

                            <div className="mb-6">
                                <p className="text-zinc-500 text-xs tracking-widest uppercase mb-3">Style</p>
                                <p className="text-zinc-200 text-sm">
                                    Soulful House / Jungle / Breaks / Jersey Club / Global
                                </p>
                            </div>

                            {/* Past Shows */}
                            <div className="mb-6">
                                <p className="text-zinc-500 text-xs tracking-widest uppercase mb-3">Past Shows</p>
                                <div className="space-y-2">
                                    {SHOWS.map((show) => (
                                        show.url ? (
                                            <a
                                                key={show.name}
                                                href={show.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block group"
                                            >
                                                <p className="text-zinc-200 text-sm font-medium group-hover:text-white transition-colors flex items-center gap-1.5">
                                                    {show.name}
                                                    <IconExternalLink className="w-3 h-3 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </p>
                                                <p className="text-zinc-500 text-xs">{show.detail}</p>
                                            </a>
                                        ) : (
                                            <div key={show.name}>
                                                <p className="text-zinc-200 text-sm font-medium">{show.name}</p>
                                                <p className="text-zinc-500 text-xs">{show.detail}</p>
                                            </div>
                                        )
                                    ))}
                                </div>
                            </div>

                            {/* Press */}
                            <div className="mb-6">
                                <p className="text-zinc-500 text-xs tracking-widest uppercase mb-3">Press</p>
                                <div className="space-y-1">
                                    {PRESS.map((item) => (
                                        item.url ? (
                                            <div key={item.text} className="flex items-center gap-2">
                                                <a
                                                    href={item.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-zinc-300 text-sm hover:text-white transition-colors flex items-center gap-1.5 group"
                                                >
                                                    {item.text}
                                                    <IconExternalLink className="w-3 h-3 text-zinc-500" />
                                                </a>
                                                {item.igUrl && (
                                                    <a
                                                        href={item.igUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-zinc-500 hover:text-white transition-colors"
                                                        title="View on Instagram"
                                                    >
                                                        <IconBrandInstagram className="w-3.5 h-3.5" />
                                                    </a>
                                                )}
                                            </div>
                                        ) : (
                                            <p key={item.text} className="text-zinc-300 text-sm">{item.text}</p>
                                        )
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Contact bar at bottom */}
                        <div className="border-t border-white/10 pt-4 mt-4">
                            <div className="flex flex-wrap gap-4 items-center">
                                <Magnetic strength={0.03} range={200}>
                                    <a
                                        href="mailto:ankar.uyghur@openpresent.nyc"
                                        className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors text-sm bg-white/5 px-4 py-2 rounded-lg border border-white/10 hover:border-white/30"
                                    >
                                        <IconMail className="w-4 h-4" />
                                        <span>Email</span>
                                    </a>
                                </Magnetic>
                                <Magnetic strength={0.03} range={200}>
                                    <a
                                        href="https://instagram.com/ikaros_uyghur"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors text-sm bg-white/5 px-4 py-2 rounded-lg border border-white/10 hover:border-white/30"
                                    >
                                        <IconBrandInstagram className="w-4 h-4" />
                                        <span>@ikaros_uyghur</span>
                                    </a>
                                </Magnetic>
                                <Magnetic strength={0.03} range={200}>
                                    <a
                                        href="https://soundcloud.com/ikaros_escape"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors text-sm bg-white/5 px-4 py-2 rounded-lg border border-white/10 hover:border-white/30"
                                    >
                                        <IconBrandSoundcloud className="w-4 h-4" />
                                        <span>SoundCloud</span>
                                    </a>
                                </Magnetic>
                                <Magnetic strength={0.03} range={200}>
                                    <a
                                        href="https://www.youtube.com/@IkarosEscape"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors text-sm bg-white/5 px-4 py-2 rounded-lg border border-white/10 hover:border-white/30"
                                    >
                                        <IconBrandYoutube className="w-4 h-4" />
                                        <span>YouTube</span>
                                    </a>
                                </Magnetic>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* ============ HIGHLIGHTS (CLIPS) ============ */}
            <HighlightsSection />

            {/* ============ PAGE 2: SETS ============ */}
            <div className="px-6 md:px-12 py-12 border-t border-white/5">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-6">Sets</h2>

                    {/* Two featured embeds side by side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* Valentine's Mix */}
                        <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                            <h3 className="text-base font-semibold text-white mb-1">
                                Soulful Valentine&apos;s House Mix + Live Flute
                            </h3>
                            <p className="text-zinc-500 text-xs mb-3">
                                Pinky Swear &middot; 58 min &middot; Feb 2026
                            </p>
                            <div className="flex gap-1.5 mb-3">
                                {['Soul House', 'Live Set'].map((tag) => (
                                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800/80 text-zinc-400 border border-zinc-700/50">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <iframe
                                width="100%"
                                height="120"
                                scrolling="no"
                                frameBorder="no"
                                allow="autoplay"
                                src="https://w.soundcloud.com/player/?url=https%3A%2F%2Fapi.soundcloud.com%2Ftracks%2F2274610685&color=%23d4754c&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false"
                                className="rounded-lg"
                                title="Soulful Valentine's House Mix"
                            />
                        </div>

                        {/* DEEPDOWNDISCO */}
                        <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                            <h3 className="text-base font-semibold text-white mb-1">
                                DEEPDOWNDISCO B2B w/ Psiionik
                            </h3>
                            <p className="text-zinc-500 text-xs mb-3">
                                Open Present &middot; 2h 33m &middot; Sep 2024
                            </p>
                            <div className="flex gap-1.5 mb-3">
                                {['Deep House', 'Disco'].map((tag) => (
                                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800/80 text-zinc-400 border border-zinc-700/50">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <iframe
                                width="100%"
                                height="120"
                                scrolling="no"
                                frameBorder="no"
                                allow="autoplay"
                                src="https://w.soundcloud.com/player/?url=https%3A%2F%2Fapi.soundcloud.com%2Ftracks%2F1910291486&color=%23d4754c&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false"
                                className="rounded-lg"
                                title="DEEPDOWNDISCO B2B w/ Psiionik"
                            />
                        </div>
                    </div>

                    {/* Other sets as compact list */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {SETS.filter(s => !s.primary).map((set) => (
                            <a
                                key={set.title}
                                href={set.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-3 hover:border-white/30 transition-all group"
                            >
                                <div className="flex items-center justify-between mb-1.5">
                                    <h4 className="text-sm font-medium text-white truncate pr-2">{set.title}</h4>
                                    <div className="flex items-center gap-1.5 text-zinc-500 shrink-0">
                                        {set.platform === 'soundcloud' ? (
                                            <IconBrandSoundcloud className="w-3.5 h-3.5" />
                                        ) : (
                                            <IconBrandYoutube className="w-3.5 h-3.5" />
                                        )}
                                        <IconExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                                <p className="text-zinc-500 text-xs">{set.duration}</p>
                                <div className="flex gap-1.5 mt-2">
                                    {set.tags.map((tag) => (
                                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800/60 text-zinc-500 border border-zinc-700/30">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </a>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* ============ PHOTO MASONRY ============ */}
            <div className="px-6 md:px-12 py-12 border-t border-white/5">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="columns-2 md:columns-3 lg:columns-4 gap-3 max-w-6xl mx-auto"
                >
                    {[
                        { src: '/epk/opensoul.jpg', tall: true },
                        { src: '/epk/hands.jpg', tall: false },
                        { src: '/epk/hero.jpg', tall: false },
                        { src: '/epk/crowd-01.jpg', tall: false },
                        { src: '/epk/film-01.jpg', tall: false },
                        { src: '/epk/dj-01.jpg', tall: false },
                        { src: '/epk/dj-03.jpg', tall: true },
                    ].map((photo, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.08, duration: 0.4 }}
                            className="mb-3 break-inside-avoid overflow-hidden rounded-lg group"
                        >
                            <img
                                src={photo.src}
                                alt=""
                                className={`w-full object-cover group-hover:scale-105 transition-transform duration-500 ${photo.tall ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}
                                loading="lazy"
                            />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
