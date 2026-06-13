import React from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Navigation, Sparkles, Cpu } from 'lucide-react';

export default function Hero({ onOpenMap }) {
  return (
    <section className="relative w-full h-[90vh] min-h-[700px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/gateway.png" 
          alt="Gateway of India" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 flex flex-col items-center text-center mt-20">
        {/* Floating AI Badges */}
        <motion.div 
          animate={{ y: [0, -10, 0] }} 
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 md:right-20 hidden md:flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-white shadow-xl"
        >
          <Cpu className="w-4 h-4 text-lux-orange" />
          <span className="text-sm font-semibold tracking-wider">AI Powered Routing</span>
        </motion.div>

        <motion.div 
          animate={{ y: [0, 10, 0] }} 
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-0 md:left-10 hidden md:flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-white shadow-xl"
        >
          <Sparkles className="w-4 h-4 text-lux-gold" />
          <span className="text-sm font-semibold tracking-wider">100% Accurate Data</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-serif text-white mb-6 max-w-4xl leading-tight"
        >
          Discover the Magic of <span className="text-transparent bg-clip-text bg-gradient-to-r from-lux-gold via-lux-orange to-[#ff9a76] font-bold">India</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl text-white/90 font-light max-w-2xl mb-12"
        >
          Don't just travel. Travel smart. Our AI-powered route planner analyzes thousands of flight, train, and bus combinations to find your perfect itinerary.
        </motion.p>

        {/* Premium Glassmorphism Search Box */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-white/15 backdrop-blur-lg border border-white/30 p-3 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex flex-col md:flex-row items-center gap-4 w-full max-w-4xl"
        >
          <div className="flex-1 flex items-center gap-3 px-6 py-3 border-b md:border-b-0 md:border-r border-white/20 w-full hover:bg-white/5 rounded-3xl transition-colors">
            <MapPin className="text-lux-orange w-7 h-7" />
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-1">From</span>
              <input type="text" placeholder="Where from?" defaultValue="New Delhi" className="outline-none text-white font-semibold bg-transparent text-lg placeholder-white/50 w-full" />
            </div>
          </div>

          <div className="flex-1 flex items-center gap-3 px-6 py-3 border-b md:border-b-0 md:border-r border-white/20 w-full hover:bg-white/5 rounded-3xl transition-colors">
            <MapPin className="text-lux-gold w-7 h-7" />
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-1">To</span>
              <input type="text" placeholder="Where to?" defaultValue="Mumbai" className="outline-none text-white font-semibold bg-transparent text-lg placeholder-white/50 w-full" />
            </div>
          </div>

          <div className="flex-1 flex items-center gap-3 px-6 py-3 w-full hover:bg-white/5 rounded-3xl transition-colors">
            <Navigation className="text-[#ff9a76] w-7 h-7" />
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-1">Travel Type</span>
              <select className="outline-none text-white font-semibold bg-transparent text-lg cursor-pointer appearance-none">
                <option className="text-lux-navy">Compare All</option>
                <option className="text-lux-navy">Flight Only</option>
                <option className="text-lux-navy">Train Only</option>
                <option className="text-lux-navy">Scenic Route</option>
              </select>
            </div>
          </div>

          <button 
            onClick={onOpenMap}
            className="relative group bg-gradient-to-r from-lux-orange to-[#e85d38] text-white w-full md:w-auto px-10 py-5 rounded-full font-bold tracking-wide transition-all hover:scale-105 flex items-center justify-center gap-2 overflow-hidden shadow-[0_0_20px_rgba(224,122,95,0.4)]"
          >
            <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-out" />
            <Search className="w-5 h-5 relative z-10" />
            <span className="relative z-10 text-lg">Search</span>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
