import React from 'react';
import { motion } from 'framer-motion';

const stories = [
  {
    title: "Choose Your Destination",
    desc: "Select your starting point and your dream destination from our extensive list of beautiful Indian cities. Whether it's the mountains of the north or the beaches of the south, we've got you covered.",
    image: "/images/gateway.png",
    badge: "Step 1"
  },
  {
    title: "Set Your Preferences",
    desc: "Customize your maximum budget and available time. Choose your preferred transport mode or let our system compare all of them to find the ultimate balance of comfort and cost.",
    image: "/images/varanasi.png",
    badge: "Step 2",
    reverse: true
  },
  {
    title: "Let AI Do The Rest",
    desc: "Our computer science algorithms (A*, UCS, Minimax) instantly generate the most optimal route. Your itinerary is beautifully visualized on an interactive map with precise pricing.",
    image: "/images/mysore.png",
    badge: "Step 3"
  }
];

export default function StorySections() {
  return (
    <section id="stories" className="py-24 bg-lux-white">
      <div className="max-w-7xl mx-auto px-8">
        
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-serif mb-4">How It Works</h2>
          <p className="text-lg text-lux-muted font-light max-w-2xl mx-auto">Plan your perfect trip in three simple steps using our elegant routing engine.</p>
        </div>

        <div className="flex flex-col gap-32">
          {stories.map((story, idx) => (
            <div key={idx} className={`flex flex-col ${story.reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-16`}>
              
              <motion.div 
                initial={{ opacity: 0, x: story.reverse ? 50 : -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="flex-1 w-full"
              >
                <div className="text-lux-orange font-semibold tracking-widest uppercase text-sm mb-4">{story.badge}</div>
                <h3 className="text-3xl md:text-4xl font-serif mb-6 leading-tight">{story.title}</h3>
                <p className="text-lg text-lux-muted font-light leading-relaxed mb-8">{story.desc}</p>
                <button className="text-lux-navy font-semibold border-b-2 border-lux-navy pb-1 hover:text-lux-orange hover:border-lux-orange transition-colors">
                  Learn more
                </button>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="flex-1 w-full"
              >
                <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
                  <img src={story.image} alt={story.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
              </motion.div>
              
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
}
