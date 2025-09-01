const express = require('express');
const router = express.Router();
const {addToWishlist, getWishlist, removeFromWishlist} = require('../controllers/wishlistController');
const { protectUser } = require('../middlewares/auth');

router.post('/', protectUser, addToWishlist);
router.get('/', protectUser, getWishlist);
router.delete('/:bikeId', protectUser, removeFromWishlist);

module.exports = router;
