// src/AdminLogin.jsx
import React, { useState } from 'react';
const API_URL = 'https://jobportalbackend-kpg7.onrender.com/api';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch(`${API_URL}/admin/login`, {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) { setMessage(data?.message || 'Login failed'); return; }
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('admin', JSON.stringify(data.admin));
      window.location.hash = 'admin-dashboard';
    } catch (err) {
      setMessage('Network error: ' + err.message);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-5">
        <div className="card shadow">
          <div className="card-body">
            <h3 className="mb-3">Admin Login</h3>
            {message && <div className="alert alert-danger">{message}</div>}
            <form onSubmit={submit}>
              <input type="email" className="form-control mb-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
              <input type="password" className="form-control mb-2" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
              <button className="btn btn-primary w-100">Sign in</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
