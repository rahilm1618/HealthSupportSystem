
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Search from '@/components/Search';
import DoctorCard from '@/components/DoctorCard';
import { Doctor } from '@/types';
import { UserRound } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getDoctors } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const Doctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');
  const [hospitalFilter, setHospitalFilter] = useState<string>('all');
  const [sortOption, setSortOption] = useState<string>('default');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const data = await getDoctors();
        setDoctors(data);
        setFilteredDoctors(data);
      } catch (error) {
        console.error('Error fetching doctors:', error);
        toast({
          title: "Could not load doctors",
          description: "Using offline data instead",
          variant: "default",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [toast]);

  // Extract unique specialties and hospitals for filters
  const specialties = ['all', ...new Set(doctors.map(doctor => doctor.speciality.toLowerCase()))];
  const hospitalMap = new Map<string, { id: string, name: string }>();
  
  doctors.forEach(doctor => {
    if (doctor.hospitalId) {
      // Find the associated hospital name - this is simplified as we don't have a direct way to get it
      const hospitalName = doctor.location || 'Unknown Hospital';
      hospitalMap.set(doctor.hospitalId, { id: doctor.hospitalId, name: hospitalName });
    }
  });
  
  const hospitalOptions = [{ id: 'all', name: 'All Hospitals' }, ...Array.from(hospitalMap.values())];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterDoctors(query, specialtyFilter, hospitalFilter, sortOption);
  };

  const handleSpecialtyChange = (value: string) => {
    setSpecialtyFilter(value);
    filterDoctors(searchQuery, value, hospitalFilter, sortOption);
  };

  const handleHospitalChange = (value: string) => {
    setHospitalFilter(value);
    filterDoctors(searchQuery, specialtyFilter, value, sortOption);
  };

  const handleSortChange = (value: string) => {
    setSortOption(value);
    filterDoctors(searchQuery, specialtyFilter, hospitalFilter, value);
  };

  const filterDoctors = (query: string, specialty: string, hospitalId: string, sort: string) => {
    let filtered = [...doctors];

    // Apply search filter
    if (query) {
      const searchLower = query.toLowerCase();
      filtered = filtered.filter(doctor => 
        doctor.name.toLowerCase().includes(searchLower) ||
        doctor.speciality.toLowerCase().includes(searchLower) ||
        doctor.location?.toLowerCase().includes(searchLower)
      );
    }

    // Apply specialty filter
    if (specialty !== 'all') {
      filtered = filtered.filter(doctor => 
        doctor.speciality.toLowerCase().includes(specialty.toLowerCase())
      );
    }

    // Apply hospital filter
    if (hospitalId !== 'all') {
      filtered = filtered.filter(doctor => doctor.hospitalId === hospitalId);
    }

    // Apply sorting
    switch (sort) {
      case 'rating-high':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'rating-low':
        filtered.sort((a, b) => a.rating - b.rating);
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        // Default sorting
        break;
    }
    
    setFilteredDoctors(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
              <UserRound className="mr-2 h-6 w-6 text-health-primary" />
              Find Doctors
            </h1>
            <p className="text-gray-600 max-w-3xl">
              Connect with specialists and healthcare professionals for your medical needs.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-col space-y-4">
              <Search 
                onSearch={handleSearch} 
                placeholder="Search by doctor name, specialty..." 
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Select value={specialtyFilter} onValueChange={handleSpecialtyChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map((specialty, index) => (
                      <SelectItem key={index} value={specialty}>
                        {specialty === 'all' ? 'All Specialties' : 
                         specialty.charAt(0).toUpperCase() + specialty.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={hospitalFilter} onValueChange={handleHospitalChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by hospital" />
                  </SelectTrigger>
                  <SelectContent>
                    {hospitalOptions.map((hospital, index) => (
                      <SelectItem key={index} value={hospital.id}>
                        {hospital.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={sortOption} onValueChange={handleSortChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="rating-high">Rating (High to Low)</SelectItem>
                    <SelectItem value="rating-low">Rating (Low to High)</SelectItem>
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <p className="text-gray-600">
              {loading 
                ? "Loading doctors..." 
                : `Showing ${filteredDoctors.length} doctors`
              }
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-health-primary"></div>
            </div>
          ) : filteredDoctors.length > 0 ? (
            <div className="space-y-6">
              {filteredDoctors.map((doctor) => (
                <DoctorCard 
                  key={doctor.id} 
                  doctor={doctor} 
                  hospitalName={
                    hospitalMap.get(doctor.hospitalId)?.name || doctor.location
                  } 
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <UserRound className="mx-auto h-12 w-12 text-gray-300 mb-2" />
              <h3 className="text-lg font-medium text-gray-800 mb-1">No doctors found</h3>
              <p className="text-gray-600">
                Try adjusting your search or filter criteria to find what you're looking for.
              </p>
            </div>
          )}
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

export default Doctors;
