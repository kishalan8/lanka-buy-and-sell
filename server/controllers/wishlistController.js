// controllers/wishlistController.js
const Wishlist = require("../models/Wishlist");

// Add to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    console.log("Request to add to wishlist:", req.user._id, req.body.bikeId);

    // Create wishlist item
    const wish = await Wishlist.create({
      user: req.user._id,
      bike: req.body.bikeId,
    });

    console.log("Wishlist item created:", wish);
    res.status(201).json(wish);
  } catch (err) {
    // Check for duplicate key error
    if (err.code === 11000) {
      console.log("Duplicate wishlist item detected:", err.keyValue);
      return res.status(400).json({ error: "Already in wishlist" });
    }

    console.error("Error adding to wishlist:", err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    console.log("Fetching wishlist for user:", req.user._id);
    const list = await Wishlist.find({ user: req.user._id }).populate("bike");
    console.log("Wishlist fetched:", list.length, "items");

    res.json({
      success: true,
      data: list
    });
  } catch (err) {
    console.error("Error fetching wishlist:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};


// Remove from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    console.log("Removing from wishlist:", req.user._id, req.params.bikeId);
    const deleted = await Wishlist.findOneAndDelete({
      user: req.user._id,
      bike: req.params.bikeId,
    });

    if (deleted) {
      console.log("Wishlist item removed:", deleted);
      res.json({ message: "Removed from wishlist" });
    } else {
      console.log("Wishlist item not found to remove");
      res.status(404).json({ error: "Wishlist item not found" });
    }
  } catch (err) {
    console.error("Error removing from wishlist:", err.message);
    res.status(500).json({ error: err.message });
  }
};
