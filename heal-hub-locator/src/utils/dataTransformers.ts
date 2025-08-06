
import { 
  Hospital, 
  MongoHospital, 
  Doctor, 
  MongoDoctor, 
  Symptom, 
  MongoSymptom, 
  Disease, 
  MongoDisease 
} from '@/types';

// Helper function to transform MongoDB hospital to frontend Hospital format
export const transformMongoHospital = (mongoHospital: MongoHospital): Hospital => {
  // Handle the _id field which could be in different formats
  const id = typeof mongoHospital._id === 'string' 
    ? mongoHospital._id 
    : (mongoHospital._id as any).$oid || mongoHospital._id.toString();
  
  // Create the base hospital object
  const hospital: Hospital = {
    id: id,
    name: mongoHospital.name,
    address: mongoHospital.address || 'No address provided',
    phone: mongoHospital.contact || 'Contact not available',
    email: mongoHospital.email || 'Email not available',
    beds_available: mongoHospital.beds_available || 0,
    location: mongoHospital.location || 'Location not available',
    type: 'Hospital', // Default type if not provided
    emergency_services: mongoHospital.emergency_services || false,
    facilities: mongoHospital.facilities || [], // Default empty facilities if not provided
    image: mongoHospital.image_url || undefined,
    image_url: mongoHospital.image_url || undefined
  };

  // Only add rating if it exists in the MongoDB document
  if (mongoHospital.rating !== undefined) {
    hospital.rating = mongoHospital.rating;
  }

  // Add latitude and longitude if they exist
  if (mongoHospital.latitude !== undefined) {
    hospital.latitude = mongoHospital.latitude;
  }
  
  if (mongoHospital.longitude !== undefined) {
    hospital.longitude = mongoHospital.longitude;
  }

  return hospital;
};

// Helper function to transform MongoDB doctor to frontend Doctor format
export const transformMongoDoctor = (mongoDoctor: MongoDoctor): Doctor => {
  // Handle the _id field which could be in different formats or missing
  let id = null;
  if (mongoDoctor._id) {
    if (typeof mongoDoctor._id === 'string') {
      id = mongoDoctor._id;
    } else if (typeof mongoDoctor._id === 'object' && mongoDoctor._id !== null && '$oid' in mongoDoctor._id) {
      id = (mongoDoctor._id as any).$oid;
    } else {
      id = mongoDoctor._id.toString();
    }
  } else {
    id = null;
  }

  // Handle hospital_id field which could be in different formats
  let hospitalId = 'unknown';
  if (mongoDoctor.hospital_id) {
    hospitalId = typeof mongoDoctor.hospital_id === 'string'
      ? mongoDoctor.hospital_id
      : (mongoDoctor.hospital_id as any).$oid || mongoDoctor.hospital_id.toString();
  }

  // Debug: log raw doctor object
  console.log('transformMongoDoctor raw:', mongoDoctor);

  // Correctly handle doctor_rating field to preserve decimal values
  let rating = undefined;
  if (mongoDoctor.doctor_rating !== undefined) {
    console.log('Found doctor_rating:', mongoDoctor.doctor_rating, typeof mongoDoctor.doctor_rating);
    if (typeof mongoDoctor.doctor_rating === 'number') {
      rating = mongoDoctor.doctor_rating;
      console.log('Set rating from number:', rating);
    } else if (typeof mongoDoctor.doctor_rating === 'object') {
      if ('$numberDecimal' in mongoDoctor.doctor_rating) {
        rating = parseFloat(mongoDoctor.doctor_rating.$numberDecimal);
        console.log('Set rating from $numberDecimal:', rating);
      } else if ('$numberDouble' in mongoDoctor.doctor_rating) {
        rating = parseFloat((mongoDoctor.doctor_rating as any).$numberDouble);
        console.log('Set rating from $numberDouble:', rating);
      } else {
        console.log('Unexpected doctor_rating format:', mongoDoctor.doctor_rating);
      }
    }
  } else if ((mongoDoctor as any).rating !== undefined && (mongoDoctor as any).rating > 0) {
    // Fallback: if doctor_rating is missing but rating is present and valid (from API or other source)
    rating = (mongoDoctor as any).rating;
    console.log('Set rating from fallback:', rating);
  } else {
    // Check if the object has doctor_rating field under a different name
    const docRating = (mongoDoctor as any).doctor_rating || (mongoDoctor as any).doctorRating;
    if (docRating !== undefined) {
      if (typeof docRating === 'number') {
        rating = docRating;
        console.log('Set rating from alternate field:', rating);
      }
    }
  }

  console.log('Final rating before return:', rating);

  // Use image_url from MongoDoctor if available, else fallback to image or default
  const imageUrl = mongoDoctor.image_url || mongoDoctor.image || "/doctor.png";

  return {
    id: id,
    name: mongoDoctor.name,
    speciality: mongoDoctor.speciality || 'General Practitioner',
    hospitalId: hospitalId,
    rating: rating,
    contact: mongoDoctor.contact || 'Contact not available',
    location: mongoDoctor.location || 'Location not available',
    image: imageUrl,
    image_url: mongoDoctor.image_url || undefined
  };
};

// Helper function to transform MongoDB symptom to frontend Symptom format
export const transformMongoSymptom = (mongoSymptom: MongoSymptom): Symptom => {
  const id = typeof mongoSymptom._id === 'string'
    ? mongoSymptom._id
    : (mongoSymptom._id as any).$oid || mongoSymptom._id.toString();
    
  return {
    id: id,
    name: mongoSymptom.name,
    description: mongoSymptom.description
  };
};

// Helper function to transform MongoDB disease to frontend Disease format
export const transformMongoDisease = (mongoDisease: MongoDisease): Disease => {
  const id = typeof mongoDisease._id === 'string'
    ? mongoDisease._id
    : (mongoDisease._id as any).$oid || mongoDisease._id.toString();
    
  // Process symptoms array which could be strings or object IDs
  const symptoms = mongoDisease.symptoms.map(symptom => {
    if (typeof symptom === 'string') {
      return symptom;
    } else {
      return (symptom as any).$oid || symptom.toString();
    }
  });
    
  return {
    id: id,
    name: mongoDisease.name,
    description: mongoDisease.description,
    symptoms: symptoms,
    recommendedSpecialties: mongoDisease.recommended_specialties
  };
};
