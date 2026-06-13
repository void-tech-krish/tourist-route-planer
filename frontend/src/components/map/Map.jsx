import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, DollarSign, Leaf } from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const customGlowingIcon = new L.DivIcon({
  className: 'custom-glow-icon',
  html: `<div class="w-4 h-4 bg-neon-cyan rounded-full shadow-[0_0_15px_#00D4FF] border-2 border-white animate-pulse"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 6, {
        duration: 2,
        easeLinearity: 0.25
      });
    }
  }, [center, map]);
  return null;
}

export default function RouteMap({ routeCoords, markers, activeCard }) {
  const defaultCenter = [22.9074872, 79.5815751]; 

  return (
    <div className="w-full h-full relative">
      <MapContainer 
        center={defaultCenter} 
        zoom={5} 
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {routeCoords && routeCoords.length > 0 && (
          <>
            <Polyline 
              positions={routeCoords} 
              color="#00D4FF" 
              weight={4} 
              opacity={0.8}
              className="route-glow-line"
            />
            <Polyline 
              positions={routeCoords} 
              color="#7B61FF" 
              weight={10} 
              opacity={0.2} 
            />
          </>
        )}

        {markers && markers.map((marker, idx) => (
          <Marker 
            key={idx} 
            position={[marker.lat, marker.lng]} 
            icon={customGlowingIcon}
          >
            <Popup className="glass-popup">
              <div className="p-2">
                <h3 className="font-bold text-lg text-neon-cyan mb-1">{marker.name}</h3>
                <img src={`/images/taj_mahal.png`} alt={marker.name} className="w-full h-24 object-cover rounded-lg mb-2" />
                <p className="text-sm text-gray-300">Beautiful destination ready to be explored.</p>
              </div>
            </Popup>
          </Marker>
        ))}
        
        <MapUpdater center={routeCoords && routeCoords.length > 0 ? routeCoords[0] : null} />
      </MapContainer>

      <AnimatePresence>
        {activeCard && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-8 right-8 glass-panel p-6 z-10 w-80"
          >
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <MapPin className="text-neon-orange w-5 h-5" /> 
              Route Overview
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
                  <Clock className="w-3 h-3" /> Time
                </div>
                <div className="text-white font-bold">{activeCard.time || '12h 20m'}</div>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
                  <DollarSign className="w-3 h-3" /> Cost
                </div>
                <div className="text-white font-bold">₹{activeCard.cost || '4,500'}</div>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10 col-span-2">
                <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
                  <Leaf className="w-3 h-3 text-neon-green" /> Scenic Score
                </div>
                <div className="text-white font-bold text-lg">{activeCard.scenic || '92'} / 100</div>
                <div className="w-full bg-black/50 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-neon-green to-neon-cyan h-full w-[92%] rounded-full" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
