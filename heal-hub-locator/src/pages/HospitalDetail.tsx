
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import DoctorCard from '@/components/DoctorCard';
import { Hospital, Doctor } from '@/types';
import { MapPin, Phone, Star, Info, User, ChevronLeft, AlertCircle, Building2, CheckCircle, Mail, Bed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getHospitalById, getDoctorsByHospital } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const HospitalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [hospital, setHospital] = useState<Hospital | undefined>(undefined);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const hospitalData = await getHospitalById(id);
        setHospital(hospitalData);
        
        if (hospitalData) {
          const hospitalDoctors = await getDoctorsByHospital(hospitalData.id);
          setDoctors(hospitalDoctors);
        }
      } catch (error) {
        console.error("Error fetching hospital data:", error);
        toast({
          title: "Error loading data",
          description: "Could not load hospital details. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, toast]);

  const handleBookAppointment = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please sign in to book an appointment",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }
    navigate("/book-appointment");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-24 container mx-auto px-4 text-center">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-health-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-24 container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Hospital not found</h1>
          <p className="text-gray-600 mb-6">
            The hospital you are looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/hospitals">View All Hospitals</Link>
          </Button>
        </main>
      </div>
    );
  }

  // Generate hospital type based on specialties if not available
  const hospitalType = hospital.type || (doctors.length > 0 
    ? `${[...new Set(doctors.map(d => d.speciality.split(' ')[0]))].slice(0, 2).join(' & ')} Hospital` 
    : "General Hospital");

  // Generate facilities based on doctor specialties if not available
  const facilities = hospital.facilities && hospital.facilities.length > 0 
    ? hospital.facilities 
    : [...new Set(doctors.map(d => d.speciality))].map(s => `${s} Department`);

  // Use default image if not provided
  const imageUrl = hospital.image_url

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20 pb-12">
        {/* Hospital Hero */}
        <div className="relative h-64 md:h-80 overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={imageUrl}
              alt={hospital.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="container mx-auto">
              <Button  
                className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 mb-4"
                asChild
              />
                <Link to="/hospitals">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back to Hospitals
                </Link>
              {/* No extra code needed here, just remove $SELECTION_PLACEHOLDER$ */}  
              <div className="flex justify-between items-start">
                <div>
                  <Badge className="mb-2 bg-health-primary">
                    {hospitalType}
                  </Badge>
                  <h1 className="text-3xl font-bold mb-2">{hospital.name}</h1>
                  <p className="flex items-center text-gray-200">
                    <MapPin className="h-4 w-4 mr-1" />
                    {hospital.address}
                  </p>
                </div>
                
                {hospital.rating && (
                  <div className="flex items-center bg-white/10 backdrop-blur-sm p-2 rounded-lg">
                    <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    <span className="ml-1 font-medium">{hospital.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="container mx-auto px-4 -mt-6 relative z-10">
          <div className="bg-white rounded-t-lg shadow-sm p-6">
            <Tabs defaultValue="overview" onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="overview" className="text-sm sm:text-base">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="doctors" className="text-sm sm:text-base">
                  Doctors ({doctors.length})
                </TabsTrigger>
                <TabsTrigger value="facilities" className="text-sm sm:text-base">
                  Facilities
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <div className="flex flex-col md:flex-row md:space-x-6">
                  <div className="md:w-2/3 space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                        <Info className="h-5 w-5 mr-2 text-health-primary" />
                        About {hospital.name}
                      </h2>
                      <p className="text-gray-600">
                        {hospital.name} is a {hospitalType.toLowerCase()} healthcare facility located in {hospital.address}. 
                        The hospital offers a range of medical services and has {hospital.beds_available} beds available.
                        {hospital.emergency_services && " It provides 24/7 emergency services."}
                      </p>
                    </div>
                    
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                        <User className="h-5 w-5 mr-2 text-health-primary" />
                        Key Doctors
                      </h2>
                      
                      {doctors.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {doctors.slice(0, 2).map((doctor) => (
                            <Card key={doctor.id} className="overflow-hidden">
                              <CardContent className="p-0">
                                <div className="flex items-center p-4">
                                  <div className="w-16 h-16 rounded-full overflow-hidden mr-4 flex-shrink-0">
                                    <img 
                                      src={doctor.image || `https://source.unsplash.com/random/300x300/?doctor&sig=${doctor.id}`}
                                      alt={doctor.name} 
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold">{doctor.name}</h4>
                                    <p className="text-sm text-gray-600">{doctor.speciality}</p>
                                    <div className="flex items-center mt-1">
                                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                      <span className="text-xs ml-1">{doctor.rating.toFixed(1)}</span>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-600">No doctors listed for this hospital.</p>
                      )}
                      
                      {doctors.length > 2 && (
                        <Button 
                          className="mt-2 text-health-primary p-0 bg-secondary hover:bg-secondary/80"
                          onClick={() => setActiveTab('doctors')}
                        >
                          View all {doctors.length} doctors
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="md:w-1/3 mt-6 md:mt-0">
                    <Card>
                      <CardContent className="p-4 space-y-4">
                        <h3 className="font-semibold text-gray-800">Contact Information</h3>
                        
                        <div className="space-y-2">
                          <div className="flex items-start">
                            <Phone className="h-4 w-4 mr-2 mt-1 text-health-primary" />
                            <div>
                              <p className="font-medium">{hospital.phone}</p>
                              <p className="text-xs text-gray-500">General Enquiry</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <MapPin className="h-4 w-4 mr-2 mt-1 text-health-primary" />
                            <div>
                              <p className="font-medium">{hospital.address}</p>
                              <p className="text-xs text-gray-500">Location</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <Mail className="h-4 w-4 mr-2 mt-1 text-health-primary" />
                            <div>
                              <p className="font-medium">{hospital.email}</p>
                              <p className="text-xs text-gray-500">Email</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <Bed className="h-4 w-4 mr-2 mt-1 text-health-primary" />
                            <div>
                              <p className="font-medium">{hospital.beds_available} beds</p>
                              <p className="text-xs text-gray-500">Currently Available</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="pt-2 space-y-2">
                          <Button
                            className="w-full bg-health-primary hover:bg-health-secondary"
                            onClick={() => {
                              const query = encodeURIComponent(hospital.address);
                              window.open(`https://maps.google.com/?q=${query}`, '_blank');
                            }}
                          >
                            Get Directions
                          </Button>
                          
                          <Button
                            className="w-full"
                            onClick={() => navigate(`/book-appointment?hospital=${hospital.id}`)}
                          >
                            Book Appointment
                          </Button>
                        </div>
                        
                        {hospital.emergency_services && (
                          <div className="flex items-center text-sm text-red-600">
                            <AlertCircle className="mr-1 h-4 w-4" />
                            Emergency Services Available
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="doctors" className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-health-primary" />
                  Doctors at {hospital.name}
                </h2>
                
                {doctors.length > 0 ? (
                  <div className="space-y-6">
                    {doctors.map((doctor) => (
                      <DoctorCard key={doctor.id} doctor={doctor} hospitalName={hospital.name} />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8">
                    No doctors are currently listed for this hospital.
                  </p>
                )}
              </TabsContent>
              
              <TabsContent value="facilities" className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-health-primary" />
                  Facilities & Services
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {facilities.map((facility, index) => (
                    <Card key={index}>
                      <CardContent className="p-4 flex items-center">
                        <div className="h-8 w-8 rounded-full bg-health-light flex items-center justify-center mr-3">
                          <CheckCircle className="h-4 w-4 text-health-primary" />
                        </div>
                        <span className="font-medium text-gray-700">{facility}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {hospital.emergency_services && (
                  <div className="mt-6">
                    <Card className="border-health-emergency">
                      <CardContent className="p-4 flex items-center">
                        <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                          <AlertCircle className="h-5 w-5 text-health-emergency" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-health-emergency">Emergency Services</h4>
                          <p className="text-sm text-gray-600">
                            24/7 emergency care services are available at this hospital.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      {/* Simple Footer */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} HealHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HospitalDetail;
