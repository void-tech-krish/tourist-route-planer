import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const reviews = [
  {
    name: "Priya Sharma",
    role: "Solo Backpacker",
    text: "The route comparison tool is brilliant! It showed me that taking a luxury bus was only 2 hours longer but saved me ₹4,000 compared to a flight.",
    img: "https://i.pravatar.cc/150?u=priya"
  },
  {
    name: "Rahul Mehta",
    role: "Tech Enthusiast",
    text: "As a computer science student, seeing intelligent AI algorithms applied to real-world travel routing is absolutely mind-blowing and perfectly executed.",
    img: "https://i.pravatar.cc/150?u=rahul"
  },
  {
    name: "Anjali Desai",
    role: "Family Traveler",
    text: "Planned our entire family trip to Kerala using Travelora. The clean, elegant interface made organizing our chaotic multi-city stops so simple.",
    img: "https://i.pravatar.cc/150?u=anjali"
  }
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-lux-white">
      <div className="max-w-7xl mx-auto px-8">
        
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif mb-4">Traveler Stories</h2>
          <p className="text-lg text-lux-muted font-light max-w-2xl mx-auto">Thousands have optimized their journeys with Travelora's intelligent routing.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
              className="lux-card p-8 flex flex-col justify-between"
            >
              <div>
                <div className="flex gap-1 mb-6">
                  {[1,2,3,4,5].map(star => (
                    <Star key={star} className="w-5 h-5 text-lux-gold fill-lux-gold" />
                  ))}
                </div>
                <p className="text-lux-text font-serif italic text-lg leading-relaxed mb-8">"{review.text}"</p>
              </div>
              
              <div className="flex items-center gap-4">
                <img src={review.img} alt={review.name} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <h4 className="font-semibold text-lux-navy">{review.name}</h4>
                  <span className="text-sm text-lux-muted font-light">{review.role}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
      </div>
    </section>
  );
}
