// src/AdminSignup.jsx
import React, { useState } from 'react';
const API_URL = 'http://localhost:5000/api';

export default function AdminSignup() {
    const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
    const [message, setMessage] = useState('');

    const submit = async (e) => {
        e.preventDefault();
        setMessage('');
        console.log('Submitting admin signup:', form);
        try {
            const res = await fetch(`${API_URL}/admin/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (!res.ok) { setMessage(data?.message || 'Signup failed'); return; }
            // store admin token separately
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
                        <h3 className="mb-3">Admin Signup</h3>
                        {message && <div className="alert alert-danger">{message}</div>}
                        <form onSubmit={submit}>
                            <input className="form-control mb-2" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                            <input type="email" className="form-control mb-2" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                            <input className="form-control mb-2" placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
                            <input type="password" className="form-control mb-2" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                            <button className="btn btn-primary w-100">Sign up</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
