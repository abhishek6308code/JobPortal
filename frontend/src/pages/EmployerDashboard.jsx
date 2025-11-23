


// src/pages/EmployerDashboard.jsx
import React, { useState, useEffect, useContext, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthContext } from '/src/contexts/AuthContext.jsx';
import io from 'socket.io-client';

const API_URL = 'http://localhost:5000/api';
const SOCKET_BASE = 'http://localhost:5000'; // <-- fixed (no /api)

export default function EmployerDashboard() {
  const [message, setMessage] = useState('');
  const [jobs, setJobs] = useState([]);
  const [activeTab, setActiveTab] = useState('jobs');
  const { token } = useContext(AuthContext);

  // applications state
  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [appsError, setAppsError] = useState('');

  // socket and employerId refs (persist between renders)
  const socketRef = useRef(null);
  const employerIdRef = useRef(localStorage.getItem('employerId') || null);

  // toast/notification for incoming applications
  const [toast, setToast] = useState({ show: false, text: '' });

  // when token appears/changes -> load profile (to get employerId) then jobs
  useEffect(() => {
    if (!token) {
      setJobs([]);
      setMessage('Please login to view your jobs.');
      disconnectSocket();
      return;
    }

    // fetch employer profile first to learn employer id & then jobs
    (async () => {
      setMessage('Loading your profile & jobs...');
      try {
        const profileRes = await fetch(`${API_URL}/employer/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const profileCt = profileRes.headers.get('content-type') || '';
        if (!profileCt.includes('application/json')) {
          const txt = await profileRes.text();
          console.warn('profile non-json:', txt?.slice?.(0,200));
        }
        const profileData = await profileRes.json().catch(() => null);
        if (!profileRes.ok) {
          // profile failed (maybe token expired)
          setMessage(profileData?.message || `Unable to fetch profile (${profileRes.status})`);
          setJobs([]);
          return;
        }

        const employerId = profileData?.employer?._id || profileData?.employer?.id || profileData?.employerId;
        if (employerId) {
          employerIdRef.current = employerId;
          try { localStorage.setItem('employerId', String(employerId)); } catch (e) { /* ignore */ }
        }

        // then fetch jobs
        await fetchJobs();
        setMessage('');
        // connect socket if we have employerId
        if (employerIdRef.current && !socketRef.current) connectSocket(employerIdRef.current);
      } catch (err) {
        console.error('profile/jobs load error', err);
        setMessage('Network error: ' + err.message);
        setJobs([]);
      }
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    return () => {
      disconnectSocket();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // fetch employer jobs (uses endpoint your backend exposes)
  const fetchJobs = async () => {
    try {
      const res = await fetch(`${API_URL}/employer/me/jobs`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const txt = await res.text();
        console.warn('fetchJobs non-json:', txt.slice(0,200));
        setMessage('Server did not return JSON. Check backend logs.');
        setJobs([]);
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        setMessage(data?.message || `Failed to load jobs (${res.status})`);
        setJobs([]);
        return;
      }

      let jobList = [];
      if (data.success && Array.isArray(data.jobs)) jobList = data.jobs;
      else if (Array.isArray(data)) jobList = data;
      else if (Array.isArray(data.jobs)) jobList = data.jobs;
      else {
        jobList = [];
        console.warn('Unexpected fetchJobs shape:', data);
      }

      setJobs(jobList);
      setMessage('');
    } catch (err) {
      console.error('fetchJobs error', err);
      setMessage('Network error: ' + err.message);
      setJobs([]);
    }
  };

  // delete job
  const deleteJob = async (jobId) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    try {
      const res = await fetch(`${API_URL}/jobs/${jobId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const contentType = res.headers.get('content-type') || '';
      let data = null;
      if (contentType.includes('application/json')) data = await res.json();
      else data = { message: await res.text() };

      if (!res.ok) {
        alert(data?.message || `Failed to delete (${res.status})`);
        return;
      }

      alert('Job deleted successfully');
      fetchJobs();
    } catch (err) {
      console.error('deleteJob error', err);
      alert('Network error: ' + err.message);
    }
  };

  // ---------- Applications ----------

  const fetchApplications = async () => {
    setAppsLoading(true);
    setAppsError('');
    try {
      // use the correct endpoint for employer applications
      const res = await fetch(`${API_URL}/employer/me/applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const txt = await res.text();
        console.warn('fetchApplications non-json:', txt?.slice?.(0,200));
        setAppsError('Server did not return JSON. Check backend logs.');
        setApplications([]);
        setAppsLoading(false);
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        setAppsError(data?.message || `Failed to load applications (${res.status})`);
        setApplications([]);
        setAppsLoading(false);
        return;
      }

      const list = data?.applications ?? data ?? [];
      setApplications(Array.isArray(list) ? list : []);
      setAppsLoading(false);
    } catch (err) {
      console.error('fetchApplications error', err);
      setAppsError('Network error: ' + err.message);
      setApplications([]);
      setAppsLoading(false);
    }
  };

  // call fetchApplications when user switches to applications tab
  useEffect(() => {
    if (activeTab === 'applications' && token) {
      fetchApplications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, token]);

  // connect socket and join employer room
  const connectSocket = (employerId) => {
    try {
      // ensure we only create one socket
      if (socketRef.current) return;

      socketRef.current = io(SOCKET_BASE, { transports: ['websocket'] });

      socketRef.current.on('connect', () => {
        socketRef.current.emit('joinEmployerRoom', String(employerId));
      });

      socketRef.current.on('new_application', (payload) => {
        const app = payload?.application ?? payload;
        if (!app) return;
        // prepend application to list
        setApplications(prev => [app, ...prev]);
        // show toast
        setToast({ show: true, text: `New application received${payload?.jobId ? ` for job ${payload.jobId}` : ''}` });
      });

      socketRef.current.on('disconnect', () => {
        
      });

      socketRef.current.on('connect_error', (err) => {
        console.warn('socket connect_error', err);
      });
    } catch (err) {
      console.error('connectSocket error', err);
    }
  };

  const disconnectSocket = () => {
    try {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    } catch (err) {
      console.error('disconnectSocket error', err);
    }
  };

  // close toast after few seconds
  useEffect(() => {
    if (!toast.show) return;
    const id = setTimeout(() => setToast({ show: false, text: '' }), 3800);
    return () => clearTimeout(id);
  }, [toast]);

  // ---------- UI ----------
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Employer Dashboard</h2>
        <a href="#post-job" className="btn btn-primary">Post New Job</a>
      </div>

      {message && <div className="alert alert-info">{message}</div>}

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'jobs' ? 'active' : ''}`} onClick={() => setActiveTab('jobs')}>
            My Jobs ({jobs.length})
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'applications' ? 'active' : ''}`} onClick={() => setActiveTab('applications')}>
            Applications ({applications.length})
          </button>
        </li>
      </ul>

      {activeTab === 'jobs' &&
        <div className="row">
          {jobs.length === 0 ? (
            <div className="col-12"><p className="text-muted">No jobs posted yet.</p></div>
          ) : (
            jobs.map(job => (
              <div key={job._id || job.id} className="col-md-4 mb-3">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">{job.jobTitle || job.title}</h5>
                    <p className="mb-1"><strong>Work Mode:</strong> {job.workMode || '—'}</p>
                    <p className="mb-1"><strong>Education:</strong> {job.educationQualification || job.education || '—'}</p>
                    <p className="mb-3"><strong>Salary:</strong> ₹{job.salaryOffered ?? '—'}</p>
                    <p className="mb-1"><strong>Status:</strong> {job.status}</p>
                    <p className="mb-3"><strong>Posted On:</strong> {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : '-'}</p>
                    <div className="d-grid gap-2">
                      <button className="btn btn-sm btn-info" onClick={() => { window.selectedJob = job; window.location.hash = `job-details/${job._id || job.id}`; }}>View Details</button>
                      <button className="btn btn-sm btn-warning" onClick={() => { window.selectedJob = job; window.location.hash = `edit-job/${job._id || job.id}`; }}>Edit Job</button>
                      <button className="btn btn-sm btn-danger" onClick={() => deleteJob(job._id || job.id)}>Delete Job</button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      }

      {activeTab === 'applications' &&
        <div>
          {appsLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div>
            </div>
          ) : appsError ? (
            <div className="alert alert-danger">{appsError}</div>
          ) : applications.length === 0 ? (
            <div className="alert alert-info">No applications yet.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-bordered">
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Job</th>
                    <th>Education</th>
                    <th>Skills</th>
                    <th>Resume</th>
                    <th>Applied At</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map(app => (
                    <tr key={app._id || app.id}>
                      <td>{app.applicantName}</td>
                      <td>{app.email}</td>
                      <td>{app.phone}</td>
                      <td>{app.job?.jobTitle ?? app.job?.title ?? app.jobTitle ?? app.job}</td>
                      <td>{app.education ?? '-'}</td>
                      <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={app.additionalSkill}>{app.additionalSkill ?? '-'}</td>
                      <td>{app.resumeUrl ? <a href={app.resumeUrl} target="_blank" rel="noreferrer">View</a> : '—'}</td>
                      <td>{app.appliedAt ? new Date(app.appliedAt).toLocaleString() : (app.createdAt ? new Date(app.createdAt).toLocaleString() : '-')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      }

      {/* toast notification */}
      <div style={{ position: 'fixed', right: 20, bottom: 20, zIndex: 1060 }}>
        <div className={`toast ${toast.show ? 'show' : ''}`} role="alert" aria-live="assertive" aria-atomic="true">
          <div className="toast-header">
            <strong className="me-auto">Employer Dashboard</strong>
            <button type="button" className="btn-close" onClick={() => setToast({ show: false, text: '' })}></button>
          </div>
          <div className="toast-body">{toast.text}</div>
        </div>
      </div>
    </div>
  );
}
