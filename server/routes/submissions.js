const fs = require('fs');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // add this for unique bikeID generation
const Submission = require('../models/Submission');
const Bike = require('../models/Bike');

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// POST /api/submissions
router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    const {
      sellerName,
      sellerEmail,
      sellerPhone,
      make,
      model,
      year,
      price,
      description,
      condition,
    } = req.body;

    const imagePaths = req.files.map((file) => `/uploads/${file.filename}`);

    const newSubmission = new Submission({
      sellerName,
      sellerEmail,
      sellerPhone,
      make,
      model,
      year,
      price,
      description,
      condition,
      images: imagePaths,
    });

    await newSubmission.save();
    res.status(201).json({ message: 'Submission successful' });
  } catch (err) {
    console.error('Error in submission:', err);
    res.status(500).json({ message: 'Failed to submit bike' });
  }
});

// GET all submissions
router.get('/', async (req, res) => {
  try {
    const submissions = await Submission.find().sort({ createdAt: -1 });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// DELETE a submission
router.delete('/:id', async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    // Delete each image file
    if (submission.images && submission.images.length > 0) {
      submission.images.forEach((imagePath) => {
        const filePath = path.join(__dirname, '..', imagePath.replace(/^\/+/, '')); // remove leading slash
        fs.unlink(filePath, (err) => {
          if (err) console.error('Failed to delete image:', filePath, err.message);
        });
      });
    }

    await Submission.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Submission and images deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// APPROVE a submission
router.post('/:id/approve', async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) return res.status(404).json({ error: 'Submission not found' });

    // Prepare image filenames (remove leading slashes)
    const bikeImages = [];

    if (submission.images && submission.images.length > 0) {
      submission.images.forEach((imgPath) => {
        const filename = path.basename(imgPath);

        // Check if file exists (warn if missing)
        const filePath = path.join(__dirname, '..', 'uploads', filename);
        if (!fs.existsSync(filePath)) {
          console.warn(`Image file not found for approval: ${filePath}`);
        }

        bikeImages.push(filename);
      });
    }

    // Generate bikeID here (required field)
    const bikeID = uuidv4();

    const newBike = new Bike({
      bikeID,          // required id
      make: submission.make,
      model: submission.model,
      year: submission.year,
      price: submission.price,
      stock: 1,
      condition: 'used', // force condition used
      description: submission.description || '',
      images: bikeImages,
    });

    await newBike.save();

    // Delete the submission after approval (images remain in uploads)
    await Submission.findByIdAndDelete(req.params.id);

    res.json({ message: 'Submission approved successfully', bike: newBike });
  } catch (err) {
    console.error('Approve error:', err);
    res.status(500).json({ error: 'Failed to approve submission' });
  }
});

module.exports = router;
