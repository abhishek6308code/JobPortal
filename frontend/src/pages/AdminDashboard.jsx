// src/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
const API_URL = 'http://localhost:5000/api';

export default function AdminDashboard() {
  const [jobs, setJobs] = useState([]);
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setMessage('');
    try {
      const res = await fetch(`${API_URL}/admin/jobs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const txt = await res.text();
        console.warn('admin/jobs non-json:', txt.slice(0,400));
        setMessage('Server returned unexpected response.');
        return;
      }
      const data = await res.json();
      if (!res.ok) { setMessage(data?.message || `Error ${res.status}`); return; }
      setJobs(data.jobs || []);
    } catch (err) {
      console.error('fetchJobs error', err);
      setMessage('Network error: ' + err.message);
    }
  };

  const changeStatus = async (jobId, status) => {
    if (!confirm(`Set status to "${status}"?`)) return;
    try {
      const res = await fetch(`${API_URL}/admin/jobs/${jobId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok) { alert(data?.message || `Failed (${res.status})`); return; }
      setJobs(jobs.map(j => j._id === jobId ? data.job : j));
    } catch (err) {
      console.error('changeStatus error', err);
      alert('Network error: ' + err.message);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Admin Dashboard — All Jobs</h2>
        <button className="btn btn-secondary" onClick={() => { localStorage.removeItem('adminToken'); localStorage.removeItem('admin'); window.location.hash = 'admin-login'; }}>Logout</button>
      </div>

      {message && <div className="alert alert-warning">{message}</div>}

      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Job Title</th>
              <th>Employer</th>
              <th>Created</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 ? (
              <tr><td colSpan="5" className="text-center text-muted">No jobs found</td></tr>
            ) : jobs.map(job => (
              <tr key={job._id}>
                <td>{job.jobTitle}</td>
                <td>{job.employer?.companyName || job.companyName || '—'}</td>
                <td>{new Date(job.createdAt).toLocaleString()}</td>
                <td>{job.status}</td>
                <td>
                  <div className="btn-group">
                    <button className="btn btn-sm btn-success" onClick={() => changeStatus(job._id, 'Accepted')}>Accept</button>
                    <button className="btn btn-sm btn-danger" onClick={() => changeStatus(job._id, 'Rejected')}>Reject</button>
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => changeStatus(job._id, 'New')}>Set New</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
