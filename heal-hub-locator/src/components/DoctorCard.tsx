
import { Star, Building, Phone, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Doctor } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface DoctorCardProps {
  doctor: Doctor;
  hospitalName?: string;
}

const DoctorCard = ({ doctor, hospitalName }: DoctorCardProps) => {
  const navigate = useNavigate();
  // Using Unsplash for real doctor images
  const imageUrl = doctor.image ||
    `https://source.unsplash.com/featured/300x300/?doctor&sig=${doctor.id}`;

  return (
    <Card className="h-full overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/3 h-full">
          <div className="relative h-48 md:h-full overflow-hidden">
            <img
              src={imageUrl}
              alt={doctor.name}
              className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null; // Prevent infinite error loop
                target.src = `https://source.unsplash.com/featured/300x300/?physician&sig=${doctor.id}`;
              }}
            />
          </div>
        </div>
        <div className="md:w-2/3 flex flex-col h-full">
          <CardContent className="pt-4 flex-1">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg text-gray-900">{doctor.name}</h3>
              {doctor.rating !== undefined && (
                <div className="flex items-center text-amber-500">
                  <Star className="fill-amber-500 h-4 w-4" />
                  <span className="ml-1 text-sm font-medium">{doctor.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
            <Badge className="mb-3 bg-health-light text-health-primary">
              {doctor.speciality}
            </Badge>
            <div className="text-gray-600 text-sm space-y-2">
              {hospitalName && (
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>{hospitalName}</span>
                </div>
              )}
              {doctor.experience && (
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>{doctor.experience} years experience</span>
                </div>
              )}
              {doctor.contact && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>{doctor.contact}</span>
                </div>
              )}
              {doctor.location && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>{doctor.location}</span>
                </div>
              )}
            </div>
            {doctor.availability && doctor.availability.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-gray-500 mb-1">Available on:</p>
                <div className="flex flex-wrap gap-1">
                  {doctor.availability.map((day, index) => (
                    <Badge key={index} className="bg-gray-100 text-gray-600 hover:bg-gray-200">
                      {day}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-2">
            <div className="w-full">
              <Button className="w-full bg-health-primary hover:bg-health-secondary" onClick={() => navigate(`/book-appointment?doctor=${doctor.id}`)}>
                Book Appointment
              </Button>
            </div>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
};

export default DoctorCard;
