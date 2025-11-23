const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  employer: { type: mongoose.Schema.Types.ObjectId, ref: 'Employer', required: true },
  applicantName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  address: String,
  education: {
    type: String,
    enum: ['10 Pass', '12 Pass', 'Graduate', 'Master']
  },
  additionalSkill: String,
  gender: {
    type: String,
    enum: ['Male', 'Female'],
    required: true
  },
  resumeUrl: String,
  appliedAt: { type: Date, default: Date.now }
});

// Prevent duplicates by job+phone or job+email
applicationSchema.index({ job: 1, phone: 1 }, { unique: true });
applicationSchema.index({ job: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
