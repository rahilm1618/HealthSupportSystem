
import { MapPin, Phone, Star, Mail, Bed } from 'lucide-react';
import { Hospital } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface HospitalCardProps {
  hospital: Hospital;
}

const HospitalCard = ({ hospital }: HospitalCardProps) => {
  
  // Generate hospital type if not provided
  const hospitalType = hospital.type || "General Hospital";

  // Use hospital.image_url (Cloudinary) as primary image source, fallback to /no-image.png
  
  const imageSrc = hospital.image_url || hospital.image
  
  return (
    <Card className="h-full overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="relative h-44 overflow-hidden">
        <img 
          src={imageSrc}
          alt={hospital.name} 
          className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = "/no-image.png";
          }}
        />
        {hospital.emergency_services && (
          <Badge className="absolute top-2 right-2 bg-health-emergency hover:bg-red-600">
            Emergency Services
          </Badge>
        )}
      </div>
      
      <CardContent className="pt-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">{hospital.name}</h3>
          {hospital.rating !== undefined && (
            <div className="flex items-center text-amber-500">
              <Star className="fill-amber-500 h-4 w-4" />
              <span className="ml-1 text-sm font-medium">{hospital.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        
        <Badge className="mb-3">
          {hospitalType}
        </Badge>
        
        <div className="text-gray-600 text-sm space-y-2">
          <div className="flex items-start">
            <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{hospital.address}</span>
          </div>
          <div className="flex items-center">
            <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{hospital.phone}</span>
          </div>
          {hospital.email && (
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="line-clamp-1">{hospital.email}</span>
            </div>
          )}
          {hospital.beds_available !== undefined && hospital.beds_available > 0 && (
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>{hospital.beds_available} beds available</span>
            </div>
          )}
        </div>
        
        {hospital.facilities && hospital.facilities.length > 0 && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-1">
              {hospital.facilities.slice(0, 3).map((facility, index) => (
                <Badge key={index} className="bg-health-light text-health-primary hover:bg-blue-100">
                  {facility}
                </Badge>
              ))}
              {hospital.facilities.length > 3 && (
                <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-200">
                  +{hospital.facilities.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-0">
        <div className="w-full flex justify-between items-center">
          <Button asChild className="text-health-primary hover:text-health-secondary hover:bg-health-light">
            <Link to={`/hospitals/${hospital.id}`}>
              View Details
            </Link>
          </Button>
          
          <Button 
            type="button"
            className="text-health-primary border-health-primary hover:bg-health-light"
            onClick={() => {
              const url = hospital.latitude && hospital.longitude
                ? `https://maps.google.com/?q=${hospital.latitude},${hospital.longitude}`
                : `https://maps.google.com/?q=${encodeURIComponent(hospital.address)}`;
              window.open(url, '_blank');
            }}
          >
            Get Directions
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default HospitalCard;
