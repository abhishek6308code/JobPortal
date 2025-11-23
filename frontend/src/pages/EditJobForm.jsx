import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthContext } from "/src/contexts/AuthContext.jsx";

const API_URL = 'http://localhost:5000/api';
export default function EditJobForm() {
  const job = window.selectedJob;
  const [formData, setFormData] = useState(job || {});
  const [message, setMessage] = useState('');
  const { token } = React.useContext(AuthContext);

  if (!job) {
    return <div className="alert alert-warning">No job selected for editing.</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await fetch(`${API_URL}/jobs/${job._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.success) {
        setMessage('Job updated successfully!');
        setTimeout(() => window.location.hash = 'dashboard', 2000);
      } else {
        setMessage(data.message || 'Failed to update job');
      }
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <div className="card shadow">
          <div className="card-body">
            <h2 className="card-title text-center mb-4">Edit Job</h2>
            {message && <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-danger'}`}>{message}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Job Title *</label>
                <input type="text" className="form-control" required
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({...formData, jobTitle: e.target.value})} />
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Work Mode *</label>
                  <select className="form-select" required value={formData.workMode}
                    onChange={(e) => setFormData({...formData, workMode: e.target.value})}>
                    <option value="Part Time">Part Time</option>
                    <option value="Full Time">Full Time</option>
                    <option value="Fresher">Fresher</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Education Qualification *</label>
                  <select className="form-select" required value={formData.educationQualification}
                    onChange={(e) => setFormData({...formData, educationQualification: e.target.value})}>
                    <option value="10 Pass">10 Pass</option>
                    <option value="12 Pass">12 Pass</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Master">Master</option>
                  </select>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Additional Skill *</label>
                  <select className="form-select" required value={formData.additionalSkill}
                    onChange={(e) => setFormData({...formData, additionalSkill: e.target.value})}>
                    <option value="Social Media Marketing">Social Media Marketing</option>
                    <option value="Content Writer">Content Writer</option>
                    <option value="HR">HR</option>
                    <option value="Web Developer">Web Developer</option>
                    <option value="App Developer">App Developer</option>
                    <option value="Doctor">Doctor</option>
                    <option value="Nurse">Nurse</option>
                    <option value="Teacher">Teacher</option>
                    <option value="Yoga">Yoga</option>
                    <option value="Accountant">Accountant</option>
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Salary Offered (₹) *</label>
                  <input type="number" className="form-control" required
                    value={formData.salaryOffered}
                    onChange={(e) => setFormData({...formData, salaryOffered: e.target.value})} />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Location *</label>
                  <input type="text" className="form-control" required
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})} />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Experience Required</label>
                  <input type="text" className="form-control"
                    value={formData.experienceRequired}
                    onChange={(e) => setFormData({...formData, experienceRequired: e.target.value})} />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Job Description</label>
                <textarea className="form-control" rows="4"
                  value={formData.jobDescription}
                  onChange={(e) => setFormData({...formData, jobDescription: e.target.value})}></textarea>
              </div>
              <div className="d-grid gap-2">
                <button type="submit" className="btn btn-primary">Update Job</button>
                <a href="#dashboard" className="btn btn-secondary">Cancel</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}