// src/components/Navbar.jsx
import React, { useContext } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthContext } from '../contexts/AuthContext'; // use the shared context

export default function Navbar() {
  const { user, logout } = useContext(AuthContext) || {}; // defensive fallback

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow">
      <div className="container">
        <a className="navbar-brand fw-bold" href="#home">JobPortal</a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <a className="nav-link" href="#home">Home</a>
            </li>
            {!user ? (
              <>
                {/* <li className="nav-item">
                  <a className="nav-link" href="#employer-signup">Employer Signup</a>
                </li> */}
                <li className="nav-item">
                  <a className="nav-link" href="#employer-login">Employer</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#admin-login">Admin</a>
                </li>
                {/* <li className="nav-item">
                  <a className="nav-link" href="#admin-signup">Admin Signup</a>
                </li> */}
              </>
            ) : (
              <>
                <li className="nav-item">
                  <a className="nav-link" href="#dashboard">Dashboard</a>
                </li>
                <li className="nav-item">
                  <span className="nav-link">Welcome, {user.ownerName || user.companyName || user.name}</span>
                </li>
                <li className="nav-item">
                  <button className="btn btn-outline-light btn-sm" onClick={logout}>Logout</button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
