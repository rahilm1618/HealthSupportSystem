
const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();

// Get all hospitals
router.get('/', async (req, res) => {
  try {
    const { search, type, sort } = req.query;
    let query = {};
    
    // Apply search filter if provided
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { address: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    // Apply type filter if provided
    if (type && type !== 'all') {
      if (type === 'emergency') {
        query.emergency_services = true;
      }
    }
    
    const db = req.app.locals.db;
    // Fetch all hospitals if no filters provided
    const hospitals = await db.collection('hospitals').find(query).toArray();
    
    console.log(`Found ${hospitals.length} hospitals in database`);
    
    // Transform data to match frontend format
    const transformedHospitals = hospitals.map(hospital => {
      const hospitalId = hospital._id instanceof ObjectId ? hospital._id.toString() : hospital._id.toString();
      
      const transformedHospital = {
        id: hospitalId,
        name: hospital.name,
        address: hospital.address || 'No address provided',
        phone: hospital.contact || 'Contact not available',
        email: hospital.email || 'Email not available',
        beds_available: hospital.beds_available || 0,
        location: hospital.location || 'Location not available',
        type: 'Hospital', // Default type
        emergency_services: hospital.emergency_services || false,
        facilities: hospital.facilities || [], // Default empty facilities
        image: hospital.image_url,
        latitude: hospital.latitude || 23.1815, // Default latitude for Jabalpur
        longitude: hospital.longitude || 79.9864, // Default longitude for Jabalpur
      };
      
      // Only add rating if it exists in the database
      if (hospital.rating !== undefined) {
        transformedHospital.rating = hospital.rating;
      }
      
      return transformedHospital;
    });
    
    // Apply sorting if provided
    if (sort) {
      switch (sort) {
        case 'rating-high':
          transformedHospitals.sort((a, b) => ((b.rating || 0) - (a.rating || 0)));
          break;
        case 'rating-low':
          transformedHospitals.sort((a, b) => ((a.rating || 0) - (b.rating || 0)));
          break;
        case 'name-asc':
          transformedHospitals.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'name-desc':
          transformedHospitals.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case 'beds-high':
          transformedHospitals.sort((a, b) => b.beds_available - a.beds_available);
          break;
        default:
          // Default sorting
          break;
      }
    }
    
    res.json(transformedHospitals);
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get hospital by ID
router.get('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const hospital = await db.collection('hospitals').findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }
    
    // Transform to match frontend format
    const transformedHospital = {
      id: hospital._id.toString(),
      name: hospital.name,
      address: hospital.address || 'No address provided',
      phone: hospital.contact,
      email: hospital.email,
      beds_available: hospital.beds_available || 0,
      location: hospital.location,
      type: 'Hospital', // Default type
      emergency_services: hospital.emergency_services || false,
      facilities: hospital.facilities || [], // Default empty facilities
      image: hospital.image_url,
      latitude: hospital.latitude || 23.1815, // Default latitude for Jabalpur
      longitude: hospital.longitude || 79.9864, // Default longitude for Jabalpur
    };
    
    // Only add rating if it exists in the database
    if (hospital.rating !== undefined) {
      transformedHospital.rating = hospital.rating;
    }
    
    res.json(transformedHospital);
  } catch (error) {
    console.error('Error fetching hospital:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get nearby hospitals
router.get('/nearby/:lat/:lng', async (req, res) => {
  try {
    const { lat, lng } = req.params;
    const db = req.app.locals.db;
    
    // For now, simply return hospitals with emergency services since we don't have geolocation data
    const hospitals = await db.collection('hospitals').find({ 
      emergency_services: true 
    }).toArray();
    
    // Transform data to match frontend format
    const transformedHospitals = hospitals.map(hospital => {
      const hospitalId = hospital._id instanceof ObjectId ? hospital._id.toString() : hospital._id.toString();
      
      const transformedHospital = {
        id: hospitalId,
        name: hospital.name,
        address: hospital.address || 'No address provided',
        phone: hospital.contact,
        email: hospital.email,
        beds_available: hospital.beds_available || 0,
        location: hospital.location,
        type: 'Hospital', // Default type
        emergency_services: hospital.emergency_services || false,
        facilities: hospital.facilities || [], // Default empty facilities
        image: hospital.image || `https://source.unsplash.com/featured/?hospital,medical,building&sig=${hospitalId}`,
        latitude: hospital.latitude || 23.1815, // Default latitude for Jabalpur
        longitude: hospital.longitude || 79.9864, // Default longitude for Jabalpur
      };
      
      // Only add rating if it exists in the database
      if (hospital.rating !== undefined) {
        transformedHospital.rating = hospital.rating;
      }
      
      return transformedHospital;
    });
    
    res.json(transformedHospitals);
  } catch (error) {
    console.error('Error fetching nearby hospitals:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
