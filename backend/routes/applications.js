const express = require('express');
const Application = require('../models/Application');
const Job = require('../models/Job');
const upload = require('../utils/uploads');

const router = express.Router();

// Apply to job (public)
router.post('/jobs/:id/apply', upload.single('resume'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job || job.status !== 'Accepted') {
      return res.status(404).json({ success: false, message: 'Job not available' });
    }

    const { applicantName, phone, email, address, education, additionalSkill, gender } = req.body;

    // Check for duplicate application by job+phone or job+email
    const existingApp = await Application.findOne({
      job: req.params.id,
      $or: [{ phone }, { email }]
    });

    if (existingApp) {
      return res.status(400).json({ success: false, message: 'You have already applied to this job with this phone or email' });
    }

    const application = new Application({
      job: req.params.id,
      employer: job.employer,
      applicantName,
      phone,
      email,
      address,
      education,
      additionalSkill,
      gender,
      resumeUrl: req.file ? `/uploads/${req.file.filename}` : null
    });
await application.save();

    // Emit a socket event to the employer room so employer dashboards get real-time update
    try {
      const io = req.app.get('io');
      if (io && job.employer) {
        // send the full application (or minimal data) — employer side will receive and update
        io.to(String(job.employer)).emit('new_application', { application, jobId: job._id });
      }
    } catch (e) {
      console.error('socket emit error', e);
    }

    res.json({ success: true, message: 'Application submitted successfully', application });
    // await application.save();
    // res.json({ success: true, message: 'Application submitted successfully', application });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already applied to this job' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
