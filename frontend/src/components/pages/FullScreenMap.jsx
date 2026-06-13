import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Clock, DollarSign, Leaf, Zap, ArrowLeft, Plane, Train, Bus, Car, Sparkles, BrainCircuit, Navigation, Flag, Map as MapIcon } from 'lucide-react';
import { nodes } from '../../utils/cities';
import { runAlgorithm } from '../../utils/algorithms';
import SmartPlanner from './SmartPlanner';

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

const stateNames = {
  'DL': 'Delhi',
  'HR': 'Haryana',
  'UP': 'Uttar Pradesh',
  'RJ': 'Rajasthan',
  'PB': 'Punjab',
  'CH': 'Chandigarh',
  'UK': 'Uttarakhand',
  'HP': 'Himachal Pradesh',
  'BR': 'Bihar',
  'WB': 'West Bengal',
  'AS': 'Assam',
  'ML': 'Meghalaya',
  'MH': 'Maharashtra',
  'GJ': 'Gujarat',
  'GA': 'Goa',
  'KA': 'Karnataka',
  'KL': 'Kerala',
  'TN': 'Tamil Nadu',
  'PY': 'Puducherry',
  'TG': 'Telangana',
  'AP': 'Andhra Pradesh',
  'MP': 'Madhya Pradesh',
  'CT': 'Chhattisgarh',
  'OR': 'Odisha',
  'AN': 'Andaman & Nicobar'
};

const getStateCode = (name) => {
  const match = name.match(/\(([^)]+)\)/);
  return match ? match[1] : '';
};

const uniqueStates = [...new Set(Object.values(nodes).map(node => getStateCode(node.name)))]
  .filter(Boolean)
  .map(code => ({ code, name: stateNames[code] || code }))
  .sort((a, b) => a.name.localeCompare(b.name));

// Fetch Real-World Route from OSRM API
async function fetchRealWorldPath(routeData, modeOverride = null) {
  if (!routeData) return null;
  // If flight, or explicit mode is flight, leave as straight lines
  const isFlight = modeOverride === 'flight' || (routeData.modes && routeData.modes.every(m => m === 'flight'));
  if (isFlight) return routeData;

  const coordsStr = routeData.path.map(id => `${nodes[id].lng},${nodes[id].lat}`).join(';');
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    // Using alternative robust OSM server since primary OSRM demo server often times out
    const res = await fetch(`https://routing.openstreetmap.de/routed-car/route/v1/driving/${coordsStr}?overview=full&geometries=geojson`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    const data = await res.json();
    if (data.routes && data.routes.length > 0) {
      // GeoJSON returns [lon, lat], Leaflet needs [lat, lon]
      const denseCoords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
      return { ...routeData, coords: denseCoords };
    }
  } catch(e) {
    console.error("OSRM Routing Error (falling back to straight lines):", e);
  }
  return routeData; // Fallback to straight lines if API fails
}

function MapUpdater({ center }) {
  const map = useMap();
  React.useEffect(() => {
    if (center) {
      map.flyTo(center, 6, { duration: 1.5, easeLinearity: 0.25 });
    }
  }, [center, map]);
  return null;
}

export default function FullScreenMap({ onClose }) {
  const [originState, setOriginState] = useState('DL');
  const [origin, setOrigin] = useState('DEL');
  const [destinationState, setDestinationState] = useState('MH');
  const [destination, setDestination] = useState('BOM');
  const [mode, setMode] = useState('compare all');
  const [algorithm, setAlgorithm] = useState('astar');
  
  const [activeRoute, setActiveRoute] = useState(null);
  const [comparedRoutes, setComparedRoutes] = useState(null); // { cheapest, fastest, all: {} }
  const [isCalculating, setIsCalculating] = useState(false);
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);
  const cityEntries = Object.entries(nodes);

  const computeRoute = async () => {
    setIsCalculating(true);
    setComparedRoutes(null);
    
    if (mode === 'compare all') {
      const flightRaw = runAlgorithm(origin, destination, 'flight', 'cost', algorithm);
      const trainRaw = runAlgorithm(origin, destination, 'train', 'cost', algorithm);
      const busRaw = runAlgorithm(origin, destination, 'bus', 'cost', algorithm);
      const carRaw = runAlgorithm(origin, destination, 'car', 'cost', algorithm);
      
      const allRoutesRaw = [
        { mode: 'flight', data: flightRaw },
        { mode: 'train', data: trainRaw },
        { mode: 'bus', data: busRaw },
        { mode: 'car', data: carRaw }
      ].filter(r => r.data !== null);

      if (allRoutesRaw.length > 0) {
        let cheapest = allRoutesRaw[0];
        let fastest = allRoutesRaw[0];

        allRoutesRaw.forEach(r => {
          if (r.data.totalCost < cheapest.data.totalCost) cheapest = r;
          if (r.data.totalTime < fastest.data.totalTime) fastest = r;
        });

        // Only fetch OSRM data for cheapest and fastest to save API limits
        const cheapestData = await fetchRealWorldPath(cheapest.data, cheapest.mode);
        const fastestData = await fetchRealWorldPath(fastest.data, fastest.mode);
        
        cheapest.data = cheapestData;
        fastest.data = fastestData;

        setComparedRoutes({ cheapest, fastest, allRoutes: allRoutesRaw });
        setActiveRoute(cheapest.data);
      } else {
        setActiveRoute(null);
        alert('No route available for this transportation mode between these locations! (e.g. You cannot take a train or bus to an island). Please try Flight or Compare All.');
      }
    } else {
      const rawResult = runAlgorithm(origin, destination, mode, 'cost', algorithm);
      const finalResult = await fetchRealWorldPath(rawResult, mode);
      if (!finalResult) {
        alert('No route available for this transportation mode between these locations! (e.g. You cannot take a train or bus to an island). Please try Flight or Compare All.');
      }
      setActiveRoute(finalResult || null);
    }
    setIsCalculating(false);
  };

  return (
    <>
    <div className="fixed inset-0 w-full h-full z-[100] flex bg-lux-bg font-sans">
      
      {/* Sidebar - Now with Glassmorphism */}
      <div className="w-full md:w-96 bg-white/85 backdrop-blur-xl border-r border-white/40 shadow-[10px_0_30px_rgba(0,0,0,0.1)] z-20 flex flex-col relative h-full">
        <div className="p-6 border-b border-gray-200/50 flex items-center gap-4 bg-white/50">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-lux-navy" />
          </button>
          <h2 className="text-xl font-serif font-bold text-lux-navy">Travelora Planner</h2>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          <div className="bg-white/40 p-4 rounded-2xl border border-white/60 shadow-sm">
            <label className="text-xs font-bold text-lux-muted uppercase tracking-wider mb-2 block flex items-center gap-2">
              <MapIcon className="w-4 h-4 text-lux-orange" />
              Origin Location
            </label>
            <div className="space-y-2">
              <select 
                value={originState} 
                onChange={(e) => {
                  setOriginState(e.target.value);
                  setOrigin('');
                }}
                className="w-full bg-white border border-gray-200 text-lux-navy font-semibold rounded-xl p-3 outline-none focus:border-lux-orange transition-all cursor-pointer shadow-sm"
              >
                <option value="">Select State...</option>
                {uniqueStates.map(state => (
                  <option key={`orig-state-${state.code}`} value={state.code}>{state.name}</option>
                ))}
              </select>
              <select 
                value={origin} 
                onChange={(e) => setOrigin(e.target.value)}
                disabled={!originState}
                className="w-full bg-white border border-gray-200 text-lux-navy font-semibold rounded-xl p-3 outline-none focus:border-lux-orange transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <option value="">Select City...</option>
                {cityEntries
                  .filter(([key, city]) => getStateCode(city.name) === originState)
                  .map(([key, city]) => (
                    <option key={`orig-city-${key}`} value={key}>
                      {city.name.replace(/\s*\([^)]+\)/, '')}
                    </option>
                  ))
                }
              </select>
            </div>
          </div>
          
          <div className="bg-white/40 p-4 rounded-2xl border border-white/60 shadow-sm">
            <label className="text-xs font-bold text-lux-muted uppercase tracking-wider mb-2 block flex items-center gap-2">
              <Flag className="w-4 h-4 text-lux-navy" />
              Destination
            </label>
            <div className="space-y-2">
              <select 
                value={destinationState} 
                onChange={(e) => {
                  setDestinationState(e.target.value);
                  setDestination('');
                }}
                className="w-full bg-white border border-gray-200 text-lux-navy font-semibold rounded-xl p-3 outline-none focus:border-lux-orange transition-all cursor-pointer shadow-sm"
              >
                <option value="">Select State...</option>
                {uniqueStates.map(state => (
                  <option key={`dest-state-${state.code}`} value={state.code}>{state.name}</option>
                ))}
              </select>
              <select 
                value={destination} 
                onChange={(e) => setDestination(e.target.value)}
                disabled={!destinationState}
                className="w-full bg-white border border-gray-200 text-lux-navy font-semibold rounded-xl p-3 outline-none focus:border-lux-orange transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <option value="">Select City...</option>
                {cityEntries
                  .filter(([key, city]) => getStateCode(city.name) === destinationState)
                  .map(([key, city]) => (
                    <option key={`dest-city-${key}`} value={key}>
                      {city.name.replace(/\s*\([^)]+\)/, '')}
                    </option>
                  ))
                }
              </select>
            </div>
          </div>

          <div className="bg-white/40 p-4 rounded-2xl border border-white/60 shadow-sm">
            <label className="text-xs font-bold text-lux-muted uppercase tracking-wider mb-2 block flex items-center gap-2">
              <Navigation className="w-4 h-4 text-blue-500" />
              Travel Mode
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { id: 'compare all', icon: Sparkles, label: 'All' },
                { id: 'flight', icon: Plane, label: 'Flight' },
                { id: 'train', icon: Train, label: 'Train' },
                { id: 'bus', icon: Bus, label: 'Bus' },
                { id: 'car', icon: Car, label: 'Car' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setMode(item.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 border ${
                    mode === item.id 
                      ? 'bg-lux-navy border-lux-navy text-white shadow-md scale-105' 
                      : 'bg-white border-gray-200 text-lux-muted hover:border-lux-orange hover:text-lux-orange shadow-sm'
                  }`}
                  title={item.label}
                >
                  <item.icon className={`w-5 h-5 mb-1 ${mode === item.id ? 'text-lux-orange' : ''}`} />
                  <span className="text-[10px] font-semibold">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* AI Algorithm Selection */}
          <div className="bg-white/40 p-4 rounded-2xl border border-white/60 shadow-sm">
            <label className="text-xs font-bold text-lux-muted uppercase tracking-wider mb-2 block flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-purple-500" />
              AI Algorithm
            </label>
            <div className="relative">
              <select 
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
                className="w-full bg-white border border-gray-200 text-lux-navy font-semibold rounded-xl p-3 pl-4 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all cursor-pointer shadow-sm appearance-none"
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
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
            </div>
          </div>
          
          <button 
            onClick={() => setIsPlannerOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-2xl shadow-[0_10px_30px_rgba(124,58,237,0.4)] transition-all hover:-translate-y-1"
          >
            <Sparkles className="w-5 h-5 text-yellow-300" />
            AI Itinerary Generator
          </button>

          {/* Adding padding at the bottom of the scrolling area so content isn't hidden by the floating button */}
          <div className="h-24"></div>
        </div>

        {/* Floating Generate Route Button */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none flex justify-center pb-8">
          <button 
            onClick={computeRoute}
            disabled={isCalculating || !origin || !destination}
            className="lux-button w-full flex items-center justify-center gap-2 pointer-events-auto shadow-[0_10px_30px_rgba(224,122,95,0.4)] hover:-translate-y-1"
          >
            {isCalculating ? (
              <span className="flex items-center gap-2"><Zap className="w-5 h-5 animate-spin" /> Calculating...</span>
            ) : (
              <span>Generate Route</span>
            )}
          </button>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 h-full relative">
        <div className="absolute top-6 right-6 z-[400] flex flex-col gap-4 pointer-events-auto">
          <button 
            onClick={() => setIsPlannerOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-full shadow-[0_10px_40px_rgba(124,58,237,0.4)] transition-all hover:-translate-y-1"
          >
            <Sparkles className="w-5 h-5 text-yellow-300" />
            AI Itinerary Generator
          </button>
        </div>
        <MapContainer 
          center={[22.9074, 79.5815]} 
          zoom={5} 
          className="w-full h-full z-0"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; CARTO'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
                    {/* Single Mode Drawing */}
              {activeRoute && !comparedRoutes && activeRoute.coords.length > 0 && (
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

              {/* Compare All Drawing */}
              {comparedRoutes && (
                <>
                  {comparedRoutes.allRoutes.map((routeObj, idx) => {
                    const isHighlighted = activeRoute === routeObj.data;
                    const colors = { flight: '#3b82f6', train: '#ef4444', bus: '#10b981', car: '#f97316' };
                    const color = colors[routeObj.mode] || '#f97316';
                    
                    return routeObj.data.coords && routeObj.data.coords.length > 0 ? (
                      <Polyline 
                        key={idx}
                        positions={routeObj.data.coords} 
                        color={color} 
                        weight={isHighlighted ? 6 : 3} 
                        opacity={isHighlighted ? 1 : 0.35}
                      />
                    ) : null;
                  })}
                  
                  {/* Draw unique markers for all cities visited across all routes */}
                  {[...new Set(comparedRoutes.allRoutes.flatMap(r => r.data.path))].map((id, idx) => (
                    <Marker key={`comp-${idx}`} position={[nodes[id].lat, nodes[id].lng]} icon={customLuxIcon}>
                      <Popup className="lux-popup">
                        <div className="p-1">
                          <h4 className="font-serif font-bold text-lux-navy">{nodes[id].name}</h4>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                  {activeRoute && activeRoute.coords.length > 0 && <MapUpdater center={activeRoute.coords[0]} />}
                </>
              )}
        </MapContainer>

        <AnimatePresence>
          {activeRoute && !comparedRoutes && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="absolute bottom-8 left-8 right-8 md:left-auto md:right-8 bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-2xl z-[1000] w-auto md:w-80 border border-gray-100"
            >
              <h4 className="font-serif font-bold text-lux-navy mb-4 flex items-center gap-2 text-xl">
                <MapPin className="text-lux-orange w-6 h-6" /> 
                Itinerary Summary
              </h4>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <span className="text-lux-muted flex items-center gap-2"><Clock className="w-5 h-5 text-gray-400" /> Total Time</span>
                  <span className="font-semibold text-lux-navy text-lg">{Math.floor(activeRoute.totalTime / 60)}h {activeRoute.totalTime % 60}m</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <span className="text-lux-muted flex items-center gap-2"><DollarSign className="w-5 h-5 text-gray-400" /> Est. Cost</span>
                  <span className="font-semibold text-lux-navy text-lg">₹{activeRoute.totalCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lux-muted flex items-center gap-2"><Leaf className="w-5 h-5 text-green-500" /> Scenic Score</span>
                  <span className="font-bold text-lux-orange text-lg">{activeRoute.totalScenic} Points</span>
                </div>
              </div>
            </motion.div>
          )}

          {comparedRoutes && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="absolute bottom-8 left-8 right-8 md:left-auto md:right-8 bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-2xl z-[1000] w-auto md:w-96 border border-gray-100"
            >
              <h4 className="font-serif font-bold text-lux-navy mb-4 flex items-center gap-2 text-xl">
                <Sparkles className="text-lux-gold w-6 h-6" /> 
                AI Comparison Results
              </h4>

              {/* Color Legend */}
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4 text-xs font-semibold text-lux-navy">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-500"></div>Flight</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500"></div>Train</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-500"></div>Bus</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-orange-500"></div>Car</div>
              </div>
              
              <div className="space-y-3">
                {/* Cheapest Route Card */}
                <div 
                  onClick={() => setActiveRoute(comparedRoutes.cheapest.data)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${activeRoute === comparedRoutes.cheapest.data ? 'border-lux-orange bg-orange-50' : 'border-gray-100 hover:border-orange-200 bg-white'}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-green-600 bg-green-100 px-2 py-1 rounded-md">💰 Cheapest Option</span>
                    <span className="text-lux-muted text-sm capitalize">{comparedRoutes.cheapest.mode}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="font-bold text-lux-navy text-2xl">₹{comparedRoutes.cheapest.data.totalCost.toLocaleString()}</span>
                    <span className="text-lux-muted text-sm">{Math.floor(comparedRoutes.cheapest.data.totalTime / 60)}h {comparedRoutes.cheapest.data.totalTime % 60}m</span>
                  </div>
                </div>

                {/* Fastest Route Card */}
                <div 
                  onClick={() => setActiveRoute(comparedRoutes.fastest.data)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${activeRoute === comparedRoutes.fastest.data ? 'border-lux-navy bg-blue-50' : 'border-gray-100 hover:border-blue-200 bg-white'}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-100 px-2 py-1 rounded-md">⚡ Fastest Option</span>
                    <span className="text-lux-muted text-sm capitalize">{comparedRoutes.fastest.mode}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="font-bold text-lux-navy text-2xl">{Math.floor(comparedRoutes.fastest.data.totalTime / 60)}h {comparedRoutes.fastest.data.totalTime % 60}m</span>
                    <span className="text-lux-muted text-sm">₹{comparedRoutes.fastest.data.totalCost.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
    
    <AnimatePresence>
      {isPlannerOpen && (
        <SmartPlanner onClose={() => setIsPlannerOpen(false)} />
      )}
    </AnimatePresence>
    </>
  );
}
