'use client'

import { useState, useEffect, useRef } from 'react';
import styles from './portfolio.module.css';
import { Noise } from "@/components/ui/shadcn-io/noise";
import { Magnetic } from '@/components/ui/magnetic';
import { SilkBackground } from '@/components/ui/shadcn-io/silk-background';
import { Carousel, Card } from '@/components/ui/shadcn-io/apple-cards-carousel';
import { IconBrandInstagram } from '@tabler/icons-react';


export default function Portfolio() {

    const [isMobile, setIsMobile] = useState(false);
    const [project1Expanded, setProject1Expanded] = useState(false);
    const [project2Expanded, setProject2Expanded] = useState(false);
    const [_project3Expanded, _setProject3Expanded] = useState(false);
    const [project1CardOpen, setProject1CardOpen] = useState(false);
    const [project2CardOpen, setProject2CardOpen] = useState(false);
    const [_project3CardOpen, _setProject3CardOpen] = useState(false);
    const project1Ref = useRef<HTMLDivElement>(null);
    const project2Ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (project1CardOpen && project1Ref.current) {
            project1Ref.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
     }, [project1CardOpen]);

    useEffect(() => {
        if (project2CardOpen && project2Ref.current) {
            project2Ref.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
     }, [project2CardOpen]);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1023);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const project1Cards = [
      <Card
          key="tabi-1"
          card={{
              src: "/portfolio/projects/tabis/Tabi-Complete-Angle01.jpg",
              title: "Front View",
              category: "[01]",
              content: (
                  <div className='h-[50vh]'>
                      <p className="text-neutral-400 text-base md:text-lg font-sans max-w-3xl mx-auto mb-2">
                            Finished piece, on-foot styling.
                      </p>
                      <img
                          src="/portfolio/projects/tabis/Tabi-Complete-Angle01.jpg"
                          alt="Finished piece, on-foot styling."
                          className="w-full h-full object-scale-down rounded-lg mt-4 pb-4"
                          loading="lazy"
                      />
                  </div>
              )
          }}
          index={0}
          onOpenChange={setProject1CardOpen}
      />,
      <Card
          key="tabi-2"
          card={{
              src: "/portfolio/projects/tabis/Tabi-movements-thumb.jpg",
              title: "In Movement",
              category: "[02]",
              content: (
                  <div className='h-[50vh]'>
                    <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-lg font-sans max-w-3xl mx-auto">
                        Tabi boot in movement.
                    </p>
                    <video
                        src="/portfolio/projects/tabis/Tabi-movements.mp4"
                        autoPlay 
                        muted 
                        loop
                        playsInline
                          className="w-full h-full object-scale-down rounded-lg mt-4 pb-4"
                    >
                    Your browser does not support the video tag.
                    </video>
                  </div>
              )
          }}
          index={1}
          onOpenChange={setProject1CardOpen}
      />,
      <Card
          key="tabi-3"
          card={{
              src: "/portfolio/projects/tabis/Tabi-Materials.jpg",
              title: "Materials Used",
              category: "[03]",
              content: (
                  <div className='h-[50vh]'>
                      <p className="text-neutral-400 text-base md:text-lg font-sans max-w-3xl mx-auto mb-2">
                            Traditional Uzbek leather sock. Repurposed Yeezy Pod sole.
                      </p>
                      <img
                          src="/portfolio/projects/tabis/Tabi-Materials.jpg"
                          alt="Traditional Uzbek leather sock. Repurposed Yeezy Pod sole."
                          className="w-full h-full object-scale-down rounded-lg mt-4 pb-4"
                          loading="lazy"
                      />
                  </div>
              )
          }}
          index={2}
          onOpenChange={setProject1CardOpen}
      />,
      <Card
          key="tabi-4"
          card={{
              src: "/portfolio/projects/tabis/Tabi-Complete-Angle03.jpg",
              title: "Post Leather Conditioning",
              category: "[04]",
              content: (
                  <div className='h-[50vh]'>
                      <p className="text-neutral-400 text-base md:text-lg font-sans max-w-3xl mx-auto mb-2">
                            Conditioned with Saphir Mink Oil.
                      </p>
                      <img
                          src="/portfolio/projects/tabis/Tabi-Complete-Angle03.jpg"
                          alt="Conditioned with Saphir Mink Oil."
                          className="w-full h-full object-scale-down rounded-lg mt-4 pb-4"
                          loading="lazy"
                      />
                  </div>
              )
          }}
          index={3}
          onOpenChange={setProject1CardOpen}
      />,
  ];

  const project2Cards = [
      <Card
          key="blet-1"
          card={{
              src: "/portfolio/projects/misc/CobraBelt.jpg",
              title: "Cobra Buckle Nylon Belt",
              category: "[01]",
              content: (
                  <div className='h-[50vh]'>
                      <p className="text-neutral-400 text-base md:text-lg font-sans max-w-3xl mx-auto mb-2">
                            Made from olive 1&quot; nylon, cobra buckle sourced from AustriAlpin with adjustable D-rings.
                      </p>
                      <img
                          src="/portfolio/projects/misc/CobraBelt.jpg"
                          alt="Cobra Buckle Nylon Belt"
                          className="w-full h-full object-scale-down rounded-lg mt-4 pb-4"
                          loading="lazy"
                      />
                  </div>
              )
          }}
          index={0}
          onOpenChange={setProject2CardOpen}
      />,
      <Card
          key="misc-7"
          card={{
              src: "/portfolio/projects/misc/sketches_Page_7.jpg",
              title: "Sketches",
              category: "[01]",
              content: (
                  <div className='h-[50vh]'>
                      <p className="text-neutral-400 text-base md:text-lg font-sans max-w-3xl mx-auto mb-2">
                            Sketch[01]: Uniform
                      </p>
                      <img
                          src="/portfolio/projects/misc/sketches_Page_7.jpg"
                          alt="Sketch[01]: Uniform"
                          className="w-full h-full object-scale-down rounded-lg mt-4 pb-4"
                          loading="lazy"
                      />
                  </div>
              )
          }}
          index={1}
          onOpenChange={setProject2CardOpen}
      />,
      <Card
          key="misc-8"
          card={{
              src: "/portfolio/projects/misc/sketches_Page_9.jpg",
              title: "Sketches",
              category: "[02]",
              content: (
                  <div className='h-[50vh]'>
                      <p className="text-neutral-400 text-base md:text-lg font-sans max-w-3xl mx-auto mb-2">
                            Sketch[02]: Dolman Sleeve
                      </p>
                      <img
                          src="/portfolio/projects/misc/sketches_Page_9.jpg"
                          alt="Sketch[02]: Dolman Sleeve"
                          className="w-full h-full object-scale-down rounded-lg mt-4 pb-4"
                          loading="lazy"
                      />
                  </div>
              )
          }}
          index={2}
          onOpenChange={setProject2CardOpen}
      />,
      <Card
          key="misc-2"
          card={{
              src: "/portfolio/projects/misc/sketches_Page_2.jpg",
              title: "Sketches",
              category: "[03]",
              content: (
                  <div className='h-[50vh]'>
                    <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-lg font-sans max-w-3xl mx-auto">
                        Sketch[03]: Untitled
                    </p>
                    <img
                          src="/portfolio/projects/misc/sketches_Page_2.jpg"
                          alt="Sketch[03]: Untitled"
                          className="w-full h-full object-scale-down rounded-lg mt-4 pb-4"
                          loading="lazy"
                      />
                  </div>
              )
          }}
          index={3}
          onOpenChange={setProject2CardOpen}
      />,
      <Card
          key="misc-1"
          card={{
              src: "/portfolio/projects/misc/sketches_Page_1.jpg",
              title: "Sketches",
              category: "[04]",
              content: (
                  <div className='h-[50vh]'>
                      <p className="text-neutral-400 text-base md:text-lg font-sans max-w-3xl mx-auto mb-2">
                            Sketch[04]: Pleat Exploration
                      </p>
                      <img
                          src="/portfolio/projects/misc/sketches_Page_1.jpg"
                          alt="Sketch[04]: Pleat Exploration"
                          className="w-full h-full object-scale-down rounded-lg mt-4 pb-4"
                          loading="lazy"
                      />
                  </div>
              )
          }}
          index={4}
          onOpenChange={setProject2CardOpen}
      />,
      <Card
          key="misc-3"
          card={{
              src: "/portfolio/projects/misc/sketches_Page_3.jpg",
              title: "Sketches",
              category: "[05]",
              content: (
                  <div className='h-[50vh]'>
                      <p className="text-neutral-400 text-base md:text-lg font-sans max-w-3xl mx-auto mb-2">
                            Sketch[05]: Pleat Exploration Cont.
                      </p>
                      <img
                          src="/portfolio/projects/misc/sketches_Page_3.jpg"
                          alt="Sketch[05]: Pleat Exploration Cont."
                          className="w-full h-full object-scale-down rounded-lg mt-4 pb-4"
                          loading="lazy"
                      />
                  </div>
              )
          }}
          index={5}
          onOpenChange={setProject2CardOpen}
      />,
      <Card
          key="misc-4"
          card={{
              src: "/portfolio/projects/misc/sketches_Page_4.jpg",
              title: "Sketches",
              category: "[06]",
              content: (
                  <div className='h-[50vh]'>
                      <p className="text-neutral-400 text-base md:text-lg font-sans max-w-3xl mx-auto mb-2">
                            Sketch[06]: Measurements
                      </p>
                      <img
                          src="/portfolio/projects/misc/sketches_Page_4.jpg"
                          alt="Sketch[06]: Measurements"
                          className="w-full h-full object-scale-down rounded-lg mt-4 pb-4"
                          loading="lazy"
                      />
                  </div>
              )
          }}
          index={6}
          onOpenChange={setProject2CardOpen}
      />,
      <Card
          key="misc-5"
          card={{
              src: "/portfolio/projects/misc/sketches_Page_5.jpg",
              title: "Sketches",
              category: "[07]",
              content: (
                  <div className='h-[50vh]'>
                    <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-lg font-sans max-w-3xl mx-auto">
                        Sketch[07]: Color
                    </p>
                    <img
                        src="/portfolio/projects/misc/sketches_Page_5.jpg"
                        alt="Sketch[07]: Color"
                        className="w-full h-full object-scale-down rounded-lg mt-4 pb-4"
                        loading="lazy"
                    />
                  </div>
              )
          }}
          index={7}
          onOpenChange={setProject2CardOpen}
      />,
      <Card
          key="misc-6"
          card={{
              src: "/portfolio/projects/misc/sketches_Page_6.jpg",
              title: "Sketches",
              category: "[08]",
              content: (
                  <div className='h-[50vh]'>
                      <p className="text-neutral-400 text-base md:text-lg font-sans max-w-3xl mx-auto mb-2">
                            Sketch[08]: Wraps Shirt
                      </p>
                      <img
                          src="/portfolio/projects/misc/sketches_Page_6.jpg"
                          alt="Sketch[08]: Wraps Shirt"
                          className="w-full h-full object-scale-down rounded-lg mt-4 pb-4"
                          loading="lazy"
                      />
                  </div>
              )
          }}
          index={8}
          onOpenChange={setProject2CardOpen}
      />,
  ];

  const project3Cards = [
      <Card
          key="tech-1"
          card={{
              src: "/portfolio/projects/tech/booth-01.jpg",
              title: "Photobooth",
              category: "[01]",
              content: (
                  <div className='h-[50vh]'>
                      <p className="text-neutral-400 text-base md:text-lg font-sans max-w-3xl mx-auto mb-2">
                            A collection of photos from the photobooth at a recent event.
                      </p>
                      <img
                          src="/portfolio/projects/tech/booth-01.jpg"
                          alt="Photobooth"
                          className="w-full h-full object-scale-down rounded-lg mt-4 pb-4"
                          loading="lazy"
                      />
                  </div>
              )
          }}
          index={0}
          onOpenChange={_setProject3CardOpen}
      />,
      <Card
          key="tech-2"
          card={{
              src: "/portfolio/projects/tech/boothdemo.jpg",
              title: "Photobooth Demo",
              category: "[02]",
              content: (
                  <div className='h-[50vh]'>
                    <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-lg font-sans max-w-3xl mx-auto">
                        Photobooth hand gesture demonstration.
                    </p>
                    <video
                        src="/portfolio/projects/tech/boothdemo.mp4"
                        autoPlay 
                        muted 
                        loop
                        playsInline
                        className="w-full h-full object-scale-down rounded-lg mt-4 pb-4"
                    >
                    Your browser does not support the video tag.
                    </video>
                  </div>
              )
          }}
          index={1}
          onOpenChange={_setProject3CardOpen}
      />,
      <Card
          key="tech-3"
          card={{
              src: "/portfolio/projects/tech/booth-02.jpg",
              title: "Photobooth",
              category: "[03]",
              content: (
                  <div className='h-[50vh]'>
                      <p className="text-neutral-400 text-base md:text-lg font-sans max-w-3xl mx-auto mb-2">
                            A collection of photos from the photobooth at a recent event.
                      </p>
                      <img
                          src="/portfolio/projects/tech/booth-02.jpg"
                          alt="Photobooth"
                          className="w-full h-full object-scale-down rounded-lg mt-4 pb-4"
                          loading="lazy"
                      />
                  </div>
              )
          }}
          index={2}
          onOpenChange={_setProject3CardOpen}
      />,
      <Card
          key="tech-4"
          card={{
              src: "/portfolio/projects/tech/booth-03.jpg",
              title: "Photobooth",
              category: "[04]",
              content: (
                  <div className='h-[50vh]'>
                      <p className="text-neutral-400 text-base md:text-lg font-sans max-w-3xl mx-auto mb-2">
                            A collection of photos from the photobooth at a recent event.
                      </p>
                      <img
                          src="/portfolio/projects/tech/booth-03.jpg"
                          alt="Photobooth"
                          className="w-full h-full object-scale-down rounded-lg mt-4 pb-4"
                          loading="lazy"
                      />
                  </div>
              )
          }}
          index={3}
          onOpenChange={_setProject3CardOpen}
      />,
  ];

    return (
        <div
            className={`${styles['scroll-container']} min-h-screen ${styles['portfolio-bg']} bg-black`}
            style={{
                    backgroundImage: 'url(/portfolio/BackDrop-Test.jpg)',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'top center',
                    backgroundAttachment: 'local',
                    fontFamily: 'var(--font-geist-sans)',
                }}
            >

            {/* Film grain overlay */}
            <div className="fixed inset-0 pointer-events-none z-50 mix-blend-overlay">
                <Noise
                patternSize={isMobile ? 150 : 200}
                patternScaleX={isMobile ? 1 : 2}
                patternScaleY={isMobile ? 1 : 2} 
                patternRefreshInterval={1}
                patternAlpha={30}
                />
            </div>

        
            <div className={`max-w-6xl mx-auto px-3`}>
                {/* Header */}
                <header className={`${styles['section']} py-32`}>
                    <h1 className="text-8xl md:text-9xl text-zinc-100 font-bold mb-8 " 
                        style={{
                            fontFamily: 'var(--font-geist-sans)',
                            textShadow: '0 0 10px rgba(0, 0, 0, 0.8), 0 0 40px rgba(255,255,255,0.6)'
                    }}>
                        Ankar Uyghur
                    </h1>
                    <h3 className="text-right md:text-5xl text-4xl text-zinc-200"
                        style={{
                            fontFamily: 'var(--font-geist-sans)',
                            textShadow: '0 0 10px rgba(30, 14, 119, 0.83), 0 0 40px rgba(255, 255, 255, 0.6)'
                        }}>
                            Aspiring Tailor
                    </h3>
                </header>
            </div>
                

            {/* About Section */}
            <section className={`max-w-7xl mx-auto ${styles['section']} min-h-screen md:py-8 md:py-16 text-zinc-100`}>

                {/* Background Color */}
                <div className="max-w-full mx-auto bg-black/50 backdrop-blur-sm border border-white/20 rounded-3xl py-8 px-3 md:p-8">
                    <SilkBackground className="absolute inset-0 -z-10"
                        speed={2}
                        scale={.7}
                        color="#4c75d4ff"
                        noiseIntensity={5}
                        rotation={0.2}
                    />

                    {/* Flex Div */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 md:mb-4">

                        
                        <h2 className="col-span-full text-6xl font-bold mb-1 md:mb-4 text-center space-y-4"
                        style={{
                            fontFamily: 'var(--font-geist-sans)',
                            textShadow: '0 0 10px rgba(14, 70, 100, 0.8), 0 0 50px rgba(255,255,255,0.5)'
                        }}>About Me</h2>

                        <p className="indent-8 text-l leading-relaxed text-left max-w-3xl px-4 py-2">
                            My purpose is to fight against the erasure of my people through bringing Uyghur culture to the forefront of the fashion world,
                            and my dream is to have my mother, who sacrificed everything to bring me closer to freedom, walk the runway in celebration of liberty.
                        </p>

                        <div className="md:col-start-2 md:row-start-2 md:row-end-5 w-full h-auto">
                            <img
                            src="/portfolio/AnkarTimes.jpg"
                            alt="Ankar Uyghur NY Times"
                            loading="lazy"/>
                        </div>

                        <p className={`scroll-snap-align-start indent-8 text-l leading-relaxed text-left max-w-3xl px-4 py-2`}>
                            While &lsquo;uniform&rsquo; typically suggests conformity, I see it differently. Each individual&rsquo;s uniform embodies their own codex of principles. 
                            My personal focus is on tailoring garments, uniforms, that hold weight and is worn with the intent and resolve to uphold the principles embedded within it.
                        </p>
                        <p className="scroll-snap-align-start indent-8 text-l leading-relaxed text-left max-w-3xl px-4 pb-8 mb-16 md:mb-8">
                            As a first-generation immigrant born in former East Turkestan, I&rsquo;m quick to learn and adapt to any environment. I&rsquo;m a driven and diligent eternal-student 
                            who loves nothing more than to be challenged with a difficult problem. As a self-taught sewer with experience in machine operation, alterations, and constructing original designs, 
                            I am looking for opportunities to grow professionally through positions in production sewing, alterations, garment assembly, finisher/trimmer, cutter, and any other ways of making use of my wide skillset.
                        </p>
                        
                    </div>
                
                    {/* </SilkBackground> */}
                </div>
            </section>

            {/* Fashion Projects Section */}
            <section className={`${styles['section']} py-8 md:py-16 max-w-7xl mx-auto px-2`}>
                <h2 className={`text-5xl md:text-6xl font-bold mb-8 text-slate-900 md:text-slate-900`}
                    style={{
                        fontFamily: 'var(--font-geist-sans)',
                        textShadow: '0 0 15px rgba(0, 0, 0, 0.5), 0 0 40px rgba(255,255,255,0.6)'
                    }}>Fashion Skills & Projects</h2>

                {/* Skills Subsection */}
                <div className="mb-8 space-y-8">
                    <h3 className="text-5xl md:text-6xl font-semibold mb-6 text-slate-800 md:text-slate-900"
                        style={{
                            fontFamily: 'var(--font-geist-sans)',
                            textShadow: '0 0 10px rgba(12, 22, 52, 0.6), 0 0 40px rgba(179, 179, 179, 0.5)'
                    }}>Skills</h3>
                    
                    <div className="flex flex-wrap gap-4">
                        <Magnetic strength={0.03} range={500}>
                            <div className="bg-gradient-to-r from-zinc-900/90 to-zinc-800/70 text-white px-3 md:px-6 py-1.5 md:py-3 rounded-lg border border-stone-500/30 hover:from-zinc-800/90 hover:to-zinc-700/80 transition-all cursor-default">
                                <div className="text-xs text-slate-300 font-mono">[01]</div>
                                <div className="font-medium text-sm md:text-md">Sewing machine operation</div>
                            </div>
                        </Magnetic>
                        <Magnetic strength={0.03} range={500}>
                            <div className="bg-gradient-to-r from-zinc-900/90 to-zinc-800/70 text-white px-3 md:px-6 py-1.5 md:py-3 rounded-lg border border-stone-500/30 hover:from-zinc-800/90 hover:to-zinc-700/80 transition-all cursor-default">
                                <div className="text-xs text-slate-300 font-mono">[02]</div>
                                <div className="font-medium text-sm md:text-md">Hand sewing techniques</div>
                            </div>
                        </Magnetic>
                        <Magnetic strength={0.03} range={500}>
                            <div className="bg-gradient-to-r from-zinc-900/90 to-zinc-800/70 text-white px-3 md:px-6 py-1.5 md:py-3 rounded-lg border border-stone-500/30 hover:from-zinc-800/90 hover:to-zinc-700/80 transition-all cursor-default">
                                <div className="text-xs text-slate-300 font-mono">[03]</div>
                                <div className="font-medium text-sm md:text-md">Garment deconstruction and alterations</div>
                            </div>
                        </Magnetic>
                        <Magnetic strength={0.03} range={500}>
                            <div className="bg-gradient-to-r from-zinc-900/90 to-zinc-800/70 text-white px-3 md:px-6 py-1.5 md:py-3 rounded-lg border border-stone-500/30 hover:from-zinc-800/90 hover:to-zinc-700/80 transition-all cursor-default">
                                <div className="text-xs text-slate-300 font-mono">[04]</div>
                                <div className="font-medium text-sm md:text-md">Pattern cutting and fabric preparation</div>
                            </div>
                        </Magnetic>
                        <Magnetic strength={0.03} range={500}>
                            <div className="bg-gradient-to-r from-zinc-900/90 to-zinc-800/70 text-white px-3 md:px-6 py-1.5 md:py-3 rounded-lg border border-stone-500/30 hover:from-zinc-800/90 hover:to-zinc-700/80 transition-all cursor-default">
                                <div className="text-xs text-slate-300 font-mono">[05]</div>
                                <div className="font-medium text-sm md:text-md">CLO3D software fundamentals</div>
                            </div>
                        </Magnetic>
                    </div>
                </div>

                {/* Projects Subsection */}
                <div className={`${styles['section']} py-8 md:py-16 max-w-7xl mx-auto`}>
                    <h3 className={`text-5xl md:text-6xl font-semibold mb-4 text-slate-600 md:text-slate-800 pb-4`} ref={project1Ref}
                        style={{
                            fontFamily: 'var(--font-geist-sans)',
                            textShadow: '0 0 10px rgba(12, 22, 52, 0.6), 0 0 40px rgba(179, 179, 179, 0.5)'
                    }}>Projects</h3>

                    {/* Project 1: Leather Tabis */}
                    <div className={`border border-white/20 rounded-lg p-4 md:p-6 bg-black/50 backdrop-blur-lg my-4 ${project1CardOpen ? 'h-screen' : ''}`} >
                        <div
                            className="cursor-pointer"
                            onClick={() => setProject1Expanded(!project1Expanded)}
                        >
                            <h4 className="text-2xl font-semibold mb-2 text-white">Frankenstein Tabi Boots</h4>
                            <p className="text-gray-300 mb-4">
                                Deconstructed Yeezy Pod soles bonded to Uzbek leather socks. Toebox modified with split-toe silhouette. 
                                Surface treated with sandpaper and acetone prep for cement sole attachment. </p>
                            <button className="text-blue-400 hover:text-blue-300">
                                {project1Expanded ? 'Hide Gallery ↑' : 'View Gallery ↓'}
                            </button>
                        </div>

                        {project1Expanded && (
                            <div className="mt-6">
                                <Carousel items={project1Cards} />
                            </div>
                        )}
                    </div>

                    {/* Project 2: Misc */}
                    <div className={`scroll-snap-align-start min-h-[20vh] `} ref={project2Ref}> 
                        {/* ${styles['section']}`}> */}
                    <div className={`border border-white/20 rounded-lg p-4 md:p-6 bg-black/50 backdrop-blur-lg my-4 ${project2CardOpen ? 'h-screen' : ''}`}>
                        <div
                            className="cursor-pointer"
                            onClick={() => setProject2Expanded(!project2Expanded)}
                        >
                            <h4 className="text-2xl font-semibold mb-2 text-white">Supplemental Works</h4>
                            <p className="text-gray-300 mb-4">
                                A collage of various past works and illustrations. </p>
                            <button className="text-blue-400 hover:text-blue-300">
                                {project2Expanded ? 'Hide Gallery ↑' : 'View Gallery ↓'}
                            </button>
                        </div>

                        {project2Expanded && (
                            <div className="mt-6">
                                <Carousel items={project2Cards} />
                            </div>
                        )}
                    </div>
                    </div>
                </div>
            </section>

            {/* Technical Skills and Projects Section */}
            <section className={`${styles['section']} py-8 md:py-16 max-w-7xl mx-auto px-2`}>
                <h2 className={`text-5xl md:text-6xl font-bold mb-8 text-zinc-900 md:text-zinc-900`}
                    style={{
                        fontFamily: 'var(--font-geist-sans)',
                        textShadow: '0 0 70px rgba(201, 201, 201, 1), 0 0 15px rgba(177, 181, 255, .3)'
                    }}>Technical Skills</h2>

                {/* Skills Subsection */}
                <div className="mb-2 space-y-8">
                    
                    <div className="flex flex-wrap gap-4">
                        <Magnetic strength={0.03} range={500}>
                            <div className="bg-gradient-to-r from-zinc-900/90 to-zinc-800/70 text-white px-3 md:px-6 py-1.5 md:py-3 rounded-lg border border-stone-500/30 hover:from-zinc-800/90 hover:to-zinc-700/80 transition-all cursor-default">
                                <div className="text-xs text-slate-300 font-mono">[01]</div>
                                <div className="font-medium text-sm md:text-md">6 real years of experience as a Senior Software Development Engineer</div>
                            </div>
                        </Magnetic>
                        <Magnetic strength={0.03} range={500}>
                            <div className="bg-gradient-to-r from-zinc-900/90 to-zinc-800/70 text-white px-3 md:px-6 py-1.5 md:py-3 rounded-lg border border-stone-500/30 hover:from-zinc-800/90 hover:to-zinc-700/80 transition-all cursor-default">
                                <div className="text-xs text-slate-300 font-mono">[02]</div>
                                <div className="font-medium text-sm md:text-md">Creative agency leadership and direction: Artist graphics (tour posters, flyers) and event curation with established Brooklyn club scene presence</div>
                            </div>
                        </Magnetic>
                        <Magnetic strength={0.03} range={500}>
                            <div className="bg-gradient-to-r from-zinc-900/90 to-zinc-800/70 text-white px-3 md:px-6 py-1.5 md:py-3 rounded-lg border border-stone-500/30 hover:from-zinc-800/90 hover:to-zinc-700/80 transition-all cursor-default">
                                <div className="text-xs text-slate-300 font-mono">[03]</div>
                                <div className="font-medium text-sm md:text-md">Event production: Planning, logistics, budget management, venue and artist agent negotiations</div>
                            </div>
                        </Magnetic>
                        <Magnetic strength={0.03} range={500}>
                            <div className="bg-gradient-to-r from-zinc-900/90 to-zinc-800/70 text-white px-3 md:px-6 py-1.5 md:py-3 rounded-lg border border-stone-500/30 hover:from-zinc-800/90 hover:to-zinc-700/80 transition-all cursor-default">
                                <div className="text-xs text-slate-300 font-mono">[04]</div>
                                <div className="font-medium text-sm md:text-md">Interactive installation development: TouchDesigner programming with analog/digital hardware integration (VHS camera, CRT TV, etc)</div>
                            </div>
                        </Magnetic>
                    </div>
                </div>

                {/* Projects Subsection */}
                <div className={`pt-0 md:pt-0 max-w-7xl mx-auto`}>

                    {/* OP Photobooth */}
                    <Carousel items={project3Cards} />

                </div>
            </section>

            {/* Contact Section */}
            <section className={`${styles['section']} py-4 md:py-16 max-w-7xl mx-auto px-2`}>
                <h3 className={`text-5xl md:text-6xl font-semibold mb-4 text-slate-900 md:text-slate-800 pb-4`}
                        style={{
                            fontFamily: 'var(--font-geist-sans)',
                            textShadow: '0 0 10px rgba(12, 22, 52, 0.6), 0 0 20px rgba(255, 255, 255, 0.8)'
                    }}>Availability and Contact</h3>
                
                <div className="space-y-6">
                    <div className="bg-black/70 backdrop-blur-sm border border-white/20 rounded-lg p-6 max-w-4xl">
                        <p className="text-white text-lg leading-relaxed">
                            As the eldest son of a family of first-generation immigrants, I&rsquo;m unavailable from 9AM to 5PM, from Mondays to Fridays at the moment as I have a responsibility of helping support my family and my siblings&rsquo; education. Although for those 40 hours I will be unavailable, as someone who balances multiple commitments successfully, I can guarantee dedicated focus and quality output during the remaining 72 waking hours of my week.
                        </p>
                    </div>
                    
                    <div className="bg-black/50 backdrop-blur-sm border border-white/20 rounded-lg p-6 max-w-md">
                        <h4 className="text-2xl font-semibold mb-4 text-white">Contact</h4>
                        <div className="space-y-2 text-white">
                            <p>571-422-9018</p>
                            <p>ankar.uyghur@openpresent.nyc</p>
                            <p className="flex items-center">
                                <IconBrandInstagram className="w-5 h-5 mr-2 text-blue-400" />
                                <a href="https://instagram.com/ikaros_uyghur" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">
                                    @ikaros_uyghur
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </section>
            

            {/* Temporary filler for testing background scroll
            <div className="mt-16 space-y-8">
                {Array.from({ length: 45 }, (_, i) => (
                <div key={i} className="bg-opacity-80 p-6 rounded-lg">
                    <h3 className="text-xl font-bold mb-4">Filler Section {i + 1}</h3>
                    <p className="text-gray-700">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
                    tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
                    veniam, quis nostrud exercitation ullamco laboris.
                    </p>
                </div>
                ))}
            </div> */}

        </div>
    )
}