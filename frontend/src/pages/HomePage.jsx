

// src/HomePage.jsx
import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import JobApplyModal from './JobApplyModel';

const API_URL = 'https://jobportalbackend-kpg7.onrender.com/api';

export default function HomePage({ viewJobDetails } = {}) {
  const [jobs, setJobs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [q, setQ] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  // modal/toast state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [currentJob, setCurrentJob] = useState(null);
  const [appliedLocalMap, setAppliedLocalMap] = useState({});
  const [toast, setToast] = useState({ show: false, text: '' });

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobs, q, locationFilter]);

  const fetchJobs = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${API_URL}/jobs`);
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const txt = await res.text();
        console.warn('GET /api/jobs non-json:', txt.slice(0,400));
        setMessage('Server returned unexpected response. Check backend.');
        setJobs([]);
        setFiltered([]);
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setMessage(data?.message || `Failed to load jobs (${res.status})`);
        setJobs([]);
        setFiltered([]);
        setLoading(false);
        return;
      }
      const list = Array.isArray(data) ? data : (data.jobs || []);
      setJobs(list);
      setFiltered(list);
      setLoading(false);
    } catch (err) {
      console.error('fetchJobs error', err);
      setMessage('Network error: ' + err.message);
      setJobs([]);
      setFiltered([]);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const qLower = q.trim().toLowerCase();
    const locLower = locationFilter.trim().toLowerCase();
    let list = jobs.filter(job => {
      if (job.status && job.status !== 'Accepted') return false;

      if (qLower) {
        const title = (job.jobTitle || job.title || '').toLowerCase();
        const skill = (job.additionalSkill || '').toLowerCase();
        if (!title.includes(qLower) && !skill.includes(qLower)) return false;
      }
      if (locLower) {
        const loc = (job.location || '').toLowerCase();
        if (!loc.includes(locLower)) return false;
      }
      return true;
    });

    setFiltered(list);
  };

  const handleApply = (job) => {
    setCurrentJob(job);
    setShowApplyModal(true);
  };

  const onApplySuccess = (application) => {
    // mark local job as applied
    const jobId = currentJob?._id || currentJob?.id;
    setAppliedLocalMap(prev => ({ ...prev, [jobId]: true }));
    setToast({ show: true, text: 'Application submitted successfully' });
  };

  const closeModal = () => {
    setShowApplyModal(false);
    setCurrentJob(null);
  };

  // UI (kept most of your original layout)
  return (
    <div className="container py-4">
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <h3 className="mb-0">Available Jobs</h3>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <form className="row g-2 align-items-center" onSubmit={(e)=>e.preventDefault()}>
            <div className="col-sm-5">
              <input
                className="form-control"
                placeholder="Search by title or skill (e.g., Web Developer)"
                value={q}
                onChange={(e)=>setQ(e.target.value)}
              />
            </div>
            <div className="col-sm-4">
              <input
                className="form-control"
                placeholder="Filter by location (city, state)"
                value={locationFilter}
                onChange={(e)=>setLocationFilter(e.target.value)}
              />
            </div>
            <div className="col-sm-3 d-grid">
              <button type="button" className="btn btn-outline-secondary" onClick={() => { setQ(''); setLocationFilter(''); setFiltered(jobs); }}>
                Reset filters
              </button>
            </div>
          </form>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div>
        </div>
      ) : message ? (
        <div className="alert alert-warning">{message}</div>
      ) : filtered.length === 0 ? (
        <div className="alert alert-info">No jobs found.</div>
      ) : (
        <div className="row">
          {filtered.map(job => {
            const jobId = job._id || job.id;
            const appliedLocally = !!appliedLocalMap[jobId];
            return (
              <div key={jobId} className="col-md-4 mb-4">
                <div className="card h-100 shadow-sm">
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">{job.jobTitle || job.title || 'Untitled Job'}</h5>
                    <p className="card-subtitle mb-2 text-muted">{job.companyName || job.employer?.companyName || 'Company'}</p>
                    <p className="mb-1"><strong>Work Mode:</strong> {job.workMode || '—'}</p>
                    <p className="mb-1"><strong>Skill:</strong> {job.additionalSkill || '—'}</p>
                    <p className="mb-1"><strong>Education:</strong> {job.education || '—'}</p>
                    <p className="mb-1"><strong>Location:</strong> {job.location || '—'}</p>
                    <p className="mb-3 text-primary"><strong>Salary:</strong> {job.salaryOffered ? `₹${job.salaryOffered}` : '—'}</p>

                    <div className="mt-auto d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleApply(job)}
                        disabled={appliedLocally}
                        title={appliedLocally ? 'You already applied (locally)' : 'Apply for this job'}
                      >
                        {appliedLocally ? 'Applied' : 'Apply'}
                      </button>
                      <a className="btn btn-sm btn-outline-secondary" href={`#job-details/${jobId}`}>View Job Details</a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Apply modal */}
      <JobApplyModal
        show={showApplyModal}
        job={currentJob}
        onClose={closeModal}
        onSuccess={onApplySuccess}
        apiBase={API_URL}
      />

      {/* Toast (Bootstrap) */}
      <div style={{ position: 'fixed', right: 20, bottom: 20, zIndex: 1060 }}>
        <div className={`toast ${toast.show ? 'show' : ''}`} role="alert" aria-live="assertive" aria-atomic="true">
          <div className="toast-header">
            <strong className="me-auto">Job Portal</strong>
            <button type="button" className="btn-close" onClick={() => setToast({ show: false, text: '' })}></button>
          </div>
          <div className="toast-body">{toast.text}</div>
        </div>
      </div>
    </div>
  );
}
