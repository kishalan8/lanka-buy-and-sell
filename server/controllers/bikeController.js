const Bike = require('../models/Bike');
const cloudinary = require('../config/cloudinary');
const { v4: uuidv4 } = require('uuid');

// --------------------
// Add a bike
// --------------------
exports.createBike = async (req, res) => {
  try {
    const {
      model, year, price, stock, mileage, engineCapacity,
      brand, condition, description, createdby, ownerName, ownerContact
    } = req.body;

    const bikeData = {
      bikeID: uuidv4(),
      model,
      year,
      price,
      stock,
      mileage,
      engineCapacity,
      brand,
      condition,
      description,
      ownerName,
      ownerContact,
      createdby,
      createdAt: new Date(),
      documents: [],
      images: []
    };

    // Attach uploaded images
    if (req.files['images']) {
      bikeData.images = req.files['images'].map(file => file.path);
    }

    // Attach uploaded documents
    ['Bike Book', 'Revenue License', 'Insurance', 'Emmision Test'].forEach(type => {
      if (req.files[type]) {
        req.files[type].forEach(file => {
          bikeData.documents.push({
            type,
            fileName: file.originalname,
            fileUrl: file.path,
            uploadedAt: new Date()
          });
        });
      }
    });

    const bike = new Bike(bikeData);
    await bike.save();

    res.status(201).json({ success: true, message: 'Bike added successfully', data: bike });
  } catch (error) {
    console.error('Add bike error:', error);
    res.status(500).json({ success: false, message: 'Error adding bike' });
  }
};

// --------------------
// Update bike
// --------------------
exports.updateBike = async (req, res) => {
  try {
    const { id } = req.params;

    const bike = await Bike.findById(id);
    if (!bike) return res.status(404).json({ success: false, message: 'Bike not found' });

    // Update basic fields from req.body (except retainedImages)
    Object.keys(req.body).forEach(key => {
      if (key !== 'retainedImages' && req.body[key] !== undefined) {
        bike[key] = req.body[key];
      }
    });

    // Update images
    let retainedImages = [];
    if (req.body.retainedImages) {
      // Can be a single string or array
      retainedImages = Array.isArray(req.body.retainedImages)
        ? req.body.retainedImages
        : [req.body.retainedImages];
    }

    const newImages = req.files['images'] ? req.files['images'].map(file => file.path) : [];
    bike.images = [...retainedImages, ...newImages]; // merge old + new

    // Update documents
    ['Bike Book', 'Revenue License', 'Insurance', 'Emmision Test'].forEach(type => {
      if (req.files[type]) {
        req.files[type].forEach(file => {
          const existingDoc = bike.documents.find(d => d.type === type);
          if (existingDoc) {
            existingDoc.fileName = file.originalname;
            existingDoc.fileUrl = file.path;
            existingDoc.uploadedAt = new Date();
          } else {
            bike.documents.push({
              type,
              fileName: file.originalname,
              fileUrl: file.path,
              uploadedAt: new Date()
            });
          }
        });
      }
    });

    await bike.save();
    res.json({ success: true, message: 'Bike updated successfully', data: bike });
  } catch (error) {
    console.error('Update bike error:', error);
    res.status(500).json({ success: false, message: 'Error updating bike' });
  }
};


// --------------------
// Get all bikes with optional filters
// --------------------
exports.getBikes = async (req, res) => {
  try {
    const { brand, condition, search } = req.query;

    // Build filter object dynamically
    let filter = {};

    if (brand && brand !== '') filter.brand = brand;
    if (condition && condition !== '') filter.condition = condition;
    if (search && search !== '') {
      // Case-insensitive search in model or description
      filter.$or = [
        { model: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const bikes = await Bike.find(filter).sort({ createdAt: -1 }); // latest first
    res.json({ success: true, data: bikes });
  } catch (error) {
    console.error('Get bikes error:', error);
    res.status(500).json({ success: false, message: 'Error fetching bikes' });
  }
};


// --------------------
// Get single bike
// --------------------
exports.getBikeById = async (req, res) => {
  try {
    const bike = await Bike.findById(req.params.id);
    if (!bike) return res.status(404).json({ success: false, message: 'Bike not found' });
    res.json({ success: true, data: bike });
  } catch (error) {
    console.error('Get bike error:', error);
    res.status(500).json({ success: false, message: 'Error fetching bike' });
  }
};

// --------------------
// Delete bike
// --------------------
exports.deleteBike = async (req, res) => {
  try {
    const bike = await Bike.findById(req.params.id);
    if (!bike) return res.status(404).json({ success: false, message: 'Bike not found' });

    // Delete images from Cloudinary
    if (bike.images && bike.images.length > 0) {
      for (let imgUrl of bike.images) {
        const publicId = imgUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
      }
    }

    // Delete documents from Cloudinary
    if (bike.documents && bike.documents.length > 0) {
      for (let doc of bike.documents) {
        if (doc.fileUrl) {
          const publicId = doc.fileUrl.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(publicId, { resource_type: 'auto' });
        }
      }
    }

    await Bike.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Bike deleted successfully' });
  } catch (error) {
    console.error('Delete bike error:', error);
    res.status(500).json({ success: false, message: 'Error deleting bike' });
  }
};
