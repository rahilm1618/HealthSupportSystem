
import { useState } from 'react';
import { AlertCircle, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Hospital } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { getNearbyHospitals } from '@/services/api';

const EmergencyButton = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [nearbyHospitals, setNearbyHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmergency = () => {
    setIsDialogOpen(true);
    setIsLoading(true);
    
    // Get user's location and find nearby hospitals
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          const hospitals = await getNearbyHospitals(latitude, longitude);
          setNearbyHospitals(hospitals);
          setIsLoading(false);
          
          toast({
            title: "Location found",
            description: "We've found emergency facilities near you.",
            variant: "default",
          });
        } catch (error) {
          console.error("Error fetching nearby hospitals:", error);
          setIsLoading(false);
          toast({
            title: "Error",
            description: "Failed to load nearby hospitals. Please try again.",
            variant: "destructive",
          });
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        setIsLoading(false);
        
        toast({
          title: "Location error",
          description: "We couldn't access your location. Please enable location services.",
          variant: "destructive",
        });
      }
    );
  };

  return (
    <>
      <Button 
        className="bg-health-emergency hover:bg-red-600 text-white font-bold animate-pulse-slow"
        onClick={handleEmergency}
      >
        <AlertCircle className="mr-2 h-4 w-4" />
        Emergency
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-health-emergency flex items-center">
              <AlertCircle className="mr-2 h-5 w-5" />
              Emergency Services Near You
            </DialogTitle>
            <DialogDescription>
              These hospitals provide emergency services in your area.
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[60vh] overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-health-emergency"></div>
              </div>
            ) : (
              <div className="space-y-4 mt-4">
                {nearbyHospitals.length > 0 ? (
                  nearbyHospitals.map((hospital) => (
                    <div key={hospital.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <h3 className="font-semibold text-lg">{hospital.name}</h3>
                      <p className="text-sm text-gray-500 flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {hospital.address}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-sm font-medium">{hospital.phone}</p>
                        {hospital.beds_available && (
                          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {hospital.beds_available} beds available
                          </span>
                        )}
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="bg-red-100 text-health-emergency text-xs px-2 py-1 rounded-full">
                          Emergency Services Available
                        </span>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-health-primary border-health-primary"
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
                    </div>
                  ))
                ) : (
                  <p className="text-center py-4">No emergency hospitals found in your area.</p>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EmergencyButton;
