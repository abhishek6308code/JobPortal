// src/components/JobApplyModal.jsx
import React, { useState } from 'react';



export default function JobApplyModal({ show, job, onClose, onSuccess, apiBase = 'http://localhost:5000/api' }) {
  const emptyForm = {
    applicantName: '',
    phone: '',
    email: '',
    address: '',
    education: '',
    additionalSkill: '',
    gender: '',
    resumeUrl: ''
  };

  const [form, setForm] = useState(emptyForm);
  const [resumeFile, setResumeFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // simple 10-digit validation (India). Adjust if you need other formats.
  const isValidPhone = (p) => {
    if (!p) return false;
    const cleaned = p.replace(/\D/g, '');
    return cleaned.length === 10;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };
  const handleFile = e => setResumeFile(e.target.files[0] || null);

  const submit = async (ev) => {
    ev.preventDefault();
    setMsg({ type: '', text: '' });

    if (!form.applicantName || !form.email || !form.phone || !form.gender) {
      setMsg({ type: 'error', text: 'Please fill required fields.' });
      return;
    }
    if (!isValidPhone(form.phone)) {
      setMsg({ type: 'error', text: 'Please enter a valid 10-digit phone number.' });
      return;
    }

    setSubmitting(true);
    try {
      const jobId = job._id || job.id;
      const fd = new FormData();
      fd.append('applicantName', form.applicantName);
      fd.append('phone', form.phone);
      fd.append('email', form.email);
      fd.append('address', form.address || '');
      fd.append('education', form.education || '');
      fd.append('additionalSkill', form.additionalSkill || '');
      fd.append('gender', form.gender || '');
      if (form.resumeUrl) fd.append('resumeUrl', form.resumeUrl);
      if (resumeFile) fd.append('resume', resumeFile);

      const res = await fetch(`${apiBase}/jobs/${jobId}/apply`, {
        method: 'POST',
        body: fd
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const err = data?.message || `Failed to apply (${res.status})`;
        setMsg({ type: 'error', text: err });
        setSubmitting(false);
        return;
      }

      setMsg({ type: 'success', text: data?.message || 'Application submitted.' });
      onSuccess && onSuccess(data?.application ?? null);

      // clear form after success
      setForm(emptyForm);
      setResumeFile(null);
      // do NOT automatically close modal here — let parent decide. But we'll close shortly after so user sees toast.
      setTimeout(() => {
        setSubmitting(false);
        onClose && onClose();
      }, 700);
    } catch (err) {
      console.error('apply err', err);
      setMsg({ type: 'error', text: err?.message || 'Network error' });
      setSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div className="modal-content">
          <form onSubmit={submit}>
            <div className="modal-header">
              <h5 className="modal-title">Apply for: {job?.jobTitle || job?.title}</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={() => !submitting && onClose()}></button>
            </div>
            <div className="modal-body">
              {msg.text && (
                <div className={`alert ${msg.type === 'success' ? 'alert-success' : 'alert-danger'}`} role="alert">
                  {msg.text}
                </div>
              )}

              <div className="row g-2">
                <div className="col-md-6">
                  <label className="form-label">Full name *</label>
                  <input name="applicantName" className="form-control" required value={form.applicantName} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Phone *</label>
                  <input name="phone" className="form-control" required value={form.phone} onChange={handleChange} />
                  <div className="form-text">Enter 10-digit phone (numbers only). Example: 9876543210</div>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Email *</label>
                  <input name="email" type="email" className="form-control" required value={form.email} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Gender *</label>
                  <select name="gender" className="form-select" required value={form.gender} onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div className="col-md-12">
                  <label className="form-label">Address</label>
                  <input name="address" className="form-control" value={form.address} onChange={handleChange} />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Education</label>
                  <select name="education" className="form-select" value={form.education} onChange={handleChange}>
                    <option value="">Select (optional)</option>
                    <option value="10 Pass">10 Pass</option>
                    <option value="12 Pass">12 Pass</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Master">Master</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Additional Skill</label>
                  <input name="additionalSkill" className="form-control" value={form.additionalSkill} onChange={handleChange} />
                </div>

                <div className="col-md-8">
                  <label className="form-label">Resume link (optional)</label>
                  <input name="resumeUrl" className="form-control" placeholder="https://..." value={form.resumeUrl} onChange={handleChange} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Upload resume</label>
                  <input name="resume" type="file" accept=".pdf,.doc,.docx" className="form-control" onChange={handleFile} />
                  <div className="form-text">File will be used instead of link if provided.</div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => !submitting && onClose()} disabled={submitting}>Close</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
