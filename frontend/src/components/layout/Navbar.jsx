import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

export default function Navbar({ onOpenMap }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'glass-nav py-4' : 'bg-transparent py-6'}`}
    >
      <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer">
          <MapPin className={`w-8 h-8 ${scrolled ? 'text-lux-orange' : 'text-white'}`} />
          <span className={`text-2xl font-serif font-bold tracking-tight ${scrolled ? 'text-lux-navy' : 'text-white'}`}>
            Travelora
          </span>
        </div>
        
        <div className={`hidden md:flex items-center gap-10 font-medium ${scrolled ? 'text-lux-text' : 'text-white/90'}`}>
          <a href="#destinations" className="hover:opacity-70 transition-opacity">Destinations</a>
          <a href="#features" className="hover:opacity-70 transition-opacity">Why Us</a>
          <a href="#stories" className="hover:opacity-70 transition-opacity">Journal</a>
        </div>
        
        <button 
          onClick={onOpenMap}
          className={scrolled ? 'lux-button px-6 py-3 text-sm' : 'lux-button px-6 py-3 text-sm'}
        >
          <span>Plan Your Trip</span>
        </button>
      </div>
    </motion.nav>
  );
}
