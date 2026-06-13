import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Clock, DollarSign, Leaf, Zap } from 'lucide-react';
import { nodes } from '../../utils/cities';
import { runAlgorithm } from '../../utils/algorithms';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Luxury Marker
const customLuxIcon = new L.DivIcon({
  className: 'custom-lux-icon',
  html: `<div class="w-5 h-5 bg-lux-orange rounded-full shadow-[0_0_15px_rgba(224,122,95,0.6)] border-[3px] border-white"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

function MapUpdater({ center }) {
  const map = useMap();
  React.useEffect(() => {
    if (center) {
      map.flyTo(center, 6, { duration: 1.5, easeLinearity: 0.25 });
    }
  }, [center, map]);
  return null;
}

export default function InteractiveMapSection() {
  const [origin, setOrigin] = useState('DEL');
  const [destination, setDestination] = useState('BOM');
  const [mode, setMode] = useState('compare all');
  const [algorithm, setAlgorithm] = useState('astar');
  
  const [activeRoute, setActiveRoute] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const cityEntries = Object.entries(nodes);

  const computeRoute = () => {
    setIsCalculating(true);
    setTimeout(() => {
      const result = runAlgorithm(origin, destination, mode, 'cost', algorithm);
      if (result) setActiveRoute(result);
      setIsCalculating(false);
    }, 800);
  };

  return (
    <section id="interactive-map" className="py-24 bg-lux-white">
      <div className="max-w-7xl mx-auto px-8">
        
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif mb-4">Intelligent AI Routing</h2>
          <p className="text-lg text-lux-muted font-light max-w-2xl mx-auto">
            Experience our advanced algorithms. Watch the AI instantly generate the perfect itinerary on an interactive map.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 h-[700px]">
          
          {/* Controls Panel */}
          <div className="w-full lg:w-[400px] lux-card p-8 flex flex-col gap-6 h-full overflow-y-auto border border-gray-100">
            <h3 className="text-2xl font-serif font-semibold text-lux-navy mb-2 flex items-center gap-2">
              <Zap className="w-6 h-6 text-lux-orange" /> Route Settings
            </h3>
            
            <div className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-lux-muted uppercase tracking-wider mb-2 block">Origin</label>
                <select 
                  value={origin} 
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full bg-lux-bg border border-gray-200 text-lux-navy font-medium rounded-xl p-4 outline-none focus:border-lux-orange transition-colors cursor-pointer"
                >
                  {cityEntries.map(([key, city]) => (
                    <option key={`orig-${key}`} value={key}>{city.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-xs font-semibold text-lux-muted uppercase tracking-wider mb-2 block">Destination</label>
                <select 
                  value={destination} 
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-lux-bg border border-gray-200 text-lux-navy font-medium rounded-xl p-4 outline-none focus:border-lux-orange transition-colors cursor-pointer"
                >
                  {cityEntries.map(([key, city]) => (
                    <option key={`dest-${key}`} value={key}>{city.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-lux-muted uppercase tracking-wider mb-2 block">Travel Mode</label>
                <select 
                  value={mode} 
                  onChange={(e) => setMode(e.target.value)}
                  className="w-full bg-lux-bg border border-gray-200 text-lux-navy font-medium rounded-xl p-4 outline-none focus:border-lux-orange transition-colors cursor-pointer"
                >
                  <option value="compare all">Compare All</option>
                  <option value="flight">Flight</option>
                  <option value="train">Train</option>
                  <option value="bus">Bus</option>
                  <option value="car">Car</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-lux-muted uppercase tracking-wider mb-2 block">AI Algorithm</label>
                <select 
                  value={algorithm} 
                  onChange={(e) => setAlgorithm(e.target.value)}
                  className="w-full bg-lux-bg border border-gray-200 text-lux-navy font-medium rounded-xl p-4 outline-none focus:border-lux-orange transition-colors cursor-pointer"
                >
                  <option value="astar">A* Search (Optimal)</option>
                  <option value="bfs">Breadth-First Search</option>
                  <option value="dfs">Depth-First Search</option>
                  <option value="ucs">Uniform Cost Search</option>
                  <option value="backtrack">Backtracking</option>
                  <option value="fc">Forward Checking</option>
                  <option value="minimax">Minimax (Adversarial)</option>
                  <option value="alphabeta">Alpha-Beta Pruning</option>
                </select>
              </div>
            </div>

            <button 
              onClick={computeRoute}
              disabled={isCalculating}
              className="mt-auto lux-button w-full flex items-center justify-center gap-2 text-lg shadow-lg"
            >
              {isCalculating ? (
                <><Zap className="w-5 h-5 animate-spin" /> Calculating...</>
              ) : (
                'Generate Route'
              )}
            </button>
          </div>

          {/* Map Area */}
          <div className="flex-1 lux-card overflow-hidden relative border border-gray-100 h-[400px] lg:h-full">
            <MapContainer 
              center={[22.9074, 79.5815]} 
              zoom={5} 
              className="w-full h-full z-0"
              zoomControl={false}
            >
              {/* Light Luxury Base Map */}
              <TileLayer
                attribution='&copy; CARTO'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />
              
              {activeRoute && activeRoute.coords.length > 0 && (
                <>
                  <Polyline 
                    positions={activeRoute.coords} 
                    color="#E07A5F" 
                    weight={4} 
                    opacity={1}
                  />
                  <Polyline 
                    positions={activeRoute.coords} 
                    color="#D4A373" 
                    weight={12} 
                    opacity={0.15} 
                  />
                  {activeRoute.path.map((id, idx) => (
                    <Marker key={idx} position={[nodes[id].lat, nodes[id].lng]} icon={customLuxIcon}>
                      <Popup className="lux-popup">
                        <div className="p-1">
                          <h4 className="font-serif font-bold text-lux-navy">{nodes[id].name}</h4>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                  <MapUpdater center={activeRoute.coords[0]} />
                </>
              )}
            </MapContainer>

            {/* Floating Results Card */}
            <AnimatePresence>
              {activeRoute && (
                <motion.div 
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  className="absolute top-6 right-6 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl z-10 w-72 border border-gray-100"
                >
                  <h4 className="font-serif font-bold text-lux-navy mb-4 flex items-center gap-2">
                    <MapPin className="text-lux-orange w-5 h-5" /> 
                    Itinerary Summary
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                      <span className="text-sm text-lux-muted flex items-center gap-2"><Clock className="w-4 h-4" /> Time</span>
                      <span className="font-semibold text-lux-navy">{Math.floor(activeRoute.totalTime / 60)}h {activeRoute.totalTime % 60}m</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                      <span className="text-sm text-lux-muted flex items-center gap-2"><DollarSign className="w-4 h-4" /> Est. Cost</span>
                      <span className="font-semibold text-lux-navy">₹{activeRoute.totalCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-lux-muted flex items-center gap-2"><Leaf className="w-4 h-4 text-green-500" /> Scenic</span>
                      <span className="font-semibold text-lux-navy">{activeRoute.totalScenic} Points</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {!activeRoute && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-[1000]">
                <div className="bg-white/80 backdrop-blur px-6 py-3 rounded-full shadow-lg border border-gray-100 text-lux-navy font-medium tracking-wide">
                  Select a route to generate map
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
