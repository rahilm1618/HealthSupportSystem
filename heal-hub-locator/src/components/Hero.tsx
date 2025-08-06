
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Heart, Activity, Shield, Plus, Stethoscope, Cross } from 'lucide-react';
import Search from './Search';
import { Button } from '@/components/ui/button';

const Hero = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');

  const handleSearch = (query: string) => {
    navigate(`/hospitals?search=${encodeURIComponent(query)}`);
  };

  const handleLocationDetect = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        
        // In a real app, we would do reverse geocoding to get the address
        // For now, just navigate to hospitals
        navigate('/hospitals');
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Could not detect your location. Please try again or enter it manually.");
      }
    );
  };

  return (
    <div className="relative pt-16 pb-20 md:pt-20 md:pb-28 lg:pt-32 lg:pb-36 overflow-hidden">
      <div className="absolute inset-0">
        {/* Base background - very light blue */}
        <div className="absolute inset-0 bg-blue-50"></div>
        
        {/* Animated Medical Elements */}
        <div className="absolute inset-0">
          {/* Floating Medical Icons */}
          <div className="absolute top-20 left-16 animate-float-slow">
            <Heart className="w-8 h-8 text-red-600/80" />
          </div>
          <div className="absolute top-40 right-20 animate-float-delayed">
            <Stethoscope className="w-10 h-10 text-blue-700/90" />
          </div>
          <div className="absolute bottom-32 left-20 animate-float-slow">
            <Shield className="w-6 h-6 text-green-600/80" />
          </div>
          <div className="absolute bottom-48 right-32 animate-float-delayed">
            <Activity className="w-7 h-7 text-teal-600/90" />
          </div>
          <div className="absolute top-60 left-1/3 animate-float-slow">
            <Plus className="w-12 h-12 text-blue-600/70" />
          </div>
          
          {/* Medical Cross Patterns */}
          <div className="absolute inset-0">
            {/* Large crosses */}
            <div className="absolute top-24 left-1/4">
              <div className="relative w-8 h-8">
                <div className="absolute top-1/2 left-0 w-8 h-1.5 bg-blue-600/70 transform -translate-y-1/2 animate-cross-glow"></div>
                <div className="absolute top-0 left-1/2 w-1.5 h-8 bg-blue-600/70 transform -translate-x-1/2 animate-cross-glow-delayed"></div>
              </div>
            </div>
            <div className="absolute bottom-40 right-1/4">
              <div className="relative w-6 h-6">
                <div className="absolute top-1/2 left-0 w-6 h-1 bg-teal-600/80 transform -translate-y-1/2 animate-cross-glow"></div>
                <div className="absolute top-0 left-1/2 w-1 h-6 bg-teal-600/80 transform -translate-x-1/2 animate-cross-glow-delayed"></div>
              </div>
            </div>
            
            {/* Small medical dots pattern - darker */}
            <div className="absolute top-32 right-16 w-3 h-3 bg-blue-600/80 rounded-full animate-ping"></div>
            <div className="absolute top-44 right-24 w-2 h-2 bg-teal-600/90 rounded-full animate-ping animation-delay-1000"></div>
            <div className="absolute bottom-56 left-24 w-3 h-3 bg-green-600/80 rounded-full animate-ping animation-delay-2000"></div>
          </div>
          
          {/* DNA Helix Pattern - darker colors */}
          <div className="absolute bottom-20 right-10 animate-spin-slow">
            <div className="relative w-16 h-32">
              <div className="absolute top-0 left-1/2 w-1 h-32 bg-gradient-to-b from-blue-600/80 to-teal-600/80 transform -translate-x-1/2 animate-pulse"></div>
              <div className="absolute top-2 left-2 w-4 h-4 bg-blue-600/90 rounded-full"></div>
              <div className="absolute top-6 right-2 w-4 h-4 bg-teal-600/90 rounded-full"></div>
              <div className="absolute top-10 left-2 w-4 h-4 bg-blue-600/90 rounded-full"></div>
              <div className="absolute top-14 right-2 w-4 h-4 bg-teal-600/90 rounded-full"></div>
              <div className="absolute top-18 left-2 w-4 h-4 bg-blue-600/90 rounded-full"></div>
              <div className="absolute top-22 right-2 w-4 h-4 bg-teal-600/90 rounded-full"></div>
            </div>
          </div>
          
          {/* Floating Medicine Capsules - darker */}
          <div className="absolute top-52 left-12 animate-float-medicine">
            <div className="w-8 h-4 bg-gradient-to-r from-red-600/80 to-blue-600/80 rounded-full"></div>
          </div>
          <div className="absolute bottom-60 right-40 animate-float-medicine-delayed">
            <div className="w-6 h-3 bg-gradient-to-r from-green-600/80 to-teal-600/80 rounded-full"></div>
          </div>
        </div>
        
        {/* Light overlay for subtle contrast - much lighter */}
        <div className="absolute inset-0 bg-white/20 z-10"></div>
      </div>
      
      <div className="relative container mx-auto px-4 z-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Find the Best Healthcare Near You
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Locate hospitals, connect with doctors, and track symptoms - all in one place
          </p>
          
          <div className="max-w-lg mx-auto mb-6">
            <Search onSearch={handleSearch} />
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button 
              variant="outline" 
              className="flex items-center border-health-primary text-health-primary hover:bg-health-light transition-all duration-300"
              onClick={handleLocationDetect}
            >
              <MapPin className="mr-2 h-4 w-4" />
              Detect my location
            </Button>
            
            <Button
              variant="link"
              className="text-health-primary hover:text-health-secondary transition-colors"
              onClick={() => navigate('/symptom-tracker')}
            >
              Check your symptoms
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
