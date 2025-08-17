// controllers/documentController.js - FINAL VERSION
const Document = require('../models/Document');
const cloudinary = require('../config/cloudinary');

const uploadUserDocuments = async (req, res) => {
  try {
    console.log("Upload route hit for user:", req.user._id);
    console.log("Req.files:", req.files);

    const allDocs = [];

    // Process uploaded files
    Object.keys(req.files).forEach(fieldname => {
      req.files[fieldname].forEach(file => {
        allDocs.push({
          user: req.user._id,
          type: file.fieldname,
          url: file.path, // Cloudinary URL
          originalName: file.originalname,
          size: file.size,
          mimeType: file.mimetype,
          cloudinaryId: file.filename // Cloudinary public_id
        });
      });
    });

    if (allDocs.length > 0) {
      const inserted = await Document.insertMany(allDocs);
      console.log("Inserted docs:", inserted.length);
    } else {
      console.log("No files to insert");
      return res.status(400).json({ 
        success: false,
        message: "No files provided for upload" 
      });
    }

    // Return updated grouped docs
    const docs = await Document.find({ user: req.user._id }).sort({ uploadedAt: -1 });
    const grouped = groupByType(docs);

    res.status(201).json({ 
      success: true,
      message: `${allDocs.length} document(s) uploaded successfully`,
      documents: grouped 
    });

  } catch (err) {
    console.error("Error uploading documents:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error while uploading documents",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// GET /api/documents
const getUserDocuments = async (req, res) => {
  try {
    console.log("Fetching documents for user:", req.user._id);

    const docs = await Document.find({ user: req.user._id });
    const grouped = groupByType(docs);

    res.json(grouped);
  } catch (err) {
    console.error("Error fetching documents:", err);
    res.status(500).json({ message: "Server error while fetching documents" });
  }
};

// Helper: group documents by type
// Helper: group documents by type
function groupByType(docs) {
  return docs.reduce((acc, doc) => {
    if (!acc[doc.type]) acc[doc.type] = [];
    acc[doc.type].push(doc);
    return acc;
  }, {});
}

// Delete document by ID
const deleteDocument = async (req, res) => {
  try {
    const documentId = req.params.id;
    const userId = req.user._id;

    const document = await Document.findOne({
      _id: documentId,
      user: userId
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Delete from Cloudinary if cloudinaryId exists
    if (document.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(document.cloudinaryId);
        console.log('Document deleted from Cloudinary:', document.cloudinaryId);
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError);
        // Continue with database deletion
      }
    }

    // Delete from database
    await Document.findByIdAndDelete(documentId);

    // Return updated documents
    const docs = await Document.find({ user: userId }).sort({ uploadedAt: -1 });
    const grouped = groupByType(docs);

    res.json({
      success: true,
      message: 'Document deleted successfully',
      documents: grouped
    });

  } catch (err) {
    console.error('Error deleting document:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting document',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Get documents by type
const getDocumentsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const allowedTypes = ['photo', 'cv', 'passport', 'drivingLicense'];
    
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document type'
      });
    }

    const documents = await Document.find({
      user: req.user._id,
      type: type
    }).sort({ uploadedAt: -1 });

    res.json({
      success: true,
      documents,
      count: documents.length
    });

  } catch (err) {
    console.error('Error fetching documents by type:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching documents',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

module.exports = {
  uploadUserDocuments,
  getUserDocuments,
  deleteDocument,
  getDocumentsByType
};