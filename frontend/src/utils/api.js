import axios from 'axios';

const API_URL = 'https://prized-nature-98a1af9371.strapiapp.com';

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Include credentials if necessary
});

export const signup = (data) => axiosInstance.post('/api/auth/local/register', data);
export const login = (data) => axiosInstance.post('/api/auth/local', data);