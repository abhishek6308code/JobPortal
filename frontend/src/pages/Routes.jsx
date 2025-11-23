
import React, { useState, useEffect, useMemo } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import HomePage from './HomePage.jsx';
import EmployerSignup from './EmployerSignup.jsx';
import EmployerLogin from './EmployerLogin.jsx';
import EmployerDashboard from './EmployerDashboard.jsx';
import PostJobForm from './PostJobForm.jsx';
import EditJobForm from './EditJobForm.jsx';
import JobDetailsPage from './JobDetailsPage.jsx';
import AdminSignup from './AdminSignup.jsx';
import AdminLogin from './AdminLogin.jsx';
import AdminDashboard from './AdminDashboard.jsx';
import { AuthContext } from "/src/contexts/AuthContext.jsx";

function Routes() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobId, setJobId] = useState(null); // holds id when URL contains it
  const { user } = React.useContext(AuthContext);

  useEffect(() => {
    const handleHashChange = () => {
      const raw = window.location.hash.substring(1) || 'home';
      // support hashes like: "edit-job" or "edit-job/<id>" or "job-details/<id>"
      const parts = raw.split('/');
      const page = parts[0] || 'home';
      const id = parts[1] || null;

      setCurrentPage(page);

      // For edit-job and job-details, keep selectedJob if window.selectedJob exists
      if (page === 'edit-job' || page === 'job-details') {
        // if navigation included an id, store it; otherwise clear jobId
        setJobId(id);
        // don't clear selectedJob here — let the component use it if available
        // but if id doesn't match selectedJob._id, clear to avoid mismatch
        if (window.selectedJob && id && String(window.selectedJob._id) !== String(id)) {
          setSelectedJob(null);
        }
      } else {
        // navigating away from edit/details: clear selectedJob + jobId
        setSelectedJob(null);
        setJobId(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // run once on mount
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const viewJobDetails = (job) => {
    // set selectedJob and navigate to details (no id needed, but we include it for refresh)
    setSelectedJob(job);
    window.location.hash = `job-details/${job._id || job.id}`;
  };

  const pages = useMemo(() => ({
    'home': <HomePage viewJobDetails={viewJobDetails} />,
    'admin-signup': <AdminSignup />,
    'admin-login': <AdminLogin />,
    'admin-dashboard': <AdminDashboard />,
    'employer-signup': <EmployerSignup />,
    'employer-login': <EmployerLogin />,
    'dashboard': user ? <EmployerDashboard /> : <EmployerLogin />,
    'post-job': user ? <PostJobForm /> : <EmployerLogin />,
    // pass both job object (may be null) and jobId (may be null) to EditJobForm
    'edit-job': user ? <EditJobForm job={selectedJob} jobId={jobId} /> : <EmployerLogin />,
    'job-details': <JobDetailsPage job={selectedJob} jobId={jobId} />,
  }), [user, selectedJob, jobId]);

  return <div className="container py-4">{pages[currentPage] || pages['home']}</div>;
}

export default Routes;
