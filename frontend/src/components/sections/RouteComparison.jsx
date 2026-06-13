import React from 'react';
import { motion } from 'framer-motion';
import { Plane, Train, Bus, Car } from 'lucide-react';

const modes = [
  { icon: Plane, name: "Flight", price: "₹8,500", time: "2h 15m", comfort: "High", scenic: "Low" },
  { icon: Train, name: "Train", price: "₹2,200", time: "14h 30m", comfort: "Medium", scenic: "High" },
  { icon: Bus, name: "Bus", price: "₹1,400", time: "18h 00m", comfort: "Low", scenic: "Medium" },
  { icon: Car, name: "Car", price: "₹6,000", time: "16h 45m", comfort: "High", scenic: "Very High" }
];

export default function RouteComparison() {
  return (
    <section className="py-24 bg-lux-bg">
      <div className="max-w-7xl mx-auto px-8">
        
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif mb-4">Compare Smart Routes</h2>
          <p className="text-lg text-lux-muted font-light max-w-2xl mx-auto">See side-by-side comparisons of different transport modes powered by our AI routing engine.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {modes.map((mode, idx) => {
            const Icon = mode.icon;
            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="lux-card p-8 flex flex-col items-center text-center border border-gray-100"
              >
                <div className="w-16 h-16 rounded-full bg-lux-cream flex items-center justify-center mb-6 text-lux-navy">
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-serif font-semibold mb-6">{mode.name}</h3>
                
                <div className="w-full space-y-4 text-left">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <span className="text-lux-muted text-sm">Avg. Price</span>
                    <span className="font-semibold text-lux-navy">{mode.price}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <span className="text-lux-muted text-sm">Avg. Time</span>
                    <span className="font-semibold text-lux-navy">{mode.time}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <span className="text-lux-muted text-sm">Comfort</span>
                    <span className="font-semibold text-lux-navy">{mode.comfort}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2">
                    <span className="text-lux-muted text-sm">Scenic Value</span>
                    <span className="font-semibold text-lux-orange">{mode.scenic}</span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
        
      </div>
    </section>
  );
}
