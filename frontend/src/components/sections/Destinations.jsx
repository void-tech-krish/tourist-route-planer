import React from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin } from 'lucide-react';

const destinations = [
  { name: "Taj Mahal, Agra", img: "/images/taj_mahal.png", rating: 4.9, scenic: 98, desc: "The crown jewel of India's architecture." },
  { name: "Kerala Backwaters", img: "/images/kerala_backwaters.png", rating: 4.8, scenic: 95, desc: "Tranquil waters and lush greenery." },
  { name: "The Himalayas", img: "/images/himalayas.png", rating: 4.9, scenic: 99, desc: "Breathtaking mountain escapes." },
  { name: "Hawa Mahal, Jaipur", img: "/images/hawa_mahal.png", rating: 4.7, scenic: 92, desc: "The beautiful Palace of Winds." }
];

export default function Destinations() {
  return (
    <section id="destinations" className="py-24 bg-lux-cream">
      <div className="max-w-7xl mx-auto px-8">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-serif mb-4">Popular Destinations</h2>
            <p className="text-lg text-lux-muted font-light max-w-xl">Explore the most breathtaking locations India has to offer.</p>
          </div>
          <button className="lux-button-outline">View All Destinations</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {destinations.map((dest, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="lux-card group cursor-pointer overflow-hidden"
            >
              <div className="h-64 overflow-hidden relative">
                <img 
                  src={dest.img} 
                  alt={dest.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1 text-sm font-semibold">
                  <Star className="w-4 h-4 text-lux-gold fill-lux-gold" /> {dest.rating}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-serif font-semibold mb-2">{dest.name}</h3>
                <p className="text-lux-muted text-sm font-light mb-4">{dest.desc}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-xs text-lux-muted uppercase tracking-wider font-semibold">
                    <MapPin className="w-4 h-4 text-lux-orange" /> Scenic Score
                  </div>
                  <span className="font-bold text-lux-navy">{dest.scenic}/100</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
      </div>
    </section>
  );
}
