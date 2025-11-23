import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function EmployerSignup() {
    const API_URL = 'https://jobportalbackend-kpg7.onrender.com/api';
  const [formData, setFormData] = useState({
    companyName: '', ownerName: '', workingSector: '', address: '',
    contactNo: '', contactNoConfirm: '', email: '', emailConfirm: '',
    password: '', passwordConfirm: ''
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');

//   const API_URL = 'http://localhost:5000/api';

const handleSubmit = async (e) => {
  e.preventDefault();
  setErrors({});
  setMessage('');

  const newErrors = {};
  if (formData.contactNo !== formData.contactNoConfirm) {
    newErrors.contactNo = 'Contact numbers do not match';
  }
  if (formData.email !== formData.emailConfirm) {
    newErrors.email = 'Emails do not match';
  }
  if (formData.password !== formData.passwordConfirm) {
    newErrors.password = 'Passwords do not match';
  }

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  // map frontend fields to backend expected fields
  const payload = {
    companyName: formData.companyName,
    ownerName: formData.ownerName,
    sector: formData.workingSector,
    address: formData.address,
    phone: formData.contactNo,
    email: formData.email,
    password: formData.password
  };

  try {
    const res = await fetch(`${API_URL}/employer/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    // if response is not JSON (HTML error page), read text for debugging
    const text = await res.text();
    try {
      const data = JSON.parse(text);
      if (res.ok) {
        // assume backend returns token or success object
        setMessage('Signup successful! Please login.');
        setTimeout(() => window.location.hash = 'employer-login', 1200);
      } else {
        setMessage(data.message || 'Signup failed');
      }
    } catch (parseErr) {
      // response was not JSON — show raw text (likely HTML error page)
      console.error('Non-JSON response from server:', text);
      setMessage('Server error (non-JSON). Check backend console / network tab.');
    }
  } catch (err) {
    setMessage('Network error: ' + err.message);
  }
};

  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <div className="card shadow">
          <div className="card-body">
            <h2 className="card-title text-center mb-4">Employer Signup</h2>
            {message && <div className={`alert ${message.includes('successful') ? 'alert-success' : 'alert-danger'}`}>{message}</div>}
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Company Name *</label>
                  <input type="text" className="form-control" required
                    value={formData.companyName}
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})} />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Owner Name *</label>
                  <input type="text" className="form-control" required
                    value={formData.ownerName}
                    onChange={(e) => setFormData({...formData, ownerName: e.target.value})} />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Working Sector *</label>
                  <input type="text" className="form-control" required
                    value={formData.workingSector}
                    onChange={(e) => setFormData({...formData, workingSector: e.target.value})} />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Address *</label>
                  <input type="text" className="form-control" required
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})} />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Contact No. *</label>
                  <input type="tel" className="form-control" required
                    value={formData.contactNo}
                    onChange={(e) => setFormData({...formData, contactNo: e.target.value})} />
                  {errors.contactNo && <small className="text-danger">{errors.contactNo}</small>}
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Confirm Contact No. *</label>
                  <input type="tel" className="form-control" required
                    value={formData.contactNoConfirm}
                    onChange={(e) => setFormData({...formData, contactNoConfirm: e.target.value})} />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Email *</label>
                  <input type="email" className="form-control" required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})} />
                  {errors.email && <small className="text-danger">{errors.email}</small>}
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Confirm Email *</label>
                  <input type="email" className="form-control" required
                    value={formData.emailConfirm}
                    onChange={(e) => setFormData({...formData, emailConfirm: e.target.value})} />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Password *</label>
                  <input type="password" className="form-control" required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})} />
                  {errors.password && <small className="text-danger">{errors.password}</small>}
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Confirm Password *</label>
                  <input type="password" className="form-control" required
                    value={formData.passwordConfirm}
                    onChange={(e) => setFormData({...formData, passwordConfirm: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary w-100">Sign Up</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
export default EmployerSignup;
