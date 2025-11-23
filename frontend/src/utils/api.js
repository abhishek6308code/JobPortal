import axios from 'axios';
const API = axios.create({ baseURL: 'https://jobportalbackend-kpg7.onrender.com/api' });

export function setAuthToken(token) {
  if (token) API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete API.defaults.headers.common['Authorization'];
}

export default API;
