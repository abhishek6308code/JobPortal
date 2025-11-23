


// routes/jobs.js
const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Employer = require('../models/Employer');
const { authEmployer, authMaster } = require('../middleware/auth');

// Public: get accepted jobs (no auth)
router.get('/jobs', async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'Accepted' })
      .populate('employer', 'companyName')
      .sort({ createdAt: -1 });
   
    return res.json({ success: true, jobs });
  } catch (err) {
    console.error('GET /jobs error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// IMPORTANT: employer-specific route must come BEFORE the param route
// Get jobs for the currently authenticated employer (private)
router.get('/jobs/employer', authEmployer, async (req, res) => {
  try {  
    if (!req.employerId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: no employer id' });
    }

    const jobs = await Job.find({ employer: req.employerId })
      .populate('employer', 'companyName ownerName address')
      .sort({ createdAt: -1 });
    
    return res.json({ success: true, jobs });
  } catch (err) {
    console.error('GET /jobs/employer error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Get single job detail (with authorization to see non-accepted)
router.get('/jobs/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('employer', 'companyName ownerName address');
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    const token = req.headers.authorization?.split(' ')[1];
    let isAuthorized = false;
    if (token) {
      try {
        const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET || 'secret123');
        isAuthorized = decoded.role === 'master' || (decoded.role === 'employer' && (decoded.id === String(job.employer._id)));
      } catch (e) { /* invalid token -> not authorized */ }
    }

    if (job.status !== 'Accepted' && !isAuthorized) {
      return res.status(403).json({ success: false, message: 'Job not available' });
    }

    return res.json({ success: true, job });
  } catch (err) {
    console.error('GET /jobs/:id error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Create job (employer only)
router.post('/jobs', authEmployer, async (req, res) => {
  try {
    const employer = await Employer.findById(req.employerId);
    if (!employer) return res.status(401).json({ success: false, message: 'Employer not found' });

    const job = new Job({
      ...req.body,
      employer: req.employerId,
      companyName: employer.companyName,
      status: 'New'
    });
   
    await job.save();
  
    return res.json({ success: true, job });
  } catch (err) {
    console.error('POST /jobs error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Update job (only owner)
router.put('/jobs/:id', authEmployer, async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, employer: req.employerId });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });

    Object.assign(job, req.body);
    job.updatedAt = Date.now();
    await job.save();
    return res.json({ success: true, job });
  } catch (err) {
    console.error('PUT /jobs/:id error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Delete job (only owner) and its applications
router.delete('/jobs/:id', authEmployer, async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, employer: req.employerId });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });

    const Application = require('../models/Application');
    await Application.deleteMany({ job: req.params.id });

    return res.json({ success: true, message: 'Job deleted successfully' });
  } catch (err) {
    console.error('DELETE /jobs/:id error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
