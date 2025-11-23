import React, { useState, useEffect } from 'react';

import Routes from './pages/Routes.jsx';
import Navbar from './pages/Navbar.jsx';

import 'bootstrap/dist/css/bootstrap.min.css';

// API Base URL - Update this to your backend URL
const API_URL = 'http://localhost:5000/api';

// Auth Context
const AuthContext = React.createContext();

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      fetch(`${API_URL}/employer/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) setUser(data.employer);
        })
        .catch(() => setToken(null));
    }
  }, [token]);

  const login = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('token', newToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      <div className="min-vh-100 bg-light">
        <Navbar />
        <Routes />
      </div>
    </AuthContext.Provider>
  );
}

// function Navbar() {
//   const { user, logout } = React.useContext(AuthContext);

//   return (
//     <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow">
//       <div className="container">
//         <a className="navbar-brand fw-bold" href="#home">JobPortal</a>
//         <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
//           <span className="navbar-toggler-icon"></span>
//         </button>
//         <div className="collapse navbar-collapse" id="navbarNav">
//           <ul className="navbar-nav ms-auto">
//             <li className="nav-item">
//               <a className="nav-link" href="#home">Home</a>
//             </li>
//             {!user ? (
//               <>
//                 <li className="nav-item">
//                   <a className="nav-link" href="#employer-signup">Employer Signup</a>
//                 </li>
//                 <li className="nav-item">
//                   <a className="nav-link" href="#employer-login">Employer Login</a>
//                 </li>
//               </>
//             ) : (
//               <>
//                 <li className="nav-item">
//                   <a className="nav-link" href="#dashboard">Dashboard</a>
//                 </li>
//                 <li className="nav-item">
//                   <span className="nav-link">Welcome, {user.ownerName}</span>
//                 </li>
//                 <li className="nav-item">
//                   <button className="btn btn-outline-light btn-sm" onClick={logout}>Logout</button>
//                 </li>
//               </>
//             )}
//           </ul>
//         </div>
//       </div>
//     </nav>
//   );
// }

// function Routes() {
//   const [currentPage, setCurrentPage] = useState('home');
//   const [selectedJob, setSelectedJob] = useState(null);
//   const { user } = React.useContext(AuthContext);

//   useEffect(() => {
//     const handleHashChange = () => {
//       const hash = window.location.hash.substring(1) || 'home';
//       setCurrentPage(hash);
//       setSelectedJob(null);
//     };

//     window.addEventListener('hashchange', handleHashChange);
//     handleHashChange();

//     return () => window.removeEventListener('hashchange', handleHashChange);
//   }, []);

//   const viewJobDetails = (job) => {
//     setSelectedJob(job);
//     setCurrentPage('job-details');
//   };

//   const pages = {
//     'home': <HomePage viewJobDetails={viewJobDetails} />,
//     'employer-signup': <EmployerSignup />,
//     'employer-login': <EmployerLogin />,
//     'dashboard': user ? <EmployerDashboard /> : <EmployerLogin />,
//     'post-job': user ? <PostJobForm /> : <EmployerLogin />,
//     'edit-job': user ? <EditJobForm job={selectedJob} /> : <EmployerLogin />,
//     'job-details': <JobDetailsPage job={selectedJob} />,
//   };

//   return <div className="container py-4">{pages[currentPage] || pages['home']}</div>;
// }

// function EmployerSignup() {
//   const [formData, setFormData] = useState({
//     companyName: '', ownerName: '', workingSector: '', address: '',
//     contactNo: '', contactNoConfirm: '', email: '', emailConfirm: '',
//     password: '', passwordConfirm: ''
//   });
//   const [errors, setErrors] = useState({});
//   const [message, setMessage] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setErrors({});
//     setMessage('');

//     const newErrors = {};
//     if (formData.contactNo !== formData.contactNoConfirm) {
//       newErrors.contactNo = 'Contact numbers do not match';
//     }
//     if (formData.email !== formData.emailConfirm) {
//       newErrors.email = 'Emails do not match';
//     }
//     if (formData.password !== formData.passwordConfirm) {
//       newErrors.password = 'Passwords do not match';
//     }

//     if (Object.keys(newErrors).length > 0) {
//       setErrors(newErrors);
//       return;
//     }

//     try {
//       const res = await fetch(`${API_URL}/employer/signup`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData)
//       });
//       const data = await res.json();
      
//       if (data.success) {
//         setMessage('Signup successful! Please login.');
//         setTimeout(() => window.location.hash = 'employer-login', 2000);
//       } else {
//         setMessage(data.message || 'Signup failed');
//       }
//     } catch (err) {
//       setMessage('Error: ' + err.message);
//     }
//   };

//   return (
//     <div className="row justify-content-center">
//       <div className="col-md-8">
//         <div className="card shadow">
//           <div className="card-body">
//             <h2 className="card-title text-center mb-4">Employer Signup</h2>
//             {message && <div className={`alert ${message.includes('successful') ? 'alert-success' : 'alert-danger'}`}>{message}</div>}
//             <form onSubmit={handleSubmit}>
//               <div className="row">
//                 <div className="col-md-6 mb-3">
//                   <label className="form-label">Company Name *</label>
//                   <input type="text" className="form-control" required
//                     value={formData.companyName}
//                     onChange={(e) => setFormData({...formData, companyName: e.target.value})} />
//                 </div>
//                 <div className="col-md-6 mb-3">
//                   <label className="form-label">Owner Name *</label>
//                   <input type="text" className="form-control" required
//                     value={formData.ownerName}
//                     onChange={(e) => setFormData({...formData, ownerName: e.target.value})} />
//                 </div>
//               </div>
//               <div className="row">
//                 <div className="col-md-6 mb-3">
//                   <label className="form-label">Working Sector *</label>
//                   <input type="text" className="form-control" required
//                     value={formData.workingSector}
//                     onChange={(e) => setFormData({...formData, workingSector: e.target.value})} />
//                 </div>
//                 <div className="col-md-6 mb-3">
//                   <label className="form-label">Address *</label>
//                   <input type="text" className="form-control" required
//                     value={formData.address}
//                     onChange={(e) => setFormData({...formData, address: e.target.value})} />
//                 </div>
//               </div>
//               <div className="row">
//                 <div className="col-md-6 mb-3">
//                   <label className="form-label">Contact No. *</label>
//                   <input type="tel" className="form-control" required
//                     value={formData.contactNo}
//                     onChange={(e) => setFormData({...formData, contactNo: e.target.value})} />
//                   {errors.contactNo && <small className="text-danger">{errors.contactNo}</small>}
//                 </div>
//                 <div className="col-md-6 mb-3">
//                   <label className="form-label">Confirm Contact No. *</label>
//                   <input type="tel" className="form-control" required
//                     value={formData.contactNoConfirm}
//                     onChange={(e) => setFormData({...formData, contactNoConfirm: e.target.value})} />
//                 </div>
//               </div>
//               <div className="row">
//                 <div className="col-md-6 mb-3">
//                   <label className="form-label">Email *</label>
//                   <input type="email" className="form-control" required
//                     value={formData.email}
//                     onChange={(e) => setFormData({...formData, email: e.target.value})} />
//                   {errors.email && <small className="text-danger">{errors.email}</small>}
//                 </div>
//                 <div className="col-md-6 mb-3">
//                   <label className="form-label">Confirm Email *</label>
//                   <input type="email" className="form-control" required
//                     value={formData.emailConfirm}
//                     onChange={(e) => setFormData({...formData, emailConfirm: e.target.value})} />
//                 </div>
//               </div>
//               <div className="row">
//                 <div className="col-md-6 mb-3">
//                   <label className="form-label">Password *</label>
//                   <input type="password" className="form-control" required
//                     value={formData.password}
//                     onChange={(e) => setFormData({...formData, password: e.target.value})} />
//                   {errors.password && <small className="text-danger">{errors.password}</small>}
//                 </div>
//                 <div className="col-md-6 mb-3">
//                   <label className="form-label">Confirm Password *</label>
//                   <input type="password" className="form-control" required
//                     value={formData.passwordConfirm}
//                     onChange={(e) => setFormData({...formData, passwordConfirm: e.target.value})} />
//                 </div>
//               </div>
//               <button type="submit" className="btn btn-primary w-100">Sign Up</button>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function EmployerLogin() {
//   const [contactNo, setContactNo] = useState('');
//   const [password, setPassword] = useState('');
//   const [message, setMessage] = useState('');
//   const { login } = React.useContext(AuthContext);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setMessage('');

//     try {
//       const res = await fetch(`${API_URL}/employer/login`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ contactNo, password })
//       });
//       const data = await res.json();
      
//       if (data.success) {
//         login(data.token, data.employer);
//         window.location.hash = 'dashboard';
//       } else {
//         setMessage(data.message || 'Login failed');
//       }
//     } catch (err) {
//       setMessage('Error: ' + err.message);
//     }
//   };

//   return (
//     <div className="row justify-content-center">
//       <div className="col-md-5">
//         <div className="card shadow">
//           <div className="card-body">
//             <h2 className="card-title text-center mb-4">Employer Login</h2>
//             {message && <div className="alert alert-danger">{message}</div>}
//             <form onSubmit={handleSubmit}>
//               <div className="mb-3">
//                 <label className="form-label">Contact No. (User ID)</label>
//                 <input type="tel" className="form-control" required
//                   value={contactNo}
//                   onChange={(e) => setContactNo(e.target.value)} />
//               </div>
//               <div className="mb-3">
//                 <label className="form-label">Password</label>
//                 <input type="password" className="form-control" required
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)} />
//               </div>
//               <button type="submit" className="btn btn-primary w-100">Login</button>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function EmployerDashboard() {
//   const [jobs, setJobs] = useState([]);
//   const [applications, setApplications] = useState([]);
//   const [activeTab, setActiveTab] = useState('jobs');
//   const { token, user } = React.useContext(AuthContext);

//   useEffect(() => {
//     fetchJobs();
//     fetchApplications();
//   }, []);

//   const fetchJobs = async () => {
//     try {
//       const res = await fetch(`${API_URL}/jobs/employer`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
//       const data = await res.json();
//       if (data.success) setJobs(data.jobs);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const fetchApplications = async () => {
//     try {
//       const res = await fetch(`${API_URL}/applications/employer`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
//       const data = await res.json();
//       if (data.success) setApplications(data.applications);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const deleteJob = async (jobId) => {
//     if (!confirm('Are you sure you want to delete this job?')) return;
    
//     try {
//       const res = await fetch(`${API_URL}/jobs/${jobId}`, {
//         method: 'DELETE',
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
//       const data = await res.json();
//       if (data.success) {
//         fetchJobs();
//         alert('Job deleted successfully');
//       }
//     } catch (err) {
//       alert('Error deleting job');
//     }
//   };

//   return (
//     <div>
//       <div className="d-flex justify-content-between align-items-center mb-4">
//         <h2>Employer Dashboard</h2>
//         <a href="#post-job" className="btn btn-primary">Post New Job</a>
//       </div>

//       <ul className="nav nav-tabs mb-4">
//         <li className="nav-item">
//           <button className={`nav-link ${activeTab === 'jobs' ? 'active' : ''}`}
//             onClick={() => setActiveTab('jobs')}>My Jobs ({jobs.length})</button>
//         </li>
//         <li className="nav-item">
//           <button className={`nav-link ${activeTab === 'applications' ? 'active' : ''}`}
//             onClick={() => setActiveTab('applications')}>Applications ({applications.length})</button>
//         </li>
//       </ul>

//       {activeTab === 'jobs' && (
//         <div className="row">
//           {jobs.length === 0 ? (
//             <div className="col-12"><p className="text-muted">No jobs posted yet.</p></div>
//           ) : (
//             jobs.map(job => (
//               <div key={job._id} className="col-md-4 mb-3">
//                 <div className="card shadow-sm">
//                   <div className="card-body">
//                     <h5 className="card-title">{job.jobTitle}</h5>
//                     <p className="mb-1"><strong>Work Mode:</strong> {job.workMode}</p>
//                     <p className="mb-3"><strong>Salary:</strong> ₹{job.salaryOffered}</p>
//                     <div className="d-grid gap-2">
//                       <button className="btn btn-sm btn-info" onClick={() => {
//                         window.selectedJob = job;
//                         window.location.hash = 'job-details';
//                       }}>View Details</button>
//                       <button className="btn btn-sm btn-warning" onClick={() => {
//                         window.selectedJob = job;
//                         window.location.hash = 'edit-job';
//                       }}>Edit Job</button>
//                       <button className="btn btn-sm btn-danger" onClick={() => deleteJob(job._id)}>Delete Job</button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       )}

//       {activeTab === 'applications' && (
//         <div className="row">
//           {applications.length === 0 ? (
//             <div className="col-12"><p className="text-muted">No applications received yet.</p></div>
//           ) : (
//             applications.map(app => (
//               <div key={app._id} className="col-md-6 mb-3">
//                 <div className="card shadow-sm">
//                   <div className="card-body">
//                     <h5 className="card-title">{app.name}</h5>
//                     <p className="mb-1"><strong>Job:</strong> {app.job?.jobTitle}</p>
//                     <p className="mb-1"><strong>Status:</strong> {app.employeeStatus}</p>
//                     <p className="mb-1"><strong>Experience:</strong> {app.experience}</p>
//                     <p className="mb-1"><strong>Expected Salary:</strong> ₹{app.salaryExpectation}</p>
//                     <p className="mb-1"><strong>Qualification:</strong> {app.qualification}</p>
//                     <p className="mb-1"><strong>Contact:</strong> {app.phoneNo}</p>
//                     <p className="mb-1"><strong>Email:</strong> {app.email}</p>
//                     <p className="mb-1"><strong>Address:</strong> {app.address}</p>
//                     <p className="text-muted mb-0"><small>Applied on: {new Date(app.createdAt).toLocaleDateString()}</small></p>
//                   </div>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// function PostJobForm() {
//   const [formData, setFormData] = useState({
//     jobTitle: '', workMode: '', educationQualification: '', additionalSkill: '',
//     salaryOffered: '', jobDescription: '', location: '', experienceRequired: ''
//   });
//   const [message, setMessage] = useState('');
//   const { token } = React.useContext(AuthContext);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setMessage('');

//     try {
//       const res = await fetch(`${API_URL}/jobs`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify(formData)
//       });
//       const data = await res.json();
      
//       if (data.success) {
//         setMessage('Job posted successfully!');
//         setTimeout(() => window.location.hash = 'dashboard', 2000);
//       } else {
//         setMessage(data.message || 'Failed to post job');
//       }
//     } catch (err) {
//       setMessage('Error: ' + err.message);
//     }
//   };

//   return (
//     <div className="row justify-content-center">
//       <div className="col-md-8">
//         <div className="card shadow">
//           <div className="card-body">
//             <h2 className="card-title text-center mb-4">Post New Job</h2>
//             {message && <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-danger'}`}>{message}</div>}
//             <form onSubmit={handleSubmit}>
//               <div className="mb-3">
//                 <label className="form-label">Job Title *</label>
//                 <input type="text" className="form-control" required
//                   value={formData.jobTitle}
//                   onChange={(e) => setFormData({...formData, jobTitle: e.target.value})} />
//               </div>
//               <div className="row">
//                 <div className="col-md-6 mb-3">
//                   <label className="form-label">Work Mode *</label>
//                   <select className="form-select" required value={formData.workMode}
//                     onChange={(e) => setFormData({...formData, workMode: e.target.value})}>
//                     <option value="">Select</option>
//                     <option value="Part Time">Part Time</option>
//                     <option value="Full Time">Full Time</option>
//                     <option value="Fresher">Fresher</option>
//                     <option value="Remote">Remote</option>
//                     <option value="Hybrid">Hybrid</option>
//                   </select>
//                 </div>
//                 <div className="col-md-6 mb-3">
//                   <label className="form-label">Education Qualification *</label>
//                   <select className="form-select" required value={formData.educationQualification}
//                     onChange={(e) => setFormData({...formData, educationQualification: e.target.value})}>
//                     <option value="">Select</option>
//                     <option value="10 Pass">10 Pass</option>
//                     <option value="12 Pass">12 Pass</option>
//                     <option value="Graduate">Graduate</option>
//                     <option value="Master">Master</option>
//                   </select>
//                 </div>
//               </div>
//               <div className="row">
//                 <div className="col-md-6 mb-3">
//                   <label className="form-label">Additional Skill *</label>
//                   <select className="form-select" required value={formData.additionalSkill}
//                     onChange={(e) => setFormData({...formData, additionalSkill: e.target.value})}>
//                     <option value="">Select</option>
//                     <option value="Social Media Marketing">Social Media Marketing</option>
//                     <option value="Content Writer">Content Writer</option>
//                     <option value="HR">HR</option>
//                     <option value="Web Developer">Web Developer</option>
//                     <option value="App Developer">App Developer</option>
//                     <option value="Doctor">Doctor</option>
//                     <option value="Nurse">Nurse</option>
//                     <option value="Teacher">Teacher</option>
//                     <option value="Yoga">Yoga</option>
//                     <option value="Accountant">Accountant</option>
//                   </select>
//                 </div>
//                 <div className="col-md-6 mb-3">
//                   <label className="form-label">Salary Offered (₹) *</label>
//                   <input type="number" className="form-control" required
//                     value={formData.salaryOffered}
//                     onChange={(e) => setFormData({...formData, salaryOffered: e.target.value})} />
//                 </div>
//               </div>
//               <div className="row">
//                 <div className="col-md-6 mb-3">
//                   <label className="form-label">Location *</label>
//                   <input type="text" className="form-control" required
//                     value={formData.location}
//                     onChange={(e) => setFormData({...formData, location: e.target.value})} />
//                 </div>
//                 <div className="col-md-6 mb-3">
//                   <label className="form-label">Experience Required</label>
//                   <input type="text" className="form-control" placeholder="e.g., 2-3 years"
//                     value={formData.experienceRequired}
//                     onChange={(e) => setFormData({...formData, experienceRequired: e.target.value})} />
//                 </div>
//               </div>
//               <div className="mb-3">
//                 <label className="form-label">Job Description</label>
//                 <textarea className="form-control" rows="4"
//                   value={formData.jobDescription}
//                   onChange={(e) => setFormData({...formData, jobDescription: e.target.value})}></textarea>
//               </div>
//               <div className="d-grid gap-2">
//                 <button type="submit" className="btn btn-primary">Post Job</button>
//                 <a href="#dashboard" className="btn btn-secondary">Cancel</a>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function EditJobForm() {
//   const job = window.selectedJob;
//   const [formData, setFormData] = useState(job || {});
//   const [message, setMessage] = useState('');
//   const { token } = React.useContext(AuthContext);

//   if (!job) {
//     return <div className="alert alert-warning">No job selected for editing.</div>;
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setMessage('');

//     try {
//       const res = await fetch(`${API_URL}/jobs/${job._id}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify(formData)
//       });
//       const data = await res.json();
      
//       if (data.success) {
//         setMessage('Job updated successfully!');
//         setTimeout(() => window.location.hash = 'dashboard', 2000);
//       } else {
//         setMessage(data.message || 'Failed to update job');
//       }
//     } catch (err) {
//       setMessage('Error: ' + err.message);
//     }
//   };

//   return (
//     <div className="row justify-content-center">
//       <div className="col-md-8">
//         <div className="card shadow">
//           <div className="card-body">
//             <h2 className="card-title text-center mb-4">Edit Job</h2>
//             {message && <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-danger'}`}>{message}</div>}
//             <form onSubmit={handleSubmit}>
//               <div className="mb-3">
//                 <label className="form-label">Job Title *</label>
//                 <input type="text" className="form-control" required
//                   value={formData.jobTitle}
//                   onChange={(e) => setFormData({...formData, jobTitle: e.target.value})} />
//               </div>
//               <div className="row">
//                 <div className="col-md-6 mb-3">
//                   <label className="form-label">Work Mode *</label>
//                   <select className="form-select" required value={formData.workMode}
//                     onChange={(e) => setFormData({...formData, workMode: e.target.value})}>
//                     <option value="Part Time">Part Time</option>
//                     <option value="Full Time">Full Time</option>
//                     <option value="Fresher">Fresher</option>
//                     <option value="Remote">Remote</option>
//                     <option value="Hybrid">Hybrid</option>
//                   </select>
//                 </div>
//                 <div className="col-md-6 mb-3">
//                   <label className="form-label">Education Qualification *</label>
//                   <select className="form-select" required value={formData.educationQualification}
//                     onChange={(e) => setFormData({...formData, educationQualification: e.target.value})}>
//                     <option value="10 Pass">10 Pass</option>
//                     <option value="12 Pass">12 Pass</option>
//                     <option value="Graduate">Graduate</option>
//                     <option value="Master">Master</option>
//                   </select>
//                 </div>
//               </div>
//               <div className="row">
//                 <div className="col-md-6 mb-3">
//                   <label className="form-label">Additional Skill *</label>
//                   <select className="form-select" required value={formData.additionalSkill}
//                     onChange={(e) => setFormData({...formData, additionalSkill: e.target.value})}>
//                     <option value="Social Media Marketing">Social Media Marketing</option>
//                     <option value="Content Writer">Content Writer</option>
//                     <option value="HR">HR</option>
//                     <option value="Web Developer">Web Developer</option>
//                     <option value="App Developer">App Developer</option>
//                     <option value="Doctor">Doctor</option>
//                     <option value="Nurse">Nurse</option>
//                     <option value="Teacher">Teacher</option>
//                     <option value="Yoga">Yoga</option>
//                     <option value="Accountant">Accountant</option>
//                   </select>
//                 </div>
//                 <div className="col-md-6 mb-3">
//                   <label className="form-label">Salary Offered (₹) *</label>
//                   <input type="number" className="form-control" required
//                     value={formData.salaryOffered}
//                     onChange={(e) => setFormData({...formData, salaryOffered: e.target.value})} />
//                 </div>
//               </div>
//               <div className="row">
//                 <div className="col-md-6 mb-3">
//                   <label className="form-label">Location *</label>
//                   <input type="text" className="form-control" required
//                     value={formData.location}
//                     onChange={(e) => setFormData({...formData, location: e.target.value})} />
//                 </div>
//                 <div className="col-md-6 mb-3">
//                   <label className="form-label">Experience Required</label>
//                   <input type="text" className="form-control"
//                     value={formData.experienceRequired}
//                     onChange={(e) => setFormData({...formData, experienceRequired: e.target.value})} />
//                 </div>
//               </div>
//               <div className="mb-3">
//                 <label className="form-label">Job Description</label>
//                 <textarea className="form-control" rows="4"
//                   value={formData.jobDescription}
//                   onChange={(e) => setFormData({...formData, jobDescription: e.target.value})}></textarea>
//               </div>
//               <div className="d-grid gap-2">
//                 <button type="submit" className="btn btn-primary">Update Job</button>
//                 <a href="#dashboard" className="btn btn-secondary">Cancel</a>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }