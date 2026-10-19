import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
});

// Automatically attach JWT token to every outgoing request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('subtracker_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const setAuthToken = (token) => {
    if (token) {
        API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
};

export const clearAuthToken = () => {
    delete API.defaults.headers.common['Authorization'];
};

API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('subtracker_token');
            localStorage.removeItem('subtracker_user');
            clearAuthToken();
            // Redirect to login if not already there
            if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);

export const getSubscriptions = (params = {}) => API.get('/subscriptions', { params });
export const createSubscription = (data) => API.post('/subscriptions', data);
export const updateSubscription = (id, data) => API.put(`/subscriptions/${id}`, data);
export const deleteSubscription = (id) => API.delete(`/subscriptions/${id}`);
export const getSummary = (params = {}) => API.get('/subscriptions/summary', { params });
export const getUpcoming = () => API.get('/subscriptions/upcoming');

export default API;
