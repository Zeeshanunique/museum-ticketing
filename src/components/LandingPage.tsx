'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowRight, MapPin, Clock, Ticket, Info, Search, Mail } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllMuseums, Museum } from "@/lib/museums";
import Image from 'next/image';
import { ChatPopup } from "@/components/chat/chat-popup";

const features = [
  {
    title: "Smart Ticket Booking",
    description: "Seamless online booking for all museums with instant confirmation.",
    icon: <Ticket className="h-8 w-8 text-primary" />,
  },
  {
    title: "Multilingual Chatbot",
    description: "Get answers to your questions in your preferred language anytime.",
    icon: <Info className="h-8 w-8 text-primary" />,
  },
  {
    title: "Easy Museum Search",
    description: "Find museums by location, exhibitions, or collections with ease.",
    icon: <Search className="h-8 w-8 text-primary" />,
  },
  {
    title: "Event Notifications",
    description: "Stay updated with latest exhibitions and events at your favorite museums.",
    icon: <Mail className="h-8 w-8 text-primary" />,
  },
];

export function LandingPage({ onExploreClick }: { onExploreClick: () => void }) {
  const [museums, setMuseums] = useState<Museum[]>([]);
  const [activeMuseumIndex, setActiveMuseumIndex] = useState(0);

  useEffect(() => {
    setMuseums(getAllMuseums());
    
    // Auto-rotate featured museums
    const interval = setInterval(() => {
      setActiveMuseumIndex(prev => (prev + 1) % getAllMuseums().length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Chat Popup */}
      <ChatPopup />
      
      {/* Hero Section */}
      <section className="relative h-[92vh] flex flex-col items-center justify-center text-center px-4">
        <div className="absolute inset-0 z-0 bg-blue-900/5" />
        <div className="relative z-10 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-4">
              Discover India's Cultural Heritage
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Explore magnificent museums and book tickets effortlessly with our intelligent ticketing system.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={onExploreClick} className="text-lg px-8 py-6">
                Explore Museums <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10"
        >
          <ArrowDown className="h-8 w-8 text-gray-500 animate-bounce" />
        </motion.div>
      </section>

      {/* Featured Museums Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Museums</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our collection of prestigious museums from across India, each offering unique glimpses into our rich cultural heritage.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {museums.slice(0, 3).map((museum, index) => (
              <motion.div
                key={museum.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 * index, duration: 0.5 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden">
                  <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                    {/* Placeholder for museum image - in production, use real images */}
                    <div className="absolute inset-0 flex items-center justify-center text-white text-xl font-bold">
                      {museum.name}
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle>{museum.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> {museum.location.city}, {museum.location.state}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-3 text-gray-600">{museum.description}</p>
                    <div className="mt-3 flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="h-4 w-4" /> {museum.timings.opening} - {museum.timings.closing}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={onExploreClick}>
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button size="lg" onClick={onExploreClick} className="px-8">
              View All Museums <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Our Platform</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our ticketing system offers a seamless experience with features designed to enhance your museum visit.
            </p>
          </div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="h-full hover:bg-gray-50 transition-colors">
                  <CardHeader>
                    <div className="mb-2">{feature.icon}</div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Explore?</h2>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Start your cultural journey today. Book tickets, discover museums, and learn about India's rich heritage.
          </p>
          <Button 
            size="lg" 
            onClick={onExploreClick} 
            className="bg-white text-blue-700 hover:bg-blue-50 text-lg px-8 py-6"
          >
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-white">Ministry of Culture</h3>
            <p className="mb-4">Museum Ticketing System</p>
            <p className="text-sm"> 2023 Government of India</p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Museums</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Events</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-white">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Accessibility</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-white">Connect</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Feedback</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Newsletter</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Social Media</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
