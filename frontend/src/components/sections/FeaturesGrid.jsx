import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Building, Utensils, CloudSun, Map, Navigation, X, ExternalLink } from 'lucide-react';

const features = [
  { icon: Compass, title: "Smart Trip Planning", type: "planning" },
  { icon: Building, title: "Hotel Booking", type: "hotels" },
  { icon: Utensils, title: "Restaurant Finder", type: "restaurants" },
  { icon: CloudSun, title: "Weather Insights", type: "weather" },
  { icon: Map, title: "Nearby Attractions", type: "planning" },
  { icon: Navigation, title: "AI Itinerary Generator", type: "planning" }
];

const externalPlatforms = {
  hotels: [
    { name: "Agoda", desc: "Best for Asian destinations", url: "https://www.agoda.com" },
    { name: "Booking.com", desc: "Largest selection worldwide", url: "https://www.booking.com" },
    { name: "Airbnb", desc: "Unique homes and experiences", url: "https://www.airbnb.com" },
    { name: "Goibibo", desc: "Great Indian domestic deals", url: "https://www.goibibo.com" }
  ],
  restaurants: [
    { name: "Zomato", desc: "Top restaurant discovery", url: "https://www.zomato.com" },
    { name: "Swiggy", desc: "Food delivery & dining", url: "https://www.swiggy.com" },
    { name: "Tripadvisor", desc: "Traveler reviews", url: "https://www.tripadvisor.com" }
  ],
  weather: [
    { name: "AccuWeather", desc: "Hyper-local forecasts", url: "https://www.accuweather.com" },
    { name: "Windy", desc: "Interactive weather map", url: "https://www.windy.com" },
    { name: "Weather.com", desc: "Global weather tracking", url: "https://weather.com" }
  ],
  planning: [
    { name: "Google Travel", desc: "Comprehensive trip organization", url: "https://travel.google.com" },
    { name: "MakeMyTrip", desc: "India's top travel portal", url: "https://www.makemytrip.com" },
    { name: "Tripadvisor", desc: "Discover attractions", url: "https://www.tripadvisor.com" }
  ]
};

export default function FeaturesGrid() {
  const [activeModal, setActiveModal] = useState(null);

  return (
    <section id="features" className="py-24 bg-lux-cream relative">
      <div className="max-w-7xl mx-auto px-8">
        
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif mb-4">Everything You Need</h2>
          <p className="text-lg text-lux-muted font-light max-w-2xl mx-auto">Access the best travel tools instantly. Click any feature to open your preferred platform.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                onClick={() => setActiveModal(feature)}
                className="lux-card p-8 flex flex-col items-center text-center cursor-pointer border border-transparent hover:border-lux-orange/20"
              >
                <div className="w-16 h-16 rounded-full bg-lux-bg flex items-center justify-center mb-6 text-lux-orange transition-transform group-hover:scale-110">
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-serif font-semibold">{feature.title}</h3>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* External Platform Modal */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-lux-navy/40 backdrop-blur-sm"
              onClick={() => setActiveModal(null)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-lux-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full relative z-10"
            >
              <button 
                onClick={() => setActiveModal(null)}
                className="absolute top-6 right-6 text-gray-400 hover:text-lux-navy transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-6">
                <div className="w-12 h-12 rounded-full bg-lux-cream flex items-center justify-center text-lux-orange">
                  <activeModal.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-serif font-semibold text-lux-navy">{activeModal.title}</h3>
                  <p className="text-lux-muted text-sm font-light">Select your preferred platform</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {externalPlatforms[activeModal.type].map((platform, idx) => (
                  <a 
                    key={idx}
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col p-5 rounded-2xl border border-gray-100 hover:border-lux-orange hover:shadow-lg transition-all group bg-white"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-lux-navy text-lg">{platform.name}</h4>
                      <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-lux-orange transition-colors" />
                    </div>
                    <p className="text-sm text-lux-muted font-light">{platform.desc}</p>
                    <span className="mt-4 text-xs font-medium text-lux-orange opacity-0 group-hover:opacity-100 transition-opacity">
                      Open Platform &rarr;
                    </span>
                  </a>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
