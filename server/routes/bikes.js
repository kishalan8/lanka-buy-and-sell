const express = require('express');
const router = express.Router();
const Bike = require('../models/Bike');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// Ensure uploads folder is served
// In server.js: app.use('/uploads', express.static('uploads'));

// Get all bikes
router.get('/', async (req, res) => {
  try {
    const bikes = await Bike.find();
    res.json(bikes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single bike by ID
router.get('/:id', async (req, res) => {
  try {
    const bike = await Bike.findById(req.params.id);
    if (!bike) return res.status(404).json({ message: 'Bike not found' });
    res.json(bike);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});



// POST new bike
router.post('/', upload.array('images'), async (req, res) => {
  console.log('FILES:', req.files); // Should show uploaded files
  console.log('BODY:', req.body);   // Should show other fields

  try {
    const bikeData = {
      ...req.body,
      bikeID: uuidv4(),
      images: req.files?.map(f => f.filename) || [],
    };
    console.log('BIKE DATA:', bikeData); // Must show images array

    const bike = new Bike(bikeData);
    await bike.save();
    res.status(201).json(bike);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PUT update bike
router.put('/:id', upload.array('images'), async (req, res) => {
  try {
    const bike = await Bike.findById(req.params.id);
    if (!bike) return res.status(404).json({ error: 'Bike not found' });

    const { make, model, year, price, stock, condition, description } = req.body;
    bike.make = make;
    bike.model = model;
    bike.year = Number(year);
    bike.price = Number(price);
    bike.stock = Number(stock);
    bike.condition = condition;
    bike.description = description;

    if (req.files?.length > 0) {
      // Delete old images
      (bike.images || []).forEach(img => {
        const filePath = path.join(__dirname, '..', 'uploads', img);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });

      // Save new images
      bike.images = req.files.map(f => f.filename);
    }

    await bike.save();
    res.json(bike);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE bike
router.delete('/:id', async (req, res) => {
  try {
    const bike = await Bike.findById(req.params.id);
    if (!bike) return res.status(404).json({ error: 'Bike not found' });

    // Delete images
    (bike.images || []).forEach(img => {
      const filePath = path.join(__dirname, '..', 'uploads', img);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    await Bike.findByIdAndDelete(req.params.id);
    res.json({ message: 'Bike deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
