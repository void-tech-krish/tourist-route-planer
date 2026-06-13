import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Globe, Shield, Star, MapPin } from 'lucide-react';

export default function LandingPage({ onStart }) {
  return (
    <div className="min-h-screen w-full flex flex-col font-sans bg-black text-white overflow-y-auto overflow-x-hidden">
      
      {/* Hero Section */}
      <div className="relative w-full h-[90vh] flex items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="/images/taj_mahal.png" 
            alt="Taj Mahal" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-dark-bg" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-4xl px-4 flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-block px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6"
          >
            <span className="text-neon-cyan font-semibold tracking-wide uppercase text-sm flex items-center gap-2">
              <Star className="w-4 h-4" /> Premium AI Travel Planner
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl font-display font-bold mb-6 drop-shadow-xl"
          >
            Discover the <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple">Magic of India</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-200 mb-10 max-w-2xl font-light"
          >
            Experience personalized itineraries powered by advanced Artificial Intelligence. Optimize for time, cost, and scenic beauty.
          </motion.p>

          <motion.button 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStart}
            className="px-8 py-4 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full text-xl font-bold text-white shadow-neon-cyan hover:shadow-neon-purple transition-all flex items-center gap-3"
          >
            Start Exploring <ArrowRight className="w-6 h-6" />
          </motion.button>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full py-24 bg-dark-bg relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold mb-4">Why Choose RouteAura?</h2>
            <p className="text-gray-400 text-lg">Next-generation travel planning tailored just for you.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel p-8 text-center hover:transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-neon-cyan/20 rounded-2xl flex items-center justify-center mx-auto mb-6 neon-border-glow">
                <Globe className="w-8 h-8 text-neon-cyan" />
              </div>
              <h3 className="text-2xl font-bold mb-4">AI Smart Routes</h3>
              <p className="text-gray-400 leading-relaxed">
                Our A* algorithm analyzes millions of data points to find the perfect route based on your preferences.
              </p>
            </div>
            
            <div className="glass-panel p-8 text-center hover:transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-neon-purple/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_15px_rgba(123,97,255,0.3)] border border-neon-purple/50">
                <Shield className="w-8 h-8 text-neon-purple" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Secure & Reliable</h3>
              <p className="text-gray-400 leading-relaxed">
                We prioritize your safety with verified transit options and real-time environment constraints.
              </p>
            </div>

            <div className="glass-panel p-8 text-center hover:transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-neon-orange/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_15px_rgba(255,122,0,0.3)] border border-neon-orange/50">
                <MapPin className="w-8 h-8 text-neon-orange" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Scenic Modes</h3>
              <p className="text-gray-400 leading-relaxed">
                Want the best views? Our scenic optimization ensures you see the most beautiful parts of the journey.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="w-full py-12 bg-black border-t border-white/10 text-center text-gray-500">
        <p>© 2026 RouteAura AI. Built for the modern traveler.</p>
      </footer>
    </div>
  );
}
