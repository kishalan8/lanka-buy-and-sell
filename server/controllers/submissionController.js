const Submission = require('../models/Submission');
const Bike = require('../models/Bike');
const { v4: uuidv4 } = require('uuid');

// --------------------
// Add a bike
// --------------------
exports.createSubmission = async (req, res) => {
  try {
    const {
      model, year, price, mileage, engineCapacity,
      brand, condition, description, ownerName, ownerContact
    } = req.body;

    const submissionData = {
      submissionID: `SUB-${uuidv4()}`,
      model,
      year,
      price,
      mileage,
      engineCapacity,
      brand,
      condition,
      description,
      ownerName,
      ownerContact,
      submittedBy: req.user._id,
      createdAt: new Date(),
      documents: [],
      images: []
    };

    // Attach uploaded images
    if (req.files['images']) {
      submissionData.images = req.files['images'].map(file => file.path);
    }

    // Attach uploaded documents
    ['Bike Book', 'Revenue License', 'Insurance', 'Emmision Test'].forEach(type => {
      if (req.files[type]) {
        req.files[type].forEach(file => {
          submissionData.documents.push({
            type,
            fileName: file.originalname,
            fileUrl: file.path,
            uploadedAt: new Date()
          });
        });
      }
    });

    const submission = new Submission(submissionData);
    await submission.save();

    res.status(201).json({ success: true, message: 'Submission created successfully', data: submission });
  } catch (error) {
    console.error('Create submission error:', error);
    res.status(500).json({ success: false, message: 'Error creating submission' });
  }
};

// --------------------
// Get all submissions (ADMIN) with optional status filter
// --------------------
exports.getSubmissions = async (req, res) => {
  try {
    const { status } = req.query; // e.g., /api/submissions?status=pending
    let query = {};

    if (status) query.status = status;

    const submissions = await Submission.find(query)
      .populate("submittedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (err) {
    console.error("Get submissions error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// --------------------
// Approve submission (ADMIN)
// --------------------
exports.approveSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission)
      return res.status(404).json({ success: false, message: "Submission not found" });

    submission.status = "approved";
    await submission.save();

    // Move to Bike collection
    const bike = await Bike.create({
      bikeID: `BIKE-${Date.now()}`,
      ...submission.toObject(),
      createdby: req.user._id, // Admin ID
      status: "available",
    });

    res.status(200).json({
      success: true,
      message: "Submission approved and added to bikes",
      data: bike,
    });
  } catch (err) {
    console.error("Approve submission error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// --------------------
// Reject submission (ADMIN)
// --------------------
exports.rejectSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission)
      return res.status(404).json({ success: false, message: "Submission not found" });

    submission.status = "rejected";
    await submission.save();

    res.status(200).json({
      success: true,
      message: "Submission rejected",
      data: submission,
    });
  } catch (err) {
    console.error("Reject submission error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// --------------------
// Delete submission (ADMIN)
// --------------------
exports.deleteSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission)
      return res.status(404).json({ success: false, message: "Submission not found" });

    await Submission.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Submission deleted",
    });
  } catch (err) {
    console.error("Delete submission error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// --------------------
// Get submissions for logged-in user
// --------------------
exports.getUserSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ submittedBy: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    console.error("Get user submissions error:", error);
    res.status(500).json({ success: false, message: "Error fetching submissions" });
  }
};
