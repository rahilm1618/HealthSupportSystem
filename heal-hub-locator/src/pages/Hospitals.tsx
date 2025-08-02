
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Search from '@/components/Search';
import HospitalCard from '@/components/HospitalCard';
import { Hospital } from '@/types';
import { Building2, Calendar, FileText } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getHospitals } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const Hospitals = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortOption, setSortOption] = useState<string>('default');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Extract search query from URL if present
    const params = new URLSearchParams(location.search);
    const queryParam = params.get('search');
    if (queryParam) {
      setSearchQuery(queryParam);
    }
    
    // Initial fetch of hospitals
    fetchHospitals(queryParam || '', 'all', 'default');
  }, [location.search]);

  const fetchHospitals = async (search: string, type: string, sort: string) => {
    try {
      setIsLoading(true);
      const data = await getHospitals({ search, type, sort });
      setHospitals(data);
      setFilteredHospitals(data);
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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    fetchHospitals(query, typeFilter, sortOption);
  };

  const handleTypeChange = (value: string) => {
    setTypeFilter(value);
    fetchHospitals(searchQuery, value, sortOption);
  };

  const handleSortChange = (value: string) => {
    setSortOption(value);
    fetchHospitals(searchQuery, typeFilter, value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
              <Building2 className="mr-2 h-6 w-6 text-health-primary" />
              Hospitals & Medical Facilities
            </h1>
            <p className="text-gray-600 max-w-3xl">
              Find the best hospitals and medical facilities for your healthcare needs.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between md:items-center space-y-4 md:space-y-0 md:space-x-4">
              <Search 
                onSearch={handleSearch} 
                placeholder="Search hospitals, facilities, address..." 
              />
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <Select value={typeFilter} onValueChange={handleTypeChange}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="emergency">Emergency Services</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={sortOption} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                    <SelectItem value="beds-high">Beds Available (High to Low)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <p className="text-gray-600">
              {isLoading ? 'Loading hospitals...' : `Showing ${filteredHospitals.length} results`}
            </p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-health-primary"></div>
            </div>
          ) : filteredHospitals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHospitals.map((hospital) => (
                <HospitalCard key={hospital.id} hospital={hospital} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <Building2 className="mx-auto h-12 w-12 text-gray-300 mb-2" />
              <h3 className="text-lg font-medium text-gray-800 mb-1">No hospitals found</h3>
              <p className="text-gray-600">
                Try adjusting your search or filter criteria to find what you're looking for.
              </p>
            </div>
          )}
          
          {/* Health Events and Campaigns Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Calendar className="mr-2 h-6 w-6 text-health-primary" />
              Health Events & Educational Resources
            </h2>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-semibold text-health-primary mb-4">Upcoming Health Events</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="bg-health-light text-health-primary text-sm font-medium rounded-full px-3 py-1 inline-block mb-2">Apr 15, 2025</div>
                  <h4 className="font-medium text-gray-800">Free Diabetes Screening Camp</h4>
                  <p className="text-sm text-gray-600 mb-2">Shalby Hospital, Vijay Nagar</p>
                  <p className="text-sm text-gray-500">Early detection and management of diabetes</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="bg-health-light text-health-primary text-sm font-medium rounded-full px-3 py-1 inline-block mb-2">Apr 20, 2025</div>
                  <h4 className="font-medium text-gray-800">Mental Health Awareness Workshop</h4>
                  <p className="text-sm text-gray-600 mb-2">Jabalpur Hospital And Research Center</p>
                  <p className="text-sm text-gray-500">Managing stress and anxiety in daily life</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="bg-health-light text-health-primary text-sm font-medium rounded-full px-3 py-1 inline-block mb-2">May 1, 2025</div>
                  <h4 className="font-medium text-gray-800">Blood Donation Drive</h4>
                  <p className="text-sm text-gray-600 mb-2">Metro Hospital, Napier Town</p>
                  <p className="text-sm text-gray-500">Give the gift of life - donate blood</p>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-health-primary mb-4 flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Health Education Resources
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                  <h4 className="font-medium text-gray-800 mb-2">Understanding COVID-19 Vaccination</h4>
                  <p className="text-sm text-gray-600 mb-3">Learn about the importance of vaccination and how it helps protect against severe COVID-19.</p>
                  <a href="#" className="text-sm font-medium text-health-primary hover:text-health-secondary">Read More →</a>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                  <h4 className="font-medium text-gray-800 mb-2">Heart Health: Prevention is Better Than Cure</h4>
                  <p className="text-sm text-gray-600 mb-3">Discover lifestyle changes and dietary habits to maintain a healthy heart.</p>
                  <a href="#" className="text-sm font-medium text-health-primary hover:text-health-secondary">Read More →</a>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                  <h4 className="font-medium text-gray-800 mb-2">Managing Diabetes: A Comprehensive Guide</h4>
                  <p className="text-sm text-gray-600 mb-3">Tips and strategies for controlling blood sugar levels and preventing complications.</p>
                  <a href="#" className="text-sm font-medium text-health-primary hover:text-health-secondary">Read More →</a>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                  <h4 className="font-medium text-gray-800 mb-2">Mental Wellness in Modern Times</h4>
                  <p className="text-sm text-gray-600 mb-3">Practical approaches to maintaining good mental health in a fast-paced world.</p>
                  <a href="#" className="text-sm font-medium text-health-primary hover:text-health-secondary">Read More →</a>
                </div>
              </div>
            </div>
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

export default Hospitals;
