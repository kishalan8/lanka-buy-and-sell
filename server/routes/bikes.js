const express = require('express');
const router = express.Router();
const {createBike, updateBike, getBikes, getBikeById, deleteBike} = require('../controllers/bikeController');
const uploadBikeFiles = require('../middlewares/upload');
const {protect} = require('../middlewares/auth');

router.post('/', protect, uploadBikeFiles, createBike);
router.put('/:id', protect, uploadBikeFiles, updateBike);
router.get('/', getBikes);
router.get('/:id', getBikeById);
router.delete('/:id', protect, deleteBike);

module.exports = router;
