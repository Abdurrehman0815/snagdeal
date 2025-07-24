import axios from 'axios';

const axiosClient = axios.create({
    baseURL: process.env.REACT_APP_BACKEND_URL, // Make sure you have REACT_APP_BACKEND_URL in your .env.local
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Important for sending cookies/credentials with cross-origin requests
});

// Request interceptor to add the JWT token to headers if available
axiosClient.interceptors.request.use(
    (config) => {
        // This assumes your Zustand store (which we'll set up next) persists auth data
        // to localStorage under the key 'auth'.
        const authData = JSON.parse(localStorage.getItem('auth')) || {};
        const token = authData.state?.user?.token; // Adjust path based on your Zustand store structure

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling common errors (e.g., token expiry)
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.error('Authentication error: Token expired or invalid. Please log in again.');
            // TODO: In a later step, you'd dispatch an action to log out the user
            // and redirect them to the login page.
            // Example: store.getState().logout();
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosClient;