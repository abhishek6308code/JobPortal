// import React, { createContext, useState, useEffect } from 'react';
// import { setAuthToken } from '../utils/api'; // optional - remove if you don't have this file

// export const AuthContext = createContext(null);

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     const savedUser = localStorage.getItem('user');
//     if (token) {
//       try { setAuthToken(token); } catch(e){ /* ignore if not using */ }
//     }
//     if (savedUser) {
//       try { setUser(JSON.parse(savedUser)); } catch (e) { console.warn('invalid saved user'); }
//     }
//   }, []);

//   const login = (token, userObj) => {
//     localStorage.setItem('token', token);
//     localStorage.setItem('user', JSON.stringify(userObj));
//     try { setAuthToken(token); } catch(e){ }
//     setUser(userObj);
//   };

//   const logout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     try { setAuthToken(null); } catch(e){ }
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider value={{ user, setUser, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// } 

// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { setAuthToken } from '../utils/api'; // optional - remove if you don't have this file

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null); // <-- new

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken) {
      setToken(savedToken);
      try { setAuthToken(savedToken); } catch(e){ /* ignore if not using */ }
    }
    if (savedUser) {
      try { setUser(JSON.parse(savedUser)); } catch (e) { console.warn('invalid saved user'); }
    }
  }, []);

  const login = (newToken, userObj) => {
    if (newToken) {
      localStorage.setItem('token', newToken);
      setToken(newToken);
      try { setAuthToken(newToken); } catch(e){ }
    }
    if (userObj) {
      localStorage.setItem('user', JSON.stringify(userObj));
      setUser(userObj);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    try { setAuthToken(null); } catch(e){ }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, token, setToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
