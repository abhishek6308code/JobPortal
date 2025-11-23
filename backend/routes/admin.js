
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Job = require('../models/Job');
const { authMaster } = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

// Admin signup (optional: you might seed admin in prod rather than exposing signup)
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success:false, message: 'Missing fields' });

    const existing = await Admin.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ success:false, message: 'Admin already exists' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const admin = new Admin({ name, email: email.toLowerCase(), passwordHash, role: 'master' });
    await admin.save();

    const token = jwt.sign({ id: admin._id, role: admin.role }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ success: true, token, admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role } });
  } catch (err) {
    console.error('Admin signup error', err);
    return res.status(500).json({ success:false, message: err.message });
  }
});

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success:false, message: 'Missing fields' });

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) return res.status(401).json({ success:false, message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, admin.passwordHash);
    if (!ok) return res.status(401).json({ success:false, message: 'Invalid credentials' });

    const token = jwt.sign({ id: admin._id, role: admin.role }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ success: true, token, admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role } });
  } catch (err) {
    console.error('Admin login error', err);
    return res.status(500).json({ success:false, message: err.message });
  }
});

// Protected: list all jobs (admin)
router.get('/jobs', authMaster, async (req, res) => {
  try {
    const jobs = await Job.find().populate('employer', 'companyName ownerName address').sort({ createdAt: -1 });
    return res.json({ success: true, jobs });
  } catch (err) {
    console.error('Admin GET /jobs error', err);
    return res.status(500).json({ success:false, message: err.message });
  }
});

// Protected: update job status
router.put('/jobs/:id/status', authMaster, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['New','Accepted','Rejected'].includes(status)) {
      return res.status(400).json({ success:false, message: 'Invalid status' });
    }

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success:false, message: 'Job not found' });

    job.status = status;
    job.updatedAt = Date.now();
    await job.save();

    // optionally: notify employer, etc
    return res.json({ success: true, job });
  } catch (err) {
    console.error('Admin PUT job status error', err);
    return res.status(500).json({ success:false, message: err.message });
  }
});

module.exports = router;
