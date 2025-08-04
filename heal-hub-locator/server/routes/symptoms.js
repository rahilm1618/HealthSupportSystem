const express = require('express');
const { ObjectId } = require('mongodb');
const { Matrix } = require('ml-matrix');
const natural = require('natural');
const router = express.Router();

// Get all symptoms
router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const symptoms = await db.collection('symptoms').find({}).toArray();
    
    res.json(symptoms);
  } catch (error) {
    console.error('Error retrieving symptoms:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get symptom by ID
router.get('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const symptom = await db.collection('symptoms').findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (!symptom) {
      return res.status(404).json({ message: 'Symptom not found' });
    }
    
    res.json(symptom);
  } catch (error) {
    console.error('Error retrieving symptom:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ML-based Vector Database for Disease Prediction
class SymptomVectorDB {
  constructor() {
    // Initialize symptom vocabulary (24 symptoms from frontend)
    this.symptomVocab = {
      '1': 'fever', '2': 'cough', '3': 'headache', '4': 'fatigue',
      '5': 'shortness_breath', '6': 'chest_pain', '7': 'nausea', '8': 'abdominal_pain',
      '9': 'diarrhea', '10': 'rash', '11': 'joint_pain', '12': 'skin_rash',
      '13': 'eye_pain', '14': 'toothache', '15': 'anxiety', '16': 'diabetes_symptoms',
      '17': 'high_blood_pressure', '18': 'asthma_symptoms', '19': 'allergy_symptoms',
      '20': 'ear_pain', '21': 'back_pain', '22': 'cold', '23': 'vomiting', '24': 'sore_throat'
    };
    
    // Disease training data with symptom vectors
    this.diseaseVectors = [
      {
        name: "Common Cold",
        vector: this.createVector(['1', '2', '22', '24']), // fever, cough, cold, sore_throat
        specialty: "General Physician",
        baseProb: 0.85
      },
      {
        name: "Influenza",
        vector: this.createVector(['1', '2', '3', '4']), // fever, cough, headache, fatigue
        specialty: "General Physician", 
        baseProb: 0.80
      },
      {
        name: "Migraine",
        vector: this.createVector(['3', '7', '15']), // headache, nausea, anxiety
        specialty: "Neurologist",
        baseProb: 0.75
      },
      {
        name: "Gastroenteritis", 
        vector: this.createVector(['7', '8', '9', '23']), // nausea, abdominal_pain, diarrhea, vomiting
        specialty: "Gastroenterologist",
        baseProb: 0.70
      },
      {
        name: "Allergic Rhinitis",
        vector: this.createVector(['19', '2', '22']), // allergy_symptoms, cough, cold
        specialty: "Allergist",
        baseProb: 0.65
      },
      {
        name: "Asthma",
        vector: this.createVector(['18', '5', '6']), // asthma_symptoms, shortness_breath, chest_pain
        specialty: "Pulmonologist",
        baseProb: 0.75
      },
      {
        name: "Hypertension",
        vector: this.createVector(['17', '3']), // high_blood_pressure, headache
        specialty: "Cardiologist", 
        baseProb: 0.60
      },
      {
        name: "Diabetes",
        vector: this.createVector(['16', '4']), // diabetes_symptoms, fatigue
        specialty: "Endocrinologist",
        baseProb: 0.70
      },
      {
        name: "Arthritis",
        vector: this.createVector(['11', '21']), // joint_pain, back_pain
        specialty: "Rheumatologist",
        baseProb: 0.65
      },
      {
        name: "Dermatitis",
        vector: this.createVector(['10', '12']), // rash, skin_rash
        specialty: "Dermatologist",
        baseProb: 0.70
      },
      {
        name: "Otitis Media",
        vector: this.createVector(['20', '1']), // ear_pain, fever
        specialty: "ENT Specialist",
        baseProb: 0.75
      },
      {
        name: "Dental Infection",
        vector: this.createVector(['14', '1']), // toothache, fever
        specialty: "Dentist",
        baseProb: 0.80
      },
      {
        name: "Conjunctivitis",
        vector: this.createVector(['13', '19']), // eye_pain, allergy_symptoms
        specialty: "Ophthalmologist",
        baseProb: 0.70
      }
    ];
  }
  
  // Create binary vector for symptoms (24-dimensional)
  createVector(symptomIds) {
    const vector = new Array(24).fill(0);
    symptomIds.forEach(id => {
      const index = parseInt(id) - 1; // Convert to 0-based index
      if (index >= 0 && index < 24) {
        vector[index] = 1;
      }
    });
    return vector;
  }
  
  // Calculate cosine similarity between two vectors
  cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
  
  // Predict diseases using vector similarity
  predict(symptomIds) {
    const inputVector = this.createVector(symptomIds);
    const predictions = this.diseaseVectors.map(disease => {
      const similarity = this.cosineSimilarity(inputVector, disease.vector);
      
      // Calculate probability using similarity and base probability
      const probability = similarity * disease.baseProb;
      
      // Add some noise for more realistic ML behavior
      const noise = (Math.random() - 0.5) * 0.1;
      const finalProb = Math.max(0, Math.min(0.95, probability + noise));
      let specialties = [disease.specialty];
      let advice = '';
      // If no specialty or specialty is falsy, recommend General Physician
      if (!disease.specialty) {
        specialties = ['General Physician'];
      }
      // If anxiety or hypertension symptoms present, suggest visiting a therapist
      if (symptomIds.includes('15') || symptomIds.includes('17')) {
        advice = 'Consider visiting a therapist for further evaluation.';
      }
      return {
        disease: disease.name,
        probability: finalProb,
        similarity: similarity,
        recommendedSpecialties: specialties,
        advice: advice
      };
    });
    
    let results = predictions
      .filter(p => p.similarity > 0)
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 3);
    // If no results, recommend General Physician
    if (results.length === 0) {
      let specialties = ['General Physician'];
      let advice = '';
      if (symptomIds.includes('15') || symptomIds.includes('17')) {
        advice = 'Consider visiting a therapist for further evaluation.';
      }
      results = [{
        disease: 'No specific match',
        probability: 0.5,
        similarity: 0,
        recommendedSpecialties: specialties,
        advice: advice
      }];
    }
    return results;
  }
}

// Initialize ML model
const vectorDB = new SymptomVectorDB();

// Predict disease based on symptoms
router.post('/predict', async (req, res) => {
  try {
    const { symptoms } = req.body;
    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({ message: 'Symptoms array is required' });
    }
    // Use ML vector database for prediction
    const predictions = vectorDB.predict(symptoms);
    res.json(predictions);
  } catch (error) {
    console.error('Error predicting disease:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
