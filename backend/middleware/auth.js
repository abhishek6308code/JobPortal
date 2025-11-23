const jwt = require('jsonwebtoken');
const Employer = require('../models/Employer');
const Admin = require('../models/Admin');
const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

async function authEmployer(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ success: false, message: 'No authorization header' });

  const token = header.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Missing token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    // adjust property names to match your token payload
    const employerId = decoded.id || decoded._id || decoded.userId;
    const role = decoded.role;

    if (!employerId || role !== 'employer') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    // (optional) verify employer exists
    const emp = await Employer.findById(employerId);
    if (!emp) return res.status(401).json({ success: false, message: 'Employer not found' });

    req.employerId = employerId.toString();
    req.role = role;
    next();
  } catch (err) {
    console.error('authEmployer error', err);
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
}



async function authMaster(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ success: false, message: 'No authorization header' });
  const token = header.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Missing token' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // allow role 'master' or 'admin'
    if (!decoded || (decoded.role !== 'master' && decoded.role !== 'admin')) {
      return res.status(403).json({ success: false, message: 'Forbidden: admin only' });
    }
    // optional: verify admin exists
    const adminId = decoded.id || decoded._id || decoded.userId;
    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(401).json({ success: false, message: 'Admin not found' });

    req.adminId = adminId.toString();
    req.role = decoded.role;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
}

module.exports = { authEmployer, authMaster };
