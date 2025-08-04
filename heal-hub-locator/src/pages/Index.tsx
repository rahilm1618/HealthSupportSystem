
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import { Hospital} from '@/types';
import HospitalCard from "@/components/HospitalCard";
import DoctorCard from "@/components/DoctorCard";
import { Button } from "@/components/ui/button";
import {doctors } from "@/data/mockData";
import { Link } from "react-router-dom";
import { MapPin, UserRound, Activity, ChevronRight } from "lucide-react";
import { useState,useEffect } from "react";
import { useToast } from '@/hooks/use-toast';
import { getHospitals } from '@/services/api';

const Index = () => {
  // Get featured hospitals and doctors
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

   useEffect(() => {
    const fetchHospitals = async () => {
      try {
        setIsLoading(true);
        const data = await getHospitals();
        setHospitals(data);
        setHospitals(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching hospitals:', error);
        toast({
          title: "Using offline data",
          description: "Could not connect to server. Showing locally stored hospital data.",
          variant: "default",
        });
        setIsLoading(false);
      }
    };
    fetchHospitals(); // Fetch all hospitals initially
    }, []);
  const featuredHospitals = hospitals.slice(0, 3);
  console.log('Featured Hospitals:', featuredHospitals);
  const featuredDoctors = doctors.slice(0, 4);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-16">
        {/* Hero Section */}
        <Hero />
        
        {/* Featured Hospitals */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-health-primary" />
                Featured Hospitals
              </h2>
              <Button variant="link" className="text-health-primary" asChild>
                <Link to="/hospitals">
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredHospitals.map((hospital) => (
                <HospitalCard key={hospital.id} hospital={hospital} />
              ))}
            </div>
          </div>
        </section>
        
        {/* Featured Doctors */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <UserRound className="h-5 w-5 mr-2 text-health-primary" />
                Top Doctors
              </h2>
              <Button variant="link" className="text-health-primary" asChild>
                <Link to="/doctors">
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featuredDoctors.slice(0, 2).map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          </div>
        </section>
        
        {/* Symptom Tracker CTA */}
        <section className="py-12 bg-health-light bg-opacity-30">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between bg-white rounded-lg shadow-sm p-6 md:p-8">
              <div className="md:w-2/3 mb-6 md:mb-0">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-3">
                  <Activity className="h-5 w-5 mr-2 text-health-primary" />
                  Check Your Symptoms
                </h2>
                <p className="text-gray-600 max-w-2xl">
                  Not sure what's wrong? Use our symptom tracker to get insights about your health condition
                  and find the right specialists for your needs.
                </p>
              </div>
              <div>
                <Button className="bg-health-primary hover:bg-health-secondary" size="lg" asChild>
                  <Link to="/symptom-tracker">
                    Start Symptom Check
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Footer */}
        <footer className="bg-gray-800 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-health-emergency" />
                  HealHub
                </h3>
                <p className="text-gray-300">
                  Connecting patients with the best healthcare providers and services.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li><Link to="/" className="text-gray-300 hover:text-white">Home</Link></li>
                  <li><Link to="/hospitals" className="text-gray-300 hover:text-white">Hospitals</Link></li>
                  <li><Link to="/doctors" className="text-gray-300 hover:text-white">Find Doctors</Link></li>
                  <li><Link to="/symptom-tracker" className="text-gray-300 hover:text-white">Symptom Tracker</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Contact</h3>
                <p className="text-gray-300 mb-2">Email: contact@healhub.com</p>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
              <p>&copy; {new Date().getFullYear()} HealHub. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
