import React, { useState } from 'react';
import Navbar from './components/layout/Navbar';
import Hero from './components/layout/Hero';
import StorySections from './components/sections/StorySections';
import Destinations from './components/sections/Destinations';
import RouteComparison from './components/sections/RouteComparison';
import FeaturesGrid from './components/sections/FeaturesGrid';
import Testimonials from './components/sections/Testimonials';
import BayesianPredictorSection from './components/sections/BayesianPredictorSection';
import Footer from './components/layout/Footer';
import Chatbot from './components/layout/Chatbot';
import FullScreenMap from './components/pages/FullScreenMap';

export default function App() {
  const [currentView, setCurrentView] = useState('landing');

  if (currentView === 'map') {
    return <FullScreenMap onClose={() => setCurrentView('landing')} />;
  }

  return (
    <div className="min-h-screen bg-lux-bg font-sans selection:bg-lux-orange selection:text-white flex flex-col">
      <Navbar onOpenMap={() => setCurrentView('map')} />
      
      <main className="flex-1">
        <Hero onOpenMap={() => setCurrentView('map')} />
        <StorySections />
        <Destinations />
        <RouteComparison />
        <BayesianPredictorSection />
        <FeaturesGrid />
        <Testimonials />
      </main>

      <Footer />
      <Chatbot />
    </div>
  );
}
