import axios from 'axios'; // Axios is a promise-based HTTP client for the browser and Node.js. It provides an easy-to-use API to make HTTP requests and handle responses.

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

// Handle 401 Unauthorized responses globally
// The API.interceptors.response.use() method is used to intercept responses from the server. It takes two arguments: a function to handle successful responses and a function to handle errors. In this case, we are only interested in handling errors, specifically 401 Unauthorized errors. When a 401 error is encountered, the user's token and user data are removed from localStorage, the Authorization header is cleared, and the user is redirected to the login page if they are not already there. This ensures that users are logged out and cannot access protected routes when their session expires or their token becomes invalid.
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
        return Promise.reject(error); // Promise is a built-in JavaScript object that represents the eventual completion (or failure) of an asynchronous operation and its resulting value. The Promise.reject() method returns a Promise object that is rejected with a given reason. In this case, it propagates the error to be handled by the calling code.
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
