import axios from 'axios';

// Single axios instance used by the whole app — keeps the base URL in one place.
// VITE_API_URL comes from .env (or Vercel env vars in production).
// If it's not set, fall back to the local backend.
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Each function below maps to one backend endpoint
export const getAllCustomers = () => API.get('/customers');
export const getSingleCustomer = (id) => API.get(`/customers/${id}`);
export const createCustomer = (data) => API.post('/customers', data);
export const updateCustomer = (id, data) => API.put(`/customers/${id}`, data);
export const deleteCustomer = (id) => API.delete(`/customers/${id}`);
