
/**
 * This script populates the MongoDB database with sample symptom and disease data
 * To run: node symptoms-diseases.js
 */

const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/healthhub';

// Sample symptoms data
const symptoms = [
  {
    name: "Fever",
    description: "Elevated body temperature above 37.5°C (99.5°F)"
  },
  {
    name: "Cough",
    description: "Sudden expulsion of air from the lungs to clear the airways"
  },
  {
    name: "Headache",
    description: "Pain or discomfort in the head or scalp"
  },
  {
    name: "Fatigue",
    description: "Extreme tiredness resulting from mental or physical exertion"
  },
  {
    name: "Shortness of breath",
    description: "Difficulty breathing or catching your breath"
  },
  {
    name: "Chest pain",
    description: "Discomfort or pain in the chest area"
  },
  {
    name: "Nausea",
    description: "Feeling of sickness with an inclination to vomit"
  },
  {
    name: "Abdominal pain",
    description: "Pain felt between the chest and groin"
  },
  {
    name: "Diarrhea",
    description: "Loose, watery and frequent bowel movements"
  },
  {
    name: "Sore throat",
    description: "Pain or irritation in the throat that can occur when swallowing"
  },
  {
    name: "Joint pain",
    description: "Discomfort, aches or soreness in one or more joints"
  },
  {
    name: "Muscle pain",
    description: "Pain affecting a muscle or group of muscles"
  },
  {
    name: "Rash",
    description: "Area of irritated or swollen skin"
  },
  {
    name: "Dizziness",
    description: "Feeling faint, lightheaded, or unsteady"
  },
  {
    name: "Loss of taste or smell",
    description: "Inability to detect flavors or odors"
  }
];

// Function to populate database
async function seedDatabase() {
  let client;
  
  try {
    // Connect to MongoDB
    client = await MongoClient.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    const db = client.db();
    
    // Insert symptoms
    const insertedSymptoms = await db.collection('symptoms').insertMany(symptoms);
    console.log(`${insertedSymptoms.insertedCount} symptoms inserted`);
    
    // Get inserted symptom IDs
    const symptomIds = Object.values(insertedSymptoms.insertedIds);
    
    // Create diseases with references to symptoms
    const diseases = [
      {
        name: "Common Cold",
        description: "A viral infection of the upper respiratory tract that primarily affects the nose and throat",
        symptoms: [symptomIds[1], symptomIds[9], symptomIds[6], symptomIds[3]], // Cough, Sore throat, Nausea, Fatigue
        recommended_specialties: ["General Practitioner", "Family Medicine"]
      },
      {
        name: "Influenza",
        description: "A viral infection that attacks your respiratory system",
        symptoms: [symptomIds[0], symptomIds[1], symptomIds[2], symptomIds[3], symptomIds[11]], // Fever, Cough, Headache, Fatigue, Muscle pain
        recommended_specialties: ["General Practitioner", "Infectious Disease", "Pulmonology"]
      },
      {
        name: "COVID-19",
        description: "A respiratory illness caused by the SARS-CoV-2 virus",
        symptoms: [symptomIds[0], symptomIds[1], symptomIds[4], symptomIds[3], symptomIds[14]], // Fever, Cough, Shortness of breath, Fatigue, Loss of taste/smell
        recommended_specialties: ["Infectious Disease", "Pulmonology", "Internal Medicine"]
      },
      {
        name: "Migraine",
        description: "A headache of varying intensity, often accompanied by nausea and sensitivity to light and sound",
        symptoms: [symptomIds[2], symptomIds[6], symptomIds[13]], // Headache, Nausea, Dizziness
        recommended_specialties: ["Neurology", "Pain Management"]
      },
      {
        name: "Gastroenteritis",
        description: "Inflammation of the stomach and intestines that causes vomiting and diarrhea",
        symptoms: [symptomIds[6], symptomIds[8], symptomIds[7], symptomIds[0]], // Nausea, Diarrhea, Abdominal pain, Fever
        recommended_specialties: ["Gastroenterology", "Internal Medicine"]
      },
      {
        name: "Pneumonia",
        description: "Infection that inflames air sacs in one or both lungs",
        symptoms: [symptomIds[0], symptomIds[1], symptomIds[4], symptomIds[5]], // Fever, Cough, Shortness of breath, Chest pain
        recommended_specialties: ["Pulmonology", "Infectious Disease", "Internal Medicine"]
      },
      {
        name: "Bronchitis",
        description: "Inflammation of the lining of the bronchial tubes",
        symptoms: [symptomIds[1], symptomIds[4], symptomIds[3], symptomIds[0]], // Cough, Shortness of breath, Fatigue, Fever
        recommended_specialties: ["Pulmonology", "Internal Medicine"]
      },
      {
        name: "Rheumatoid Arthritis",
        description: "An autoimmune disorder that causes inflammation in the joints",
        symptoms: [symptomIds[10], symptomIds[11], symptomIds[3]], // Joint pain, Muscle pain, Fatigue
        recommended_specialties: ["Rheumatology", "Orthopedics"]
      }
    ];
    
    // Insert diseases
    const insertedDiseases = await db.collection('diseases').insertMany(diseases);
    console.log(`${insertedDiseases.insertedCount} diseases inserted`);
    
    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Run the seeding function
seedDatabase();
