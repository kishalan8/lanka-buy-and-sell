const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Common fields for all users
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  userType: {
    type: String,
    enum: ['candidate', 'agent'],
    default: 'candidate',
    required: true,
  },
  phoneNumber: {
    type: Number,
  },

  // Candidate-specific fields
  picture: {
    type: String, // Profile picture path/URL
  },
  CV: {
    type: String, // CV file path/URL
  },
  drivingLicense: {
    type: String, // Driving license file path/URL
  },
  passport: {
    type: String, // Passport file path/URL
  },
  address: {
    type: String,
  },
  country: {
    type: String,
  },
  appliedJobs: [
    {
      jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
      },
      status: {
        type: String,
        default: 'Applied',
      },
      appliedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  savedJobs: [
    {
      jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
      },
      savedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  // Agent-specific fields
  companyName: {
    type: String,
    required: function() {
      return this.userType === 'agent';
    },
  },
  companyAddress: {
    type: String,
    required: function() {
      return this.userType === 'agent';
    },
  },
  contactPerson: {
    type: String,
    required: function() {
      return this.userType === 'agent';
    },
  },
  companyLogo: {
    type: String, // Company logo path/URL
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  managedCandidates: [
    {
      name: String,
      email: String,
      phone: String,
      skills: [String],
      experience: String,
      qualifications: [String],
      status: { type: String, enum: ["Pending", "Reviewed", "Approved", "Rejected"], default: "Pending" },
      addedAt: {
        type: Date,
        default: Date.now,
      },
      inquiries: [ // New: Inquiries per candidate
        {
          content: String,
          response: String,
          status: { type: String, default: 'Pending' },
          createdAt: { type: Date, default: Date.now }
        }
      ],
      documents: [ // Documents per managed candidate
       {
          type: {
          type: String,
          enum: ['CV', 'Passport', 'Picture', 'DrivingLicense'],
          required: true,
    },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    status: { type: String, default: 'Pending' }, // optional: Approved / Rejected
    uploadedAt: { type: Date, default: Date.now }
  }
]
    },
  ],
  assignedTo: { // New: For agent-candidate permanent assignment by admin
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to check password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to add saved job (for candidates)
userSchema.methods.saveJob = async function(jobId) {
  if (this.userType !== 'candidate') {
    throw new Error('Only candidates can save jobs');
  }
  
  const isAlreadySaved = this.savedJobs.some(
    savedJob => savedJob.jobId.toString() === jobId.toString()
  );
  
  if (!isAlreadySaved) {
    this.savedJobs.push({ jobId });
    await this.save();
  }
  return this;
};

// Method to remove saved job (for candidates)
userSchema.methods.unsaveJob = async function(jobId) {
  if (this.userType !== 'candidate') {
    throw new Error('Only candidates can unsave jobs');
  }
  
  this.savedJobs = this.savedJobs.filter(
    savedJob => savedJob.jobId.toString() !== jobId.toString()
  );
  await this.save();
  return this;
};

// Method to add managed candidate (for agents)
userSchema.methods.addManagedCandidate = async function(candidateData) {
  if (this.userType !== 'agent') {
    throw new Error('Only agents can manage candidates');
  }
  
  this.managedCandidates.push(candidateData);
  await this.save();
  return this;
};

// New: Method to update candidate status
userSchema.methods.updateCandidateStatus = async function(candidateId, newStatus) {
  if (this.userType !== 'agent') {
    throw new Error('Only agents can update statuses');
  }
  const candidate = this.managedCandidates.id(candidateId);
  if (candidate) {
    candidate.status = newStatus; // Assume adding status field if needed
    await this.save();
  }
  return this;
};

const User = mongoose.model('User', userSchema);

module.exports = User;