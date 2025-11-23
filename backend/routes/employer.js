const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Employer = require('../models/Employer');
const Job = require('../models/Job');
const Application = require('../models/Application');

const { authEmployer } = require('../middleware/auth');

const router = express.Router();

// Employer register
router.post('/register', async (req, res) => {
  try {
    const { companyName, ownerName, sector, address, phone, email, password } = req.body;
    const existing = await Employer.findOne({ $or: [{ phone }, { email }] });
    if (existing) return res.status(400).json({ success: false, message: 'Phone or email already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const employer = new Employer({ companyName, ownerName, sector, address, phone, email, passwordHash });
    await employer.save();
    res.json({ success: true, message: 'Employer registered successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Employer login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    
    const employer = await Employer.findOne({ phone });
   
    if (!employer) return res.status(401).json({ success: false, message: 'Invalid credentialss' });

    const valid = await bcrypt.compare(password, employer.passwordHash);
    if (!valid) return res.status(401).json({ success: false, message: 'Invalid credentialsa' });

    const token = jwt.sign({ id: employer._id, role: 'employer' }, process.env.JWT_SECRET || 'secret123', { expiresIn: '7d' });
    res.json({
      success: true,
      token,
      employer: {
        id: employer._id,
        companyName: employer.companyName,
        ownerName: employer.ownerName,
        phone: employer.phone,
        email: employer.email
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get employer profile
router.get('/profile', authEmployer, async (req, res) => {
  try {
    const employer = await Employer.findById(req.employerId).select('-passwordHash');
    res.json({ success: true, employer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get employer's jobs
router.get('/me/jobs', authEmployer, async (req, res) => {
  try {
    const jobs = await Job.find({ employer: req.employerId }).sort({ createdAt: -1 });
    res.json({ success: true, jobs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get employer's applications
router.get('/me/applications', authEmployer, async (req, res) => {
  try {
    const applications = await Application.find({ employer: req.employerId })
      .populate('job', 'jobTitle workMode salaryOffered')
      .sort({ appliedAt: -1 });
    res.json({ success: true, applications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
