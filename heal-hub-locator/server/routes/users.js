
const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Clerk user sync (upsert by Clerk userId/email)
router.post('/clerk-sync', async (req, res) => {
  try {
    const { userId, email, name } = req.body;
    if (!userId || !email) {
      return res.status(400).json({ message: 'userId and email are required' });
    }
    const db = req.app.locals.db;
    const update = {
      $set: {
        email,
        name: name || '',
        updated_at: new Date(),
      },
      $setOnInsert: {
        clerkUserId: userId,
        created_at: new Date(),
      }
    };
    const result = await db.collection('users').updateOne(
      { clerkUserId: userId },
      update,
      { upsert: true }
    );
    res.json({ ok: true, upserted: result.upsertedId });
  } catch (error) {
    console.error('Clerk sync error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Middleware to verify JWT
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'healthhub-secret-key');
    const db = req.app.locals.db;
    const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.id) });
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

// Register user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    const db = req.app.locals.db;
    const existingUser = await db.collection('users').findOne({ email });
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const newUser = {
      name,
      email,
      password: hashedPassword,
      phone: phone || '',
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const result = await db.collection('users').insertOne(newUser);
    
    // Generate JWT
    const token = jwt.sign(
      { id: result.insertedId },
      process.env.JWT_SECRET || 'healthhub-secret-key',
      { expiresIn: '30d' }
    );
    
    res.status(201).json({
      id: result.insertedId,
      name,
      email,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }
    
    const db = req.app.locals.db;
    const user = await db.collection('users').findOne({ email });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'healthhub-secret-key',
      { expiresIn: '30d' }
    );
    
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    // User is already attached to req by auth middleware
    const user = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone || ''
    };
    
    res.json(user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
