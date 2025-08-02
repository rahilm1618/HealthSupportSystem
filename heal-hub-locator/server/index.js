
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = 'mongodb://localhost:27017/PR-project';

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
MongoClient.connect(MONGODB_URI)
  .then((client) => {
    console.log('Connected to MongoDB');
    const db = client.db();
    app.locals.db = db; // Store db connection in app.locals
    
    // Routes
    app.use('/api/hospitals', require('./routes/hospitals'));
    app.use('/api/doctors', require('./routes/doctors'));
    app.use('/api/users', require('./routes/users'));
    app.use('/api/appointments', require('./routes/appointments'));
    app.use('/api/symptoms', require('./routes/symptoms'));
    
    // Default route
    app.get('/', (req, res) => {
      res.send('HealthHub API is running');
    });
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });
