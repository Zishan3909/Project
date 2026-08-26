import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Music2, Facebook, Twitter, Youtube, Instagram } from 'lucide-react';

export default function LoadingScreen({ onComplete }) {
  useEffect(() => {
    // Auto transition to the dashboard after 8 seconds
    const timer = setTimeout(onComplete, 8000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <main className="relative w-full min-h-[115vh] overflow-x-hidden flex flex-col items-center font-sans selection:bg-white/20 selection:text-white bg-[#121212]">
      
      {/* Background Video */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-[0]"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260429_114316_1c7889ad-2885-410e-b493-98119fee0ddb.mp4"
      />

      <div className="relative z-10 w-full max-w-7xl flex flex-col items-center px-4 md:px-8 mt-24">
        
        {/* Upper CTA Placeholder */}
        <div className="text-center mb-auto flex flex-col items-center justify-center h-[35vh]">
          <h1 className="text-white text-3xl md:text-5xl font-bold tracking-[0.2em] mb-4 drop-shadow-2xl">
            SYSTEM BOOTING...
          </h1>
          <p className="text-white/80 text-sm tracking-widest uppercase">
            Initializing global radar and telemetry links
          </p>
          <button 
            onClick={onComplete} 
            className="mt-8 px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/30 rounded-full text-white text-xs uppercase tracking-widest backdrop-blur-md transition-all active:scale-95"
          >
            Enter Command Center
          </button>
        </div>

        {/* Liquid Glass Footer */}
        <motion.footer 
          initial={{ opacity: 0, y: 40 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
          className="liquid-glass w-full rounded-3xl p-6 md:p-10 text-white/70 mt-32 md:mt-64 mb-20"
        >
          {/* Footer Layout - Top Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 mb-10">
            
            <div className="md:col-span-5">
              <div className="flex items-center gap-3 mb-4 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="currentColor">
                  <path d="M 4.688 136 C 68.373 136 120 187.627 120 251.312 C 120 252.883 119.967 254.445 119.905 256 L 0 256 L 0 136.096 C 1.555 136.034 3.117 136 4.688 136 Z M 251.312 136 C 252.883 136 254.445 136.034 256 136.096 L 256 256 L 136.095 256 C 136.032 254.438 136.001 252.875 136 251.312 C 136 187.627 187.627 136 251.312 136 Z M 119.905 0 C 119.967 1.555 120 3.117 120 4.688 C 120 68.373 68.373 120 4.687 120 C 3.117 120 1.555 119.967 0 119.905 L 0 0 Z M 256 119.905 C 254.445 119.967 252.883 120 251.312 120 C 187.627 120 136 68.373 136 4.687 C 136 3.117 136.033 1.555 136.095 0 L 256 0 Z" />
                </svg>
                <span className="text-xl font-medium tracking-widest">LUMINA</span>
              </div>
              <p className="text-sm leading-relaxed max-w-sm">
                Lumina provides premium clarity on global events and cosmic wonders - shared with all for free.
              </p>
            </div>
            
            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div>
                <h3 className="text-sm uppercase tracking-wider text-white font-medium mb-4">Discover</h3>
                <ul className="text-xs space-y-2">
                  <li><a href="#" className="hover:text-white transition-colors">Labs & Workshops</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Deep Dive Series</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Global Circle</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Resource Vault</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Future Roadmap</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm uppercase tracking-wider text-white font-medium mb-4">The Mission</h3>
                <ul className="text-xs space-y-2">
                  <li><a href="#" className="hover:text-white transition-colors">Origin Story</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">The Collective</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Newsroom Hub</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Join the Team</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm uppercase tracking-wider text-white font-medium mb-4">Concierge</h3>
                <ul className="text-xs space-y-2">
                  <li><a href="#" className="hover:text-white transition-colors">Get in Touch</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Legal Privacy</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">User Agreement</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Report Concern</a></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer Layout - Bottom Bar */}
          <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">
            <p className="text-[10px] uppercase tracking-widest opacity-50">Curated by @GotInGeorgiG</p>
            <div className="flex items-center gap-4">
              <span className="text-[10px] uppercase tracking-widest opacity-50">Join the Journey:</span>
              <div className="flex items-center gap-3">
                <a href="#" className="opacity-70 hover:opacity-100 transition-colors hover:text-white"><Music2 size={16} /></a>
                <a href="#" className="opacity-70 hover:opacity-100 transition-colors hover:text-white"><Facebook size={16} /></a>
                <a href="#" className="opacity-70 hover:opacity-100 transition-colors hover:text-white"><Twitter size={16} /></a>
                <a href="#" className="opacity-70 hover:opacity-100 transition-colors hover:text-white"><Youtube size={16} /></a>
                <a href="#" className="opacity-70 hover:opacity-100 transition-colors hover:text-white"><Instagram size={16} /></a>
              </div>
            </div>
          </div>

        </motion.footer>

      </div>
    </main>
  );
}
