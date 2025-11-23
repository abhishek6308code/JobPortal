// src/JobDetailsPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthContext } from '/src/contexts/AuthContext.jsx';

const API_URL = 'https://jobportalbackend-kpg7.onrender.com/api';

export default function JobDetailsPage({ job: initialJob = null, jobId: propJobId = null }) {
  const { token } = useContext(AuthContext);

  const [job, setJob] = useState(initialJob);
  const [loading, setLoading] = useState(!initialJob); // if we have initial job, not loading
  const [message, setMessage] = useState('');
  const [isOwner, setIsOwner] = useState(false); // whether logged-in employer owns this job

  // parse id from hash if prop not provided
  const idFromHash = () => {
    const h = window.location.hash || '';
    const parts = h.replace(/^#/, '').split('/');
    if (parts[0] === 'job-details' && parts[1]) return parts[1];
    return null;
  };

  useEffect(() => {
    // decide jobId priority: propJobId -> initialJob._id -> hash
    const id = propJobId || (initialJob && (initialJob._id || initialJob.id)) || idFromHash();
    if (!job && id) {
      fetchJobById(id);
    } else if (job) {
      checkOwnership(job);
    } else {
      setMessage('No job selected.');
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkOwnership = (j) => {
    if (!token) {
      setIsOwner(false);
      return;
    }
    try {
      // Try to infer owner from job.employer._id or job.employer
      const employerId = j?.employer?._id || j?.employer;
      // If token exists we cannot decode it here reliably without JWT decode lib,
      // so ownership will be inferred by letting backend tell us in job payload (recommended).
      // If backend returns job.employer populated, compare it to token-decoded id on backend.
      // For safety, we set isOwner = false here. Backend `GET /jobs/:id` will return full job
      // and allowed fields depending on token; so owner-only fields should be present when owner views.
      setIsOwner(false);
    } catch (e) {
      setIsOwner(false);
    }
  };

  const fetchJobById = async (id) => {
    if (!id) {
      setMessage('No job id provided.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${API_URL}/jobs/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      const contentType = res.headers.get('content-type') || '';
      const text = await res.text();

      if (!contentType.includes('application/json')) {
        setMessage('Server returned unexpected response when fetching job. See console.');
        console.warn('fetchJobById non-json:', text.slice(0, 800));
        setLoading(false);
        return;
      }

      const data = JSON.parse(text);
      if (!res.ok) {
        setMessage(data?.message || `Failed to load job (${res.status})`);
        setLoading(false);
        return;
      }

      if (data.success && data.job) {
        setJob(data.job);
        checkOwnership(data.job);
        setMessage('');
      } else {
        setMessage('Unexpected response from server.');
      }
      setLoading(false);
    } catch (err) {
      console.error('fetchJobById error', err);
      setMessage('Network error: ' + err.message);
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!job || !(job._id || job.id)) return;
    if (!confirm('Are you sure you want to delete this job?')) return;

    try {
      const res = await fetch(`${API_URL}/jobs/${job._id || job.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const contentType = res.headers.get('content-type') || '';
      let data = null;
      if (contentType.includes('application/json')) data = await res.json();
      else data = { message: await res.text() };

      if (!res.ok) {
        alert(data?.message || `Delete failed (${res.status})`);
        return;
      }

      alert('Job deleted successfully');
      // navigate to dashboard
      window.location.hash = 'dashboard';
    } catch (err) {
      console.error('delete error', err);
      alert('Network error: ' + err.message);
    }
  };

  const handleEdit = () => {
    // navigate to edit page with id and also set window.selectedJob so Edit form can prefill
    window.selectedJob = job;
    window.location.hash = `edit-job/${job._id || job.id}`;
  };

  // helper to render label/value with fallback keys
  const show = (label, ...keys) => {
    let val = null;
    for (const k of keys) {
      if (!k) continue;
      // nested key support e.g. 'employer.companyName'
      if (k.includes('.')) {
        const parts = k.split('.');
        let cur = job;
        for (const p of parts) {
          if (!cur) { cur = null; break; }
          cur = cur[p];
        }
        val = cur;
      } else {
        val = job?.[k] ?? null;
      }
      if (val !== null && val !== undefined && String(val).trim() !== '') break;
    }
    if (val === null || val === undefined || (typeof val === 'string' && val.trim() === '')) val = <span className="text-muted">—</span>;
    return (
      <div className="mb-2">
        <strong>{label}:</strong> {' '}
        <span>{val}</span>
      </div>
    );
  };

  if (loading) return <div className="p-4">Loading job details...</div>;

  return (
    <div className="container py-3">
      <div className="mb-3">
        <button className="btn btn-link" onClick={() => window.history.back()}>← Back</button>
      </div>

      {message && <div className="alert alert-warning">{message}</div>}

      {!job ? (
        <div className="alert alert-info">No job to display.</div>
      ) : (
        <div className="card shadow-sm">
          <div className="card-body">
            <h3 className="card-title mb-3">{job.jobTitle || 'Untitled Job'}</h3>

            <div className="mb-3">
              <small className="text-muted">Posted on: {job.createdAt ? new Date(job.createdAt).toLocaleString() : '—'}</small>
            </div>

            <div className="row">
              <div className="col-md-8">
                {show('Company', 'employer.companyName', 'companyName')}
                {show('Work Mode', 'workMode')}
                {show('Education', 'education', 'educationQualification')}
                {show('Additional Skill', 'additionalSkill')}
                {show('Salary', 'salaryOffered')}
                {show('Experience Required', 'experienceRequired')}
                {show('Location', 'location')}
                {show('Gender', 'gender')}
                {show('Status', 'status')}
                <div className="mb-3">
                  <strong>Job Description:</strong>
                  <div className="border rounded p-3 mt-2" style={{ whiteSpace: 'pre-wrap' }}>
                    {job.description || job.jobDescription || <span className="text-muted">No description provided.</span>}
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                {/* Additional right-hand info: contact / company / meta */}
                <div className="mb-3">
                  <h6>Employer</h6>
                  <p className="mb-1"><strong>Name:</strong> {job.employer?.ownerName || job.employer?.name || <span className="text-muted">—</span>}</p>
                  <p className="mb-1"><strong>Company:</strong> {job.employer?.companyName || <span className="text-muted">—</span>}</p>
                  <p className="mb-1"><strong>Address:</strong> {job.employer?.address || <span className="text-muted">—</span>}</p>
                </div>

                <div className="mb-3">
                  <h6>Actions</h6>
                  <div className="d-grid gap-2">
                    <button className="btn btn-primary" onClick={() => { window.location.hash = 'home'; }}>Browse Jobs</button>
                    {/* Show edit/delete only if token exists and employer likely owner — backend enforces ownership on update/delete */}
                    {/* <button className="btn btn-warning" onClick={handleEdit} disabled={!token}>Edit Job</button>
                    <button className="btn btn-danger" onClick={handleDelete} disabled={!token}>Delete Job</button> */}


                    {token && (
                      <>
                        <button className="btn btn-warning" onClick={handleEdit}>Edit Job</button>
                        <button className="btn btn-danger" onClick={handleDelete}>Delete Job</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
