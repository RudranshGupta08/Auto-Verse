import express from 'express';
import Car from '../models/car.js';

const router = express.Router();

console.log('✅ carRoutes loaded');

// GET cars (with optional filters)
router.get('/', async (req, res) => {
  try {
    const query = {};

    if (req.query.brand) {
      query.brand = { $regex: `^${req.query.brand}$`, $options: 'i' };
    }

    if (req.query.type) {
      query.type = { $regex: `^${req.query.type}$`, $options: 'i' };
    }

    const cars = await Car.find(query);
    res.json(cars);
  } catch (error) {
    console.error('🔥 FETCH ERROR:', error);
    res.status(500).json({
      message: 'Error fetching cars',
      error: error.message
    });
  }
});

// ✅ TEST ROUTE
router.get('/test-db', async (req, res) => {
  try {
    const count = await Car.countDocuments();
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔥 THIS LINE IS MANDATORY
export default router;


