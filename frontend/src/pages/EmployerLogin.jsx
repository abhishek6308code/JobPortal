

// Employer.jsx (fixed)
import React, { useState, useContext } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthContext } from '/src/contexts/AuthContext.jsx';

export default function EmployerLogin() {
  const API_URL = 'https://jobportalbackend-kpg7.onrender.com/api';
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext); // optional, if you want to use context login

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const phoneTrim = phone?.toString().trim();
    const passwordVal = password?.toString();

    

    if (!phoneTrim || !passwordVal) {
      setError('Please enter phone and password.');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/employer/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneTrim, password: passwordVal })
      });

      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { message: text }; }

      if (!res.ok) {
        const msg = data?.message || `Login failed (status ${res.status})`;
        setError(msg);
        console.warn('Login failed:', res.status, data);
        return;
      }

      // success
      const { token, employer } = data;
      if (!token) {
        setError('No token returned from server.');
        return;
      }

      // store token and user (or use your context login)
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(employer));

      // if your AuthContext exposes login(), call it:
      if (typeof login === 'function') {
        login(token, employer);
      }

      // redirect to dashboard (adjust route)
     // window.location.href = '/employer/dashboard';
       window.location.hash = 'employer-dashboard';
    } catch (err) {
      console.error('Network/login error', err);
      setError('Network error: ' + err.message);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-5">
        <div className="card shadow">
          <div className="card-body">
            <h2 className="card-title text-center mb-4">Employer Login</h2>

            {message && <div className="alert alert-info">{message}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Phone No. (User ID)</label>
                <input
                  type="tel"
                  className="form-control"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary w-100">Login</button>
                 <center><p>Don't have a acount <a className="nav-link color-blue" href="#employer-signup">Signup</a></p></center> 
            </form>
        
            
          </div>
        </div>
      </div>
    </div>
  );
}
