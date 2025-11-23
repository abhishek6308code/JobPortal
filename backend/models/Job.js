const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  employer: { type: mongoose.Schema.Types.ObjectId, ref: 'Employer', required: true },
  companyName: String,
  jobTitle: { type: String, required: true },
  workMode: { 
    type: String, 
    enum: ['Part Time', 'Full Time', 'Remote', 'Hybrid', 'Day Shift', 'Night Shift'],
    required: true 
  },
  location: String,
  education: { 
    type: String, 
    enum: ['10 Pass', '12 Pass', 'Graduate', 'Master']
  },
  additionalSkill: {
    type: String,
    enum: ['Social Media Marketing', 'Content Writer', 'HR', 'Web Developer', 
           'App Developer', 'Doctor', 'Nurse', 'Teacher', 'Yoga', 'Accountant']
  },
  salaryOffered: { type: Number },
  experienceRequired: { type: String , default: '0' },
  gender: {
    type: String,
    enum: ['Male Only', 'Female Only', 'Both'],
    default: 'Both'
  },
  status: {
    type: String,
    enum: ['New', 'Accepted', 'Rejected'],
    default: 'New'
  },
  description: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', jobSchema);
