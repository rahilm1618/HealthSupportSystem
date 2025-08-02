
import { Symptom, Disease, Doctor, Hospital, MongoHospital, MongoDoctor } from '@/types';
import { transformMongoHospital, transformMongoDoctor } from '@/utils/dataTransformers';

// MongoDB data from provided JSON
const mongoHospitals: MongoHospital[] = [
  {
    "_id": { "$oid": "67e70a72656fd50736be9245" },
    "name": "Shalby Hospital",
    "beds_available": 100,
    "email": "info.jabalpur@shalby.org",
    "contact": "7383085128",
    "address": "Vijay Nagar Colony, Jabalpur",
    "location": "Jabalpur",
    "emergency_services": true
  },
  {
    "_id": { "$oid": "67e70bfe656fd50736be924a" },
    "name": "Devshree Hospital",
    "beds_available": 75,
    "email": "devshri2010@rediffmail.com",
    "contact": "9755204878",
    "address": "Mohan Vihar Colony, Sanjeevani Nagar, Jabalpur - 482003",
    "location": "Jabalpur",
    "emergency_services": true
  },
  {
    "_id": { "$oid": "67e70f47656fd50736be9255" },
    "name": "Global Hospital",
    "beds_available": 95,
    "email": "globalhospitalurology@gmail.com",
    "contact": "7612688589",
    "address": "South Civil Lines, Jabalpur",
    "location": "Jabalpur",
    "emergency_services": true
  },
  {
    "_id": { "$oid": "67e70f47656fd50736be9256" },
    "name": "Galaxy Superspeciality Hospital",
    "beds_available": 70,
    "email": "galaxyhospitaljbp2020@gmail.com",
    "contact": "7614017010",
    "address": "Karamchand Chowk, Jabalpur",
    "location": "Jabalpur",
    "emergency_services": true
  },
  {
    "_id": { "$oid": "67e710eb656fd50736be9257" },
    "name": "Jeevan Jyoti Hospital",
    "beds_available": 90,
    "email": "help@jeevanjyotihospitals.com",
    "contact": "9893736568",
    "address": "Gwarighat, Jabalpur",
    "location": "Jabalpur",
    "emergency_services": true
  },
  {
    "_id": { "$oid": "67e70a72656fd50736be9246" },
    "name": "Jabalpur Hospital And Research Center",
    "beds_available": 150,
    "email": "jhrc_hrd@yahoo.co.in",
    "contact": "7614026000",
    "address": "Russell Chowk, Napier Town, Jabalpur",
    "location": "Jabalpur",
    "emergency_services": true
  },
  {
    "_id": { "$oid": "67e70a72656fd50736be9248" },
    "name": "Vision Eye Care Hospital",
    "beds_available": 50,
    "email": "jabalpur@asgeyehospital.com",
    "contact": "7612414171",
    "address": "Madan Mahal, Jabalpur",
    "location": "Jabalpur",
    "emergency_services": false
  }
];

const mongoDoctors: MongoDoctor[] = [
  {
    "_id": { "$oid": "67ec33314f833c43c638736e" },
    "name": "Dr. Amit Jaikumar Jain",
    "speciality": "Orthopaedic",
    "hospital_id": { "$oid": "67e70a72656fd50736be9245" },
    "contact": "9426912224",
    "location": "South Civil Lines, Jabalpur",
    "doctor_rating": { "$numberDecimal": "4.9" }
  },
  {
    "_id": { "$oid": "67ec33314f833c43c638736f" },
    "name": "Dr. Amitesh Dubey",
    "speciality": "Neurology",
    "hospital_id": { "$oid": "67e70a72656fd50736be9245" },
    "contact": "9474170789",
    "location": "Vijay Nagar Colony Jabalpur",
    "doctor_rating": { "$numberDecimal": "4.8" }
  },
  {
    "_id": { "$oid": "67ec33314f833c43c6387370" },
    "name": "Dr. Avani Agrawal",
    "speciality": "Gynaecologist & Obstetrician Doctors",
    "hospital_id": { "$oid": "67e70a72656fd50736be9245" },
    "contact": "9474304070",
    "location": "Vijay Nagar Colony Jabalpur",
    "doctor_rating": { "$numberDecimal": "4.1" }
  },
  {
    "_id": { "$oid": "67ec36414f833c43c6387373" },
    "name": "Dr. Adem Teja",
    "speciality": "Orthopaedic",
    "hospital_id": { "$oid": "67e70f47656fd50736be9255" },
    "contact": "7947431602",
    "location": "Vijay Nagar, Jabalpur ",
    "doctor_rating": { "$numberDecimal": "4.9" }
  },
  {
    "_id": { "$oid": "67eee367045731cc020383d1" },
    "name": "Dr Jatin Dhirawani",
    "speciality": "Orthopaedic",
    "hospital_id": { "$oid": "67e70a72656fd50736be9246" },
    "contact": "7947427074",
    "location": "Napier Town Jabalpur",
    "doctor_rating": { "$numberDecimal": "4.7" }
  }
];

// Transform MongoDB data to our application format
export const hospitals: Hospital[] = mongoHospitals.map(h => transformMongoHospital(h));
export const doctors: Doctor[] = mongoDoctors.map(d => transformMongoDoctor(d));

// Mock data for symptoms
export const symptoms: Symptom[] = [
  { id: '1', name: 'Fever', description: 'Elevated body temperature' },
  { id: '2', name: 'Cough', description: 'A forceful expulsion of air from the lungs' },
  { id: '3', name: 'Fatigue', description: 'A feeling of tiredness or lack of energy' },
  { id: '4', name: 'Headache', description: 'Pain in the head' },
  { id: '5', name: 'Sore Throat', description: 'Pain or irritation in the throat' },
  { id: '6', name: 'Runny Nose', description: 'Excess nasal drainage' },
  { id: '7', name: 'Muscle Pain', description: 'Aches and pains in the muscles' },
  { id: '8', name: 'Nausea', description: 'A feeling of sickness with an inclination to vomit' },
  { id: '9', name: 'Diarrhea', description: 'Frequent, loose, watery bowel movements' },
  { id: '10', name: 'Shortness of Breath', description: 'Difficulty breathing or feeling breathless' },
  { id: '11', name: 'Chest Pain', description: 'Discomfort or pain in the chest' },
  { id: '12', name: 'Abdominal Pain', description: 'Pain in the abdomen' },
  { id: '13', name: 'Dizziness', description: 'A sensation of spinning around and losing balance' },
  { id: '14', name: 'Skin Rash', description: 'A change in the skin which affects its appearance' },
  { id: '15', name: 'Swelling', description: 'Abnormal enlargement of a part of the body' },
];

// Mock data for diseases
export const diseases: Disease[] = [
  {
    id: '1',
    name: 'Common Cold',
    description: 'A viral infection of the upper respiratory tract',
    symptoms: ['1', '2', '5', '6', '3'],
    recommendedSpecialties: ['General Physician', 'ENT Specialist']
  },
  {
    id: '2',
    name: 'Influenza (Flu)',
    description: 'A contagious respiratory illness caused by influenza viruses',
    symptoms: ['1', '2', '3', '4', '7'],
    recommendedSpecialties: ['General Physician', 'Infectious Disease Specialist']
  },
  {
    id: '3',
    name: 'Pneumonia',
    description: 'An infection that inflames the air sacs in one or both lungs',
    symptoms: ['1', '2', '10', '11', '3'],
    recommendedSpecialties: ['Pulmonologist', 'Infectious Disease Specialist']
  },
  {
    id: '4',
    name: 'Gastroenteritis',
    description: 'Inflammation of the stomach and intestines',
    symptoms: ['8', '9', '12', '1'],
    recommendedSpecialties: ['Gastroenterologist', 'General Physician']
  },
  {
    id: '5',
    name: 'Allergic Reaction',
    description: 'An adverse reaction caused by the immune system to a foreign substance',
    symptoms: ['6', '14', '10', '15'],
    recommendedSpecialties: ['Allergist', 'Dermatologist']
  },
];

// Helper function to get disease by symptoms
export const getDiseaseBySymptoms = (symptomIds: string[]): Disease[] => {
  return diseases.filter(disease => {
    return symptomIds.every(symptomId => disease.symptoms.includes(symptomId));
  });
};

// Helper function to get doctors by specialty
export const getDoctorsBySpecialty = (speciality: string): Doctor[] => {
  return doctors.filter(doctor => doctor.speciality === speciality);
};

// Helper function to get hospital by ID
export const getHospitalById = (id: string): Hospital | undefined => {
  return hospitals.find(hospital => hospital.id === id);
};

// Helper function to get doctors by hospital ID
export const getDoctorsByHospital = (hospitalId: string): Doctor[] => {
  return doctors.filter(doctor => doctor.hospitalId === hospitalId);
};
