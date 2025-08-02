
const express = require('express');
const { ObjectId } = require('mongodb');
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

// Get all diseases
router.get('/diseases', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const diseases = await db.collection('diseases').find({}).toArray();
    
    res.json(diseases);
  } catch (error) {
    console.error('Error retrieving diseases:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Predict disease based on symptoms
router.post('/predict', async (req, res) => {
  try {
    const { symptoms } = req.body;
    
    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({ message: 'Symptoms array is required' });
    }
    
    const db = req.app.locals.db;
    
    // Get all diseases
    const diseases = await db.collection('diseases').find({}).toArray();
    
    // Calculate basic matching algorithm (more symptom matches = higher score)
    const matches = diseases.map(disease => {
      // Convert ObjectId symptoms to strings if needed
      const diseaseSymptoms = disease.symptoms.map(s => 
        typeof s === 'object' && s.$oid ? s.$oid : s.toString()
      );
      
      // Count matching symptoms
      const matchCount = symptoms.filter(s => diseaseSymptoms.includes(s)).length;
      
      // Calculate a simple probability score
      // More matching symptoms and fewer non-matching symptoms = higher score
      const probability = matchCount > 0 
        ? matchCount / Math.max(diseaseSymptoms.length, symptoms.length)
        : 0;
      
      return {
        disease: disease.name,
        id: disease._id.toString(),
        probability,
        description: disease.description,
        recommendedSpecialties: disease.recommended_specialties || []
      };
    });
    
    // Sort by probability (highest first)
    const sortedMatches = matches.sort((a, b) => b.probability - a.probability);
    
    // Return top 3 matches
    res.json(sortedMatches.slice(0, 3));
    
  } catch (error) {
    console.error('Error predicting disease:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
