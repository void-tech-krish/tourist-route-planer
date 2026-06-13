import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CloudRain, Sun, AlertTriangle, MapPin } from 'lucide-react';
import { nodes } from '../../utils/cities.js';
import { haversineDistRaw } from '../../utils/algorithms.js';

export default function BayesianPredictorSection() {
  const [weather, setWeather] = useState('Sunny');
  const [origin, setOrigin] = useState('DEL');
  const [destination, setDestination] = useState('BOM');
  const [probability, setProbability] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkDelay = async () => {
    setLoading(true);
    try {
      const dist = haversineDistRaw(nodes[origin].lat, nodes[origin].lng, nodes[destination].lat, nodes[destination].lng);
      
      const response = await fetch('http://localhost:5000/api/bayesian_delay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weather, distance_km: dist })
      });
      const data = await response.json();
      if (data.success) {
        setProbability(data.probability);
      }
    } catch (error) {
      console.error("Failed to fetch Bayesian prediction:", error);
    }
    setLoading(false);
  };

  return (
    <section className="py-24 bg-white border-t border-gray-100">
      <div className="max-w-4xl mx-auto px-8 text-center">
        
        <h2 className="text-4xl font-serif mb-4 text-lux-navy">AI Delay Predictor</h2>
        <p className="text-lg text-lux-muted font-light mb-12">
          Powered by Bayesian Networks. Predict the probability of a travel delay based on weather conditions.
        </p>

        <div className="lux-card p-10 flex flex-col md:flex-row items-center justify-between gap-8 border border-gray-100 bg-lux-bg">
          
          <div className="flex-1 text-left space-y-6 w-full">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-lux-muted uppercase tracking-wider block mb-2">
                  Origin City
                </label>
                <select 
                  value={origin} 
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-lux-gold/50"
                >
                  {Object.values(nodes).sort((a,b) => a.name.localeCompare(b.name)).map(n => (
                    <option key={`orig-${n.id}`} value={n.id}>{n.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-lux-muted uppercase tracking-wider block mb-2">
                  Destination City
                </label>
                <select 
                  value={destination} 
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-lux-gold/50"
                >
                  {Object.values(nodes).sort((a,b) => a.name.localeCompare(b.name)).map(n => (
                    <option key={`dest-${n.id}`} value={n.id}>{n.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-lux-muted uppercase tracking-wider block mb-2">
                Select Current Weather
              </label>
              <div className="flex gap-4">
                <button 
                  onClick={() => setWeather('Sunny')}
                  className={`flex-1 p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${weather === 'Sunny' ? 'border-lux-orange bg-orange-50 text-lux-orange shadow-md' : 'border-gray-200 text-lux-muted hover:border-orange-200'}`}
                >
                  <Sun className="w-8 h-8" />
                  <span className="font-semibold">Sunny</span>
                </button>
                <button 
                  onClick={() => setWeather('Rainy')}
                  className={`flex-1 p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${weather === 'Rainy' ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-md' : 'border-gray-200 text-lux-muted hover:border-blue-200'}`}
                >
                  <CloudRain className="w-8 h-8" />
                  <span className="font-semibold">Rainy</span>
                </button>
              </div>
            </div>

            <button 
              onClick={checkDelay}
              className="w-full lux-button flex items-center justify-center gap-2 py-4"
              disabled={loading}
            >
              {loading ? 'Calculating via Bayesian Network...' : 'Predict Delay Probability'}
            </button>
          </div>

          <div className="flex-1 w-full flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[200px]">
            {probability !== null ? (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center space-y-4"
              >
                <AlertTriangle className={`w-12 h-12 mx-auto ${probability > 0.2 ? 'text-red-500' : 'text-green-500'}`} />
                <h3 className="text-xl font-medium text-lux-navy">Delay Probability</h3>
                <div className={`text-6xl font-bold ${probability > 0.2 ? 'text-red-500' : 'text-green-500'}`}>
                  {(probability * 100).toFixed(1)}%
                </div>
                <p className="text-lux-muted text-sm mt-2">Calculated using exact inference by enumeration</p>
              </motion.div>
            ) : (
              <div className="text-lux-muted text-center">
                Select weather and click predict to see the Bayesian Network output.
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
