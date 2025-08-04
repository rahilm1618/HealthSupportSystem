// Hospital interfaces
export interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  beds_available: number;
  location: string;
  type?: string;
  rating?: number;
  image?: string;
  image_url?: string;
  latitude?: number;
  longitude?: number;
  facilities?: string[];
  emergency_services: boolean;
}

export interface Doctor {
  id: string;
  name: string;
  speciality: string;
  experience?: number;
  rating?: number;
  hospitalId: string;
  image?: string;
  availability?: string[];
  contact: string;
  location: string;
}

export interface Symptom {
  id: string;
  name: string;
  description: string;
}

export interface Disease {
  id: string;
  name: string;
  description: string;
  symptoms: string[];
  recommendedSpecialties: string[];
}

// MongoDB specific interfaces
export interface MongoHospital {
  _id: {
    $oid: string;
  } | string;
  name: string;
  beds_available?: number;
  email?: string;
  contact?: string;
  address?: string;
  location: string;
  emergency_services?: boolean;
  facilities?: string[];
  image?: string;
  image_url?: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
}

export interface MongoDoctor {
  _id: {
    $oid: string;
  } | string;
  name: string;
  speciality?: string;
  hospital_id?: {
    $oid: string;
  } | string;
  contact?: string;
  location?: string;
  doctor_rating?: number | {
    $numberDecimal: string;
  } | {
    $numberDouble: string;
  };
  image?: string;
}

export interface MongoSymptom {
  _id: {
    $oid: string;
  } | string;
  name: string;
  description: string;
}

export interface MongoDisease {
  _id: {
    $oid: string;
  } | string;
  name: string;
  description: string;
  symptoms: string[] | {
    $oid: string;
  }[];
  recommended_specialties: string[];
}

export interface MLPrediction {
  disease: string;
  probability: number;
  similarity?: number;
  recommendedSpecialties?: string[];
  advice?: string;
}
