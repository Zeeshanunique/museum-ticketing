'use client';

import { useState, useEffect, useRef } from 'react';
import anime from 'animejs/lib/anime.js';
import { ArrowDown, ArrowRight, MapPin, Clock, Ticket, Info, Search, Mail, Sparkles, Building, Camera, LogIn } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllMuseums, Museum } from "@/lib/museums";
import { ChatPopup } from "@/components/chat/chat-popup";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from 'next/navigation';

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

// Floating animation particles
const FloatingParticle = ({ delay = 0 }: { delay?: number }) => {
  const particleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (particleRef.current) {
      anime({
        targets: particleRef.current,
        translateY: [-20, 20, -20],
        translateX: [-10, 10, -10],
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.6, 0.3],
        duration: 4000,
        delay: delay,
        loop: true,
        easing: 'easeInOutSine'
      });
    }
  }, [delay]);

  return (
    <div
      ref={particleRef}
      className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-30"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
    />
  );
};

export function LandingPage({ onExploreClick }: { onExploreClick: () => void }) {
  const { user } = useAuth();
  const router = useRouter();
  const [museums, setMuseums] = useState<Museum[]>([]);
  const [, setActiveMuseumIndex] = useState(0);
  
  // Refs for anime.js animations
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  const featuredSectionRef = useRef<HTMLDivElement>(null);
  const featuresSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMuseums(getAllMuseums());
    
    // Auto-rotate featured museums
    const interval = setInterval(() => {
      setActiveMuseumIndex(prev => (prev + 1) % getAllMuseums().length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Hero section animations
    const tl = anime.timeline({
      easing: 'easeOutExpo',
      duration: 750
    });

    tl.add({
      targets: titleRef.current,
      translateY: [100, 0],
      opacity: [0, 1],
      scale: [0.8, 1],
    })
    .add({
      targets: subtitleRef.current,
      translateY: [50, 0],
      opacity: [0, 1],
      offset: 300
    })
    .add({
      targets: buttonsRef.current,
      translateY: [30, 0],
      opacity: [0, 1],
      scale: [0.9, 1],
      offset: 600
    })
    .add({
      targets: arrowRef.current,
      translateY: [0, -10, 0],
      opacity: [0, 1],
      scale: [0.5, 1],
      duration: 1000,
      offset: 900
    });

    // Continuous arrow animation
    anime({
      targets: arrowRef.current,
      translateY: [0, 10, 0],
      duration: 2000,
      loop: true,
      easing: 'easeInOutSine',
      delay: 2000
    });

    // Scroll-triggered animations for sections
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target === featuredSectionRef.current) {
            // Animate featured museums cards
            anime({
              targets: '.museum-card',
              translateY: [60, 0],
              opacity: [0, 1],
              scale: [0.8, 1],
              rotate: [5, 0],
              duration: 800,
              delay: anime.stagger(200),
              easing: 'easeOutBack'
            });
          } else if (entry.target === featuresSectionRef.current) {
            // Animate feature cards
            anime({
              targets: '.feature-card',
              translateY: [40, 0],
              opacity: [0, 1],
              scale: [0.9, 1],
              duration: 600,
              delay: anime.stagger(150),
              easing: 'easeOutExpo'
            });
          }
        }
      });
    }, { threshold: 0.2 });

    if (featuredSectionRef.current) observer.observe(featuredSectionRef.current);
    if (featuresSectionRef.current) observer.observe(featuresSectionRef.current);

    return () => observer.disconnect();
  }, []);

  const handleExploreClick = () => {
    // Add a smooth exit animation before navigating
    anime({
      targets: [titleRef.current, subtitleRef.current, buttonsRef.current],
      translateY: -50,
      opacity: 0,
      scale: 0.8,
      duration: 400,
      easing: 'easeInBack',
      complete: onExploreClick
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <FloatingParticle key={i} delay={i * 200} />
        ))}
      </div>

      {/* Chat Popup */}
      <ChatPopup />
      
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative h-[92vh] flex flex-col items-center justify-center text-center px-4"
      >
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-900/5 via-purple-900/5 to-indigo-900/10" />
        
        {/* Animated geometric shapes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-20 w-32 h-32 bg-blue-200/20 rounded-full blur-xl animate-pulse" />
          <div className="absolute top-40 right-32 w-24 h-24 bg-purple-200/20 rounded-full blur-lg animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-40 left-40 w-28 h-28 bg-indigo-200/20 rounded-full blur-lg animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="mb-6 flex justify-center">
            <div className="flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200/50 shadow-sm">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Discover Heritage</span>
              <Building className="h-5 w-5 text-blue-600" />
            </div>
          </div>

          <h1 
            ref={titleRef}
            className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-6 opacity-0"
          >
            Discover India&apos;s Cultural Heritage
          </h1>
          
          <p 
            ref={subtitleRef}
            className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto opacity-0 font-medium"
          >
            {user 
              ? "Explore magnificent museums and book tickets effortlessly with our intelligent ticketing system."
              : "Join our platform to explore magnificent museums and book tickets effortlessly with our intelligent ticketing system."
            }
          </p>
          
          <div 
            ref={buttonsRef}
            className="flex flex-col sm:flex-row gap-4 justify-center opacity-0"
          >
            {user ? (
              // Show explore button for authenticated users
              <>
                <Button 
                  size="lg" 
                  onClick={handleExploreClick} 
                  className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Explore Museums <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg px-8 py-6 border-2 bg-white/70 backdrop-blur-sm hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Learn More <Camera className="ml-2 h-5 w-5" />
                </Button>
              </>
            ) : (
              // Show login/register buttons for non-authenticated users
              <>
                <Button 
                  size="lg" 
                  onClick={() => {
                    setTimeout(() => {
                      router.push('/login');
                    }, 0);
                  }} 
                  className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Login to Explore <LogIn className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => {
                    setTimeout(() => {
                      router.push('/register');
                    }, 0);
                  }}
                  className="text-lg px-8 py-6 border-2 bg-white/70 backdrop-blur-sm hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Register <Camera className="ml-2 h-5 w-5" />
                </Button>
              </>
            )}
          </div>
        </div>
        
        <div 
          ref={arrowRef}
          className="absolute bottom-10 opacity-0"
        >
          <ArrowDown className="h-8 w-8 text-gray-600" />
        </div>
      </section>

      {/* Featured Museums Section */}
      <section 
        ref={featuredSectionRef}
        className="py-20 px-4 bg-white relative overflow-hidden"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 right-10 w-40 h-40 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full opacity-50 blur-3xl" />
          <div className="absolute bottom-20 left-10 w-32 h-32 bg-gradient-to-r from-indigo-100 to-blue-100 rounded-full opacity-40 blur-2xl" />
        </div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-gray-800 to-blue-800 bg-clip-text text-transparent">
              Featured Museums
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Explore our collection of prestigious museums from across India, each offering unique glimpses into our rich cultural heritage.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {museums.slice(0, 3).map((museum, index) => (
              <div
                key={museum.id}
                className="museum-card opacity-0 transform"
              >
                <Card className="h-full hover:shadow-2xl transition-all duration-500 overflow-hidden group border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
                  <div className="h-48 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 relative overflow-hidden">
                    {/* Animated overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center text-white text-xl font-bold group-hover:scale-110 transition-transform duration-700">
                      {museum.name}
                    </div>
                    {/* Floating elements */}
                    <div className="absolute top-4 right-4 w-3 h-3 bg-white/30 rounded-full animate-pulse" />
                    <div className="absolute bottom-4 left-4 w-2 h-2 bg-white/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
                      {museum.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 text-gray-500">
                      <MapPin className="h-4 w-4 text-blue-500" /> {museum.location.city}, {museum.location.state}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <p className="line-clamp-3 text-gray-600 text-sm leading-relaxed">{museum.description}</p>
                    <div className="mt-3 flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="h-4 w-4 text-indigo-500" /> {museum.timings.opening} - {museum.timings.closing}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      className="w-full group-hover:bg-blue-50 group-hover:border-blue-300 group-hover:text-blue-700 transition-all duration-300 font-medium" 
                      onClick={handleExploreClick}
                    >
                      View Details <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button 
              size="lg" 
              onClick={handleExploreClick} 
              className="px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              View All Museums <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        ref={featuresSectionRef}
        className="py-20 px-4 bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50 relative"
      >
        {/* Animated background grid */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 25% 25%, #3b82f6 2px, transparent 2px)',
            backgroundSize: '50px 50px'
          }} />
        </div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-gray-800 to-blue-800 bg-clip-text text-transparent">
              Why Choose Our Platform
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Our ticketing system offers a seamless experience with features designed to enhance your museum visit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="feature-card opacity-0 transform">
                <Card className="h-full hover:shadow-xl transition-all duration-500 group border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:bg-white/90">
                  <CardHeader className="text-center">
                    <div className="mb-4 flex justify-center">
                      <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                        {feature.icon}
                      </div>
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-purple-300/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-indigo-300/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="max-w-5xl mx-auto text-center relative">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            Ready to Explore?
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto font-medium">
            Start your cultural journey today. Book tickets, discover museums, and learn about India&apos;s rich heritage.
          </p>
          <Button 
            size="lg" 
            onClick={handleExploreClick} 
            className="bg-white text-blue-700 hover:bg-blue-50 text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 font-semibold"
          >
            Get Started Now <Sparkles className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-900 to-black text-gray-300 py-12 px-4 relative overflow-hidden">
        {/* Subtle animated elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 right-10 w-24 h-24 bg-blue-500/10 rounded-full blur-xl animate-pulse" />
          <div className="absolute bottom-10 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '3s' }} />
        </div>
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-400" />
              Ministry of Culture
            </h3>
            <p className="mb-4 text-gray-400">Museum Ticketing System</p>
            <p className="text-sm text-gray-500">© 2023 Government of India</p>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-blue-400 transition-colors duration-200 text-sm">Home</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors duration-200 text-sm">Museums</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors duration-200 text-sm">Events</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors duration-200 text-sm">Support</a></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold mb-4 text-white">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-blue-400 transition-colors duration-200 text-sm">FAQs</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors duration-200 text-sm">Terms &amp; Conditions</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors duration-200 text-sm">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors duration-200 text-sm">Accessibility</a></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold mb-4 text-white">Connect</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-blue-400 transition-colors duration-200 text-sm">Contact Us</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors duration-200 text-sm">Feedback</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors duration-200 text-sm">Newsletter</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors duration-200 text-sm">Social Media</a></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom border with subtle animation */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              Crafted with <span className="text-red-400 animate-pulse">❤️</span> for preserving India&apos;s cultural heritage
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
