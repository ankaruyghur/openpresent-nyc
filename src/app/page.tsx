export default function Home() {
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
