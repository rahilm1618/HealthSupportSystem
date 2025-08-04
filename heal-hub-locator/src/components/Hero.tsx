
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
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
    <div className="relative pt-16 pb-20 md:pt-20 md:pb-28 lg:pt-32 lg:pb-36">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-health-light to-blue-50 opacity-70"></div>
        {/* Removed Unsplash background image for privacy and consistency */}
        <div className="absolute inset-0 bg-gray-200 bg-cover bg-center opacity-10"></div>
      </div>
      
      <div className="relative container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Find the Best Healthcare Near You
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Locate hospitals, connect with doctors, and track symptoms - all in one place
          </p>
          
          <div className="max-w-lg mx-auto mb-6">
            <Search onSearch={handleSearch} />
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button 
              variant="outline" 
              className="flex items-center border-health-primary text-health-primary hover:bg-health-light"
              onClick={handleLocationDetect}
            >
              <MapPin className="mr-2 h-4 w-4" />
              Detect my location
            </Button>
            
            <Button
              variant="link"
              className="text-health-primary hover:text-health-secondary"
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
