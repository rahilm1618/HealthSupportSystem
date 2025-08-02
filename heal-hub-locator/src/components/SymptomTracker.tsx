
import { useState, useEffect } from 'react';
import { Activity, Search, ChevronRight } from 'lucide-react';
import { Symptom, Disease, Doctor, MLPrediction } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import DoctorCard from './DoctorCard';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

const SymptomTracker = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [matchedDiseases, setMatchedDiseases] = useState<MLPrediction[]>([]);
  const [recommendedDoctors, setRecommendedDoctors] = useState<Doctor[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch symptoms on component mount
  useEffect(() => {
    const fetchSymptoms = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/symptoms`
        );
        setSymptoms(response.data);
      } catch (error) {
        console.error("Error fetching symptoms:", error);
        toast({
          title: "Error loading symptoms",
          description: "Could not load symptoms. Using default data instead.",
          variant: "destructive",
        });
        // Fallback to mock data in case of error
        setSymptoms([
          { id: "1", name: "Fever", description: "Elevated body temperature" },
          { id: "2", name: "Cough", description: "A sudden expulsion of air from the lungs" },
          { id: "3", name: "Headache", description: "Pain in the head or upper neck" },
          { id: "4", name: "Fatigue", description: "Extreme tiredness resulting from mental or physical exertion" },
          { id: "5", name: "Shortness of breath", description: "Difficulty breathing or catching your breath" },
          { id: "6", name: "Chest pain", description: "Pain or discomfort in the chest area" },
          { id: "7", name: "Nausea", description: "Feeling of sickness with an inclination to vomit" },
          { id: "8", name: "Abdominal pain", description: "Pain felt in the abdomen" },
          { id: "9", name: "Diarrhea", description: "Loose, watery bowel movements" },
          { id: "10", name: "Rash", description: "A temporary eruption on the skin" }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchSymptoms();
  }, [toast]);

  // Filter symptoms based on search query
  const filteredSymptoms = symptoms.filter(symptom =>
    symptom.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSymptomToggle = (symptomId: string) => {
    setSelectedSymptoms(prev => {
      if (prev.includes(symptomId)) {
        return prev.filter(id => id !== symptomId);
      } else {
        return [...prev, symptomId];
      }
    });
  };

  const handleAnalyzeSymptoms = async () => {
    if (selectedSymptoms.length === 0) {
      toast({
        title: "Select symptoms",
        description: "Please select at least one symptom to analyze",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisComplete(false);
    setMatchedDiseases([]);
    setRecommendedDoctors([]);

    try {
      // Call the ML prediction API
      const predictionResponse = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/symptoms/predict`,
        { symptoms: selectedSymptoms }
      );
      
      const predictions = predictionResponse.data;
      setMatchedDiseases(predictions);
      
      // Get recommended specialties from top matched diseases
      const specialties = predictions.length > 0 
        ? predictions[0].recommendedSpecialties 
        : [];
      
      if (specialties.length > 0) {
        // Find doctors that match these specialties
        const doctorsResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/doctors`,
          { params: { speciality: specialties.join(',') } }
        );
        
        // Limit to 4 doctors
        setRecommendedDoctors(doctorsResponse.data.slice(0, 4));
      }
      
      setAnalysisComplete(true);
    } catch (error) {
      console.error("Error analyzing symptoms:", error);
      toast({
        title: "Error",
        description: "Failed to analyze symptoms. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSelectedSymptomNames = () => {
    return selectedSymptoms.map(id => {
      const symptom = symptoms.find(s => s.id === id);
      return symptom ? symptom.name : '';
    }).filter(Boolean);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <Activity className="mr-2 h-5 w-5 text-health-primary" />
                  Symptom Tracker
                </h2>
                <p className="text-gray-600 text-sm">
                  Select the symptoms you're experiencing to get potential health insights.
                </p>
                
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search symptoms..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {loading ? (
                  <div className="h-[400px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-health-primary"></div>
                  </div>
                ) : (
                  <div className="h-[400px] overflow-y-auto pr-2 space-y-2 mt-2">
                    {filteredSymptoms.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">No symptoms found</p>
                    ) : (
                      filteredSymptoms.map((symptom) => (
                        <div key={symptom.id} className="flex items-start space-x-2 py-2 border-b border-gray-100">
                          <Checkbox
                            id={`symptom-${symptom.id}`}
                            checked={selectedSymptoms.includes(symptom.id)}
                            onCheckedChange={() => handleSymptomToggle(symptom.id)}
                          />
                          <div className="space-y-1">
                            <Label
                              htmlFor={`symptom-${symptom.id}`}
                              className="font-medium cursor-pointer"
                            >
                              {symptom.name}
                            </Label>
                            <p className="text-sm text-gray-500">{symptom.description}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
                
                <Button 
                  className="w-full bg-health-primary hover:bg-health-secondary"
                  onClick={handleAnalyzeSymptoms}
                  disabled={selectedSymptoms.length === 0 || isAnalyzing || loading}
                >
                  {isAnalyzing ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>Analyze Symptoms</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          {!analysisComplete && !isAnalyzing && (
            <div className="h-full flex items-center justify-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <div className="text-center space-y-3">
                <Activity className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-600">Symptom Analysis</h3>
                <p className="text-gray-500 max-w-md">
                  Select symptoms from the list and click "Analyze Symptoms" to get health insights.
                </p>
              </div>
            </div>
          )}

          {isAnalyzing && (
            <div className="h-full flex items-center justify-center p-8 bg-gray-50 rounded-lg">
              <div className="text-center space-y-4">
                <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-health-light border-t-health-primary"></div>
                <h3 className="text-lg font-medium text-gray-700">Analyzing Your Symptoms</h3>
                <p className="text-gray-500">
                  Our system is processing information about:{" "}
                  <span className="font-medium">{getSelectedSymptomNames().join(", ")}</span>
                </p>
              </div>
            </div>
          )}

          {analysisComplete && (
            <div className="space-y-6">
              <div className="bg-health-light bg-opacity-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Analysis Results</h3>
                <p className="text-gray-600 mb-2">Based on your symptoms:</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {getSelectedSymptomNames().map((name, index) => (
                    <Badge key={index} className="bg-health-primary text-white">
                      {name}
                    </Badge>
                  ))}
                </div>
              </div>

              {matchedDiseases.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-800">Potential Conditions</h3>
                  <p className="text-sm text-gray-500 italic">
                    Note: This is not a diagnosis. Please consult with a healthcare professional.
                  </p>
                  
                  <div className="space-y-3">
                    {matchedDiseases.map((prediction, index) => (
                      <Card key={index} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-health-primary">{prediction.disease}</h4>
                              <p className="text-sm text-gray-600 mt-1">{prediction.description}</p>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline" className="bg-health-light">
                                {Math.round(prediction.probability * 100)}% match
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-600">
                    No specific conditions matched your symptoms. Consider adding more details or consulting a doctor.
                  </p>
                </div>
              )}

              {recommendedDoctors.length > 0 && (
                <div className="space-y-4 mt-8">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-800">Recommended Specialists</h3>
                    <Button variant="link" className="text-health-primary" asChild>
                      <a href="/doctors">
                        View All <ChevronRight className="h-4 w-4 ml-1" />
                      </a>
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {recommendedDoctors.map((doctor) => (
                      <DoctorCard key={doctor.id} doctor={doctor} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SymptomTracker;
