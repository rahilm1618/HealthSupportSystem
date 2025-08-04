
import Header from '@/components/Header';
import SymptomTrackerComp from '../components/SymptomTrackerComp';
import { Activity } from 'lucide-react';

const SymptomTrackerPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
              <Activity className="mr-2 h-6 w-6 text-health-primary" />
              Symptom Tracker
            </h1>
            <p className="text-gray-600 max-w-3xl">
              Understand your symptoms and find the right healthcare providers for your needs.
            </p>
          </div>
          
          <SymptomTrackerComp />
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

export default SymptomTrackerPage;
