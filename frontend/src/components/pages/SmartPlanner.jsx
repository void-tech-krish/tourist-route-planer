import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Wallet, Map, Sparkles, X, Loader2, Navigation, CheckCircle2, Clock } from 'lucide-react';

export default function SmartPlanner({ onClose }) {
  const [state, setState] = useState('Maharashtra');
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState('Moderate');
  const [style, setStyle] = useState('Temple');
  
  const [loading, setLoading] = useState(false);
  const [itineraryData, setItineraryData] = useState(null);
  const [error, setError] = useState('');

  const generateItinerary = async () => {
    setLoading(true);
    setError('');
    setItineraryData(null);
    try {
      const response = await fetch('http://localhost:5000/api/plan-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state, days, budget, style })
      });
      const data = await response.json();
      if (data.success) {
        setItineraryData(data);
      } else {
        setError(data.message || 'Failed to generate itinerary.');
      }
    } catch (err) {
      setError('Could not connect to the AI engine.');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 w-full h-full z-[150] flex bg-black/40 backdrop-blur-sm justify-center items-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
      >
        {/* Left Side: Controls */}
        <div className="w-full md:w-1/3 bg-gray-50 border-r border-gray-100 p-8 flex flex-col gap-6 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-lux-navy flex items-center gap-2">
              <Sparkles className="text-lux-orange w-6 h-6" />
              AI Planner
            </h2>
            <button onClick={onClose} className="md:hidden p-2 hover:bg-gray-200 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <p className="text-sm text-lux-muted">Let our AI build a perfectly optimized, day-by-day itinerary from our database of 1000+ locations.</p>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-lux-muted uppercase tracking-wider mb-2 block">Destination State</label>
              <input 
                type="text" 
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full bg-white border border-gray-200 text-lux-navy rounded-xl p-3 outline-none focus:border-lux-orange"
                placeholder="e.g. Maharashtra, Goa..."
              />
            </div>

            <div>
              <label className="text-xs font-bold text-lux-muted uppercase tracking-wider mb-2 block">Duration (Days)</label>
              <input 
                type="number" 
                min="1" max="14"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                className="w-full bg-white border border-gray-200 text-lux-navy rounded-xl p-3 outline-none focus:border-lux-orange"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-lux-muted uppercase tracking-wider mb-2 block">Budget Tier</label>
              <select 
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full bg-white border border-gray-200 text-lux-navy rounded-xl p-3 outline-none focus:border-lux-orange"
              >
                <option value="Budget">Budget</option>
                <option value="Moderate">Moderate</option>
                <option value="Luxury">Luxury</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-lux-muted uppercase tracking-wider mb-2 block">Travel Style</label>
              <select 
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full bg-white border border-gray-200 text-lux-navy rounded-xl p-3 outline-none focus:border-lux-orange"
              >
                <option value="Temple">Spiritual & Temples</option>
                <option value="Beach">Beaches & Coastal</option>
                <option value="Hill">Hill Stations & Nature</option>
                <option value="Historical">Historical Forts</option>
              </select>
            </div>
          </div>

          <button 
            onClick={generateItinerary}
            disabled={loading}
            className="mt-auto w-full bg-lux-orange hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg transition-transform hover:-translate-y-1 flex justify-center items-center gap-2"
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</> : 'Generate Magic'}
          </button>
        </div>

        {/* Right Side: Results Timeline */}
        <div className="w-full md:w-2/3 p-8 overflow-y-auto bg-white relative">
          <button onClick={onClose} className="hidden md:block absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors z-10">
            <X className="w-6 h-6 text-gray-500" />
          </button>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 mb-6">
              {error}
            </div>
          )}

          {!itineraryData && !loading && !error && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
              <Map className="w-16 h-16 mb-4 text-gray-300" />
              <p className="text-xl font-medium text-gray-500">Your custom itinerary will appear here</p>
            </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="relative">
                <Loader2 className="w-16 h-16 animate-spin text-lux-orange opacity-20" />
                <Sparkles className="w-8 h-8 text-lux-orange absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <p className="mt-4 text-lg font-medium text-lux-navy animate-pulse">Running AI Optimization Algorithms...</p>
              <p className="text-sm text-gray-500">Scanning 1000+ locations for the best matches</p>
            </div>
          )}

          {itineraryData && !loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-12">
              <div className="mb-8 border-b pb-6">
                <h1 className="text-3xl font-bold text-lux-navy mb-2">The Ultimate {itineraryData.state} Trip</h1>
                <div className="flex gap-4 text-sm font-medium text-lux-muted">
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4"/> {itineraryData.total_days} Days</span>
                  <span className="flex items-center gap-1"><Wallet className="w-4 h-4"/> Est. ₹{itineraryData.total_estimated_cost_inr}</span>
                </div>
              </div>

              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                {itineraryData.itinerary.map((day, idx) => (
                  <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-lux-orange text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 font-bold">
                      {day.day}
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl bg-white border border-gray-100 shadow-lg shadow-gray-100/50">
                      <h3 className="font-bold text-lg text-lux-navy mb-4">{day.title}</h3>
                      <div className="space-y-4">
                        {day.activities.map((act, i) => (
                          <div key={i} className="flex gap-3">
                            <div className="w-16 shrink-0 text-xs font-bold text-lux-orange mt-1">{act.time}</div>
                            <div>
                              <p className="font-semibold text-gray-800">{act.location.name}</p>
                              <p className="text-xs text-gray-500 mt-1">{act.location.description}</p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{act.location.type}</span>
                                <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-full">Crowd: {act.location.crowd_level}</span>
                                <span className="text-[10px] bg-green-50 text-green-600 px-2 py-1 rounded-full">₹{act.location.estimated_cost_inr}</span>
                              </div>
                              {act.travel_from_previous && (
                                <div className="flex items-center gap-1 text-xs text-blue-500 mt-2 bg-blue-50/50 p-2 rounded-lg">
                                  <Navigation className="w-3 h-3" /> Travel: {act.travel_from_previous}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
