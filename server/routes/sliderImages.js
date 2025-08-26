const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const SliderImage = require('../models/SliderImage'); // adjust path

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/sliders');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

router.post('/upload-slider-images', upload.array('images', 10), async (req, res) => {
  try {
    const imagePaths = req.files.map(file => ({
      imageUrl: `uploads/sliders/${file.filename}`,  // make sure folder exists
      caption: req.body.caption || ''
    }));
    await SliderImage.insertMany(imagePaths);
    res.status(200).json({ message: 'Images uploaded', data: imagePaths });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});


router.put('/:id', async (req, res) => {
  try {
    const updated = await SliderImage.findByIdAndUpdate(
      req.params.id,
      { caption: req.body.caption },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
});


module.exports = router;
