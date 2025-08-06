
import axios from 'axios';
import { 
  Hospital, 
  MongoHospital, 
  Doctor, 
  MongoDoctor,
  Symptom,
  MongoSymptom,
  Disease,
  MongoDisease, 
  MLPrediction
} from '@/types';
import { hospitals as mockHospitals, doctors as mockDoctors, symptoms as mockSymptoms } from '@/data/mockData';
import { 
  transformMongoHospital, 
  transformMongoDoctor, 
  transformMongoSymptom, 
  transformMongoDisease 
} from '@/utils/dataTransformers';

// Base API URL - in production, this would come from .env
const API_URL = 'http://localhost:5000/api';

// Create an axios instance with longer timeout
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout (increased for larger datasets)
});

// Hospital services
export const getHospitals = async (params?: { 
  search?: string; 
  type?: string; 
  sort?: string; 
}): Promise<Hospital[]> => {
  try {
    console.log('Fetching hospitals from API with params:', params);
    const response = await api.get('/hospitals', { params });
    console.log('Hospital API response status:', response.status);
    console.log('Hospital API response data length:', response.data?.length || 0);
    
    // Check if the data is empty or invalid
    if (!response.data || !Array.isArray(response.data)) {
      console.warn('API returned empty or invalid hospital data, falling back to mock data');
      return mockHospitals;
    }
    
    // Transform MongoDB data to frontend format if needed
    return response.data.map((hospital: any) => {
      if (hospital.id) {
        // Already in frontend format
        return hospital;
      } else {
        // MongoDB format needs transformation
        return transformMongoHospital(hospital as MongoHospital);
      }
    });
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    console.warn('Falling back to mock hospital data');
    return mockHospitals; // Fallback to mock data
  }
};

export const getHospitalById = async (id: string): Promise<Hospital> => {
  try {
    console.log(`Fetching hospital with id ${id} from API...`);
    const response = await api.get(`/hospitals/${id}`);
    console.log('Hospital by ID API response:', response.data);
    
    if (!response.data) {
      console.warn('API returned empty hospital data, falling back to mock data');
      throw new Error("Hospital not found");
    }
    
    // Check if the response is already in frontend format
    if (response.data.id) {
      return response.data;
    } else {
      return transformMongoHospital(response.data);
    }
  } catch (error) {
    console.error(`Error fetching hospital with id ${id}:`, error);
    
    // Fallback to mock data if API fails
    const mockHospital = mockHospitals.find(h => h.id === id);
    if (mockHospital) {
      return mockHospital;
    }
    
    throw error;
  }
};

export const getNearbyHospitals = async (latitude: number, longitude: number): Promise<Hospital[]> => {
  try {
    console.log(`Fetching nearby hospitals at coordinates (${latitude}, ${longitude}) from API...`);
    const response = await api.get(`/hospitals/nearby/${latitude}/${longitude}`);
    console.log('Nearby hospitals API response:', response.data);
    
    if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
      console.warn('API returned empty nearby hospitals data, falling back to mock data');
      throw new Error("No nearby hospitals found");
    }
    
    return response.data.map((hospital: any) => {
      if (hospital.id) {
        return hospital;
      } else {
        return transformMongoHospital(hospital as MongoHospital);
      }
    });
  } catch (error) {
    console.error('Error fetching nearby hospitals:', error);
    
    // Return emergency hospitals from mock data as fallback
    const emergencyHospitals = mockHospitals.filter(h => h.emergency_services);
    
    // If we have coordinates, sort by proximity (simplified calculation)
    if (latitude && longitude) {
      return emergencyHospitals.sort((a, b) => {
        const distA = Math.sqrt(
          Math.pow((a.latitude || 0) - latitude, 2) + 
          Math.pow((a.longitude || 0) - longitude, 2)
        );
        const distB = Math.sqrt(
          Math.pow((b.latitude || 0) - latitude, 2) + 
          Math.pow((b.longitude || 0) - longitude, 2)
        );
        return distA - distB;
      });
    }
    
    return emergencyHospitals;
  }
};

// Doctor services
export const getDoctors = async (params?: {
  search?: string;
  speciality?: string;
  hospitalId?: string;
  sort?: string;
}): Promise<Doctor[]> => {
  try {
    console.log('Fetching doctors from API with params:', params);
    const response = await api.get('/doctors', { params });
    console.log('Doctors API response status:', response.status);
    console.log('Doctors API response data length:', response.data?.length || 0);
    
    if (!response.data || !Array.isArray(response.data)) {
      console.warn('API returned empty doctors data, falling back to mock data');
      return mockDoctors;
    }
    
    return response.data.map((doctor: any) => {
      console.log('Raw doctor from getDoctors API:', doctor);
      if (doctor.id && doctor.rating !== undefined && doctor.rating > 0) {
        // Already in frontend format with valid rating
        return doctor;
      } else {
        // MongoDB format needs transformation, or has invalid rating
        return transformMongoDoctor(doctor as MongoDoctor);
      }
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    console.warn('Falling back to mock doctor data');
    return mockDoctors; // Fallback to mock data
  }
};

export const getDoctorsByHospital = async (hospitalId: string): Promise<Doctor[]> => {
  try {
    console.log(`Fetching doctors for hospital ${hospitalId} from API...`);
    const response = await api.get(`/doctors/hospital/${hospitalId}`);
    console.log('Doctors by hospital API response:', response.data);
    
    if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
      console.warn('API returned empty doctors by hospital data, falling back to mock data');
      return mockDoctors.filter(d => d.hospitalId === hospitalId);
    }
    
    return response.data.map((doctor: any) => {
      console.log('Raw doctor from API:', doctor);
      if (doctor.id && doctor.rating !== undefined && doctor.rating > 0) {
        // Already in frontend format with valid rating
        return doctor;
      } else {
        // MongoDB format needs transformation, or has invalid rating
        return transformMongoDoctor(doctor as MongoDoctor);
      }
    });
  } catch (error) {
    console.error(`Error fetching doctors for hospital ${hospitalId}:`, error);
    
    // Fallback to mock data
    return mockDoctors.filter(d => d.hospitalId === hospitalId);
  }
};

// Symptom services
export const getSymptoms = async (): Promise<Symptom[]> => {
  try {
    const response = await api.get('/symptoms');
    
    if (!response.data || !Array.isArray(response.data)) {
      console.warn('API returned empty symptoms data, falling back to mock data');
      return mockSymptoms;
    }
    
    return response.data.map((symptom: any) => {
      if (symptom.id) {
        return symptom;
      } else {
        return transformMongoSymptom(symptom as MongoSymptom);
      }
    });
  } catch (error) {
    console.error('Error fetching symptoms:', error);
    console.warn('Falling back to mock symptom data');
    return mockSymptoms;
  }
};

export const predictDisease = async (symptomIds: string[]): Promise<MLPrediction[]> => {
  try {
    const response = await api.post('/symptoms/predict', { symptoms: symptomIds });
    
    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Invalid response from prediction API');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error predicting disease:', error);
    throw error;
  }
};

export default api;
