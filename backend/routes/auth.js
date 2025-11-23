const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Employer = require('../models/Employer');
const router = express.Router();

// Register employer
router.post('/register', async (req, res) => {
  try {
    const { companyName, ownerName, sector, address, phone, email, password } = req.body;
    if (!companyName || !ownerName || !phone || !email || !password) return res.status(400).json({ message: 'Missing required fields' });

    const existing = await Employer.findOne({ $or: [{ phone }, { email }] });
    if (existing) return res.status(400).json({ message: 'Phone or email already registered' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const employer = new Employer({ companyName, ownerName, sector, address, phone, email, passwordHash });
    await employer.save();

    const token = jwt.sign({ id: employer._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, employer: { id: employer._id, companyName: employer.companyName, phone: employer.phone, email: employer.email } });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Login employer
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) return res.status(400).json({ message: 'Enter phone and password' });
    const emp = await Employer.findOne({ phone });
    if (!emp) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, emp.passwordHash);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: emp._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, employer: { id: emp._id, companyName: emp.companyName, phone: emp.phone, email: emp.email } });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
