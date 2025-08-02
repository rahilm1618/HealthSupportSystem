const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();

// Get all doctors
router.get('/', async (req, res) => {
  try {
    const { search, speciality, hospitalId, sort } = req.query;
    let query = {};
    
    // Apply search filter if provided
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { speciality: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    // Apply speciality filter if provided
    if (speciality) {
      query.speciality = { $regex: speciality, $options: 'i' };
    }
    
    // Apply hospital filter if provided
    if (hospitalId) {
      try {
        query.hospital_id = new ObjectId(hospitalId);
      } catch (err) {
        console.error('Invalid hospital ID format:', err);
      }
    }
    
    const db = req.app.locals.db;
    const doctors = await db.collection('doctors').find(query).toArray();
    
    console.log(`Found ${doctors.length} doctors in database`);
    
    // Transform data to match frontend format
    const transformedDoctors = doctors.map(doctor => {
      const doctorId = doctor._id instanceof ObjectId ? doctor._id.toString() : doctor._id.toString();

     // Check what the doctor object looks like
console.log('Doctor:', doctor);
let rating = 0;

if (doctor.doctor_rating !== undefined && doctor.doctor_rating !== null) {
  const dr = doctor.doctor_rating;

  if (typeof dr === 'number') {
    rating = dr;
  } else if (typeof dr.toString === 'function') {
    rating = parseFloat(dr.toString());
  }
}

if (isNaN(rating)) {
  rating = 0;
}


console.log('Final Rating:', rating);

      // Use Unsplash for real doctor images
      const imageUrl = doctor.image || 
        `https://api.unsplash.com/search/photos?query=doctor&client_id=--lE6zY6b0ImWRcvTA6agtoxA36r0_6hr6ttFNjA9A4`;

      return {
        id: doctorId,
        name: doctor.name || 'Unknown Doctor',
        speciality: doctor.speciality || 'General Practitioner',
        hospitalId: doctor.hospital_id ? doctor.hospital_id.toString() : 'unknown',
        rating: rating, // This will preserve decimal values
        contact: doctor.contact || 'Contact not available',
        location: doctor.location || 'Location not available',
        image: imageUrl
      };
    });
    
    // Apply sorting if provided
    if (sort) {
      switch (sort) {
        case 'rating-high':
          transformedDoctors.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'rating-low':
          transformedDoctors.sort((a, b) => (a.rating || 0) - (b.rating || 0));
          break;
        case 'name-asc':
          transformedDoctors.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'name-desc':
          transformedDoctors.sort((a, b) => b.name.localeCompare(a.name));
          break;
        default:
          // Default sorting
          break;
      }
    }
    
    res.json(transformedDoctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get doctors by hospital ID
router.get('/hospital/:hospitalId', async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const db = req.app.locals.db;
    
    const doctors = await db.collection('doctors').find({ 
      hospital_id: new ObjectId(hospitalId) 
    }).toArray();
    
    // Transform data to match frontend format
    const transformedDoctors = doctors.map(doctor => {
      const doctorId = doctor._id instanceof ObjectId ? doctor._id.toString() : doctor._id.toString();

      // Handle doctor_rating properly
      let rating = null;
      if (doctor.doctor_rating !== undefined && doctor.doctor_rating !== null) {
        if (typeof doctor.doctor_rating === 'number') {
          rating = doctor.doctor_rating;
        } else if (doctor.doctor_rating.$numberDecimal) {
          rating = parseFloat(doctor.doctor_rating.$numberDecimal);
        } else if (doctor.doctor_rating.$numberDouble) {
          rating = parseFloat(doctor.doctor_rating.$numberDouble);
        }
      }
      if (rating === null) {
        rating = 0; // Default to 0 if no rating is available
      }

      // Use Unsplash for real doctor images
      const imageUrl = doctor.image || 
        `https://source.unsplash.com/featured/300x300/?doctor&sig=${doctorId}`;

      return {
        id: doctorId,
        name: doctor.name || 'Unknown Doctor',
        speciality: doctor.speciality || 'General Practitioner',
        hospitalId: doctor.hospital_id ? doctor.hospital_id.toString() : 'unknown',
        rating: rating, // This will preserve decimal values
        contact: doctor.contact || 'Contact not available',
        location: doctor.location || 'Location not available',
        image: imageUrl
      };
    });
    
    res.json(transformedDoctors);
  } catch (error) {
    console.error(`Error fetching doctors for hospital ${req.params.hospitalId}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
