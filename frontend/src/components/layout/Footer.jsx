import React, { useState } from 'react';
import { MapPin, Mail, Phone, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [activeModal, setActiveModal] = useState(null);

  const handleSubscribe = () => {
    if (email.trim() !== '' && email.includes('@')) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    } else {
      alert("Please enter a valid email address.");
    }
  };

  return (
    <footer className="bg-lux-navy text-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <MapPin className="w-8 h-8 text-lux-orange" />
            <span className="text-2xl font-serif font-bold tracking-tight">Travelora</span>
          </div>
          <p className="text-gray-400 font-light leading-relaxed mb-6">
            The world's smartest AI-powered route planning engine. Travel smarter, cheaper, and faster in pure luxury.
          </p>
          <div className="space-y-2 text-gray-400 font-light">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-lux-orange" />
              <a href="mailto:contact@travelora.in" className="hover:text-white transition-colors">contact@travelora.in</a>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-lux-orange" />
              <a href="tel:+919876543210" className="hover:text-white transition-colors">+91 98765 43210</a>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-serif font-semibold mb-6">Company</h4>
          <ul className="space-y-4 text-gray-400 font-light">
            <li><button onClick={() => setActiveModal('About Us')} className="hover:text-white transition-colors">About Us</button></li>
            <li><button onClick={() => setActiveModal('Careers')} className="hover:text-white transition-colors">Careers</button></li>
            <li><button onClick={() => setActiveModal('Press')} className="hover:text-white transition-colors">Press</button></li>
            <li><button onClick={() => setActiveModal('Travel Blog')} className="hover:text-white transition-colors">Travel Blog</button></li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-serif font-semibold mb-6">Help Centre</h4>
          <ul className="space-y-4 text-gray-400 font-light">
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-lux-orange" />
              <a href="mailto:contact.travelora@gmail.com" className="hover:text-white transition-colors">contact.travelora@gmail.com</a>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-lux-orange" />
              <a href="tel:+919876543210" className="hover:text-white transition-colors">+91 98765 43210</a>
            </li>
            <li><button onClick={() => setActiveModal('Contact Us')} className="hover:text-white transition-colors">Contact Form</button></li>
            <li><button onClick={() => setActiveModal('System Status')} className="hover:text-white transition-colors">System Status</button></li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-serif font-semibold mb-6">Newsletter</h4>
          <p className="text-gray-400 font-light mb-4">Get exclusive travel deals and AI routing updates.</p>
          <div className="flex flex-col gap-3">
            {subscribed ? (
              <div className="bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg px-4 py-3 font-medium text-center">
                Subscribed successfully! 🎉
              </div>
            ) : (
              <>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address" 
                  className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white outline-none focus:border-lux-orange transition-colors"
                />
                <button 
                  onClick={handleSubscribe}
                  className="lux-button !rounded-lg !px-4 !py-3 w-full"
                >
                  <span>Subscribe</span>
                </button>
              </>
            )}
          </div>
        </div>

      </div>
      
      <div className="max-w-7xl mx-auto px-8 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-gray-500 text-sm">
        <p>&copy; 2026 Travelora Route Planner. Built for CFAI.</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <button onClick={() => setActiveModal('Privacy Policy')} className="hover:text-white transition-colors">Privacy Policy</button>
          <button onClick={() => setActiveModal('Terms of Service')} className="hover:text-white transition-colors">Terms of Service</button>
          <button onClick={() => setActiveModal('Cookie Policy')} className="hover:text-white transition-colors">Cookie Policy</button>
        </div>
      </div>

      {/* Dynamic Modal for Footer Links */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white text-lux-navy p-8 rounded-2xl shadow-2xl max-w-md w-full relative"
            >
              <button 
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-lux-orange transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="w-6 h-6 text-lux-orange" />
                <h3 className="text-2xl font-serif font-bold">Travelora {activeModal}</h3>
              </div>
              
              <div className="space-y-4 text-gray-600">
                {activeModal === 'Contact Us' ? (
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      alert("Thank you! Your message has been sent successfully.");
                      setActiveModal(null);
                    }}
                    className="flex flex-col gap-4 mt-2"
                  >
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-lux-navy">Your Name</label>
                      <input type="text" required className="w-full border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-lux-orange" placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-lux-navy">Email Address</label>
                      <input type="email" required className="w-full border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-lux-orange" placeholder="john@example.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-lux-navy">Message</label>
                      <textarea required rows="3" className="w-full border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-lux-orange resize-none" placeholder="How can we help you?"></textarea>
                    </div>
                    <button type="submit" className="lux-button mt-2 w-full !rounded-lg !px-4 !py-3">
                      <span>Send Message</span>
                    </button>
                  </form>
                ) : (
                  <>
                    <p>
                      Welcome to the official <strong>{activeModal}</strong> page for Travelora. 
                    </p>
                    <p>
                      This module is currently part of our upcoming Phase 2 rollout. Check back soon for the full launch of our dedicated {activeModal.toLowerCase()} portal!
                    </p>
                    <button 
                      onClick={() => setActiveModal(null)}
                      className="lux-button mt-8 w-full !rounded-lg !px-4 !py-3 !bg-gradient-to-r !from-lux-navy !to-[#2a3441] !shadow-none hover:!shadow-lg"
                    >
                      <span>Close Window</span>
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  );
}
