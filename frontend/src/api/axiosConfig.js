import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080', 
    withCredentials: true,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
});

api.interceptors.request.use(
    (config) => {
        const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
        
        if (userStr) {
            const userData = JSON.parse(userStr);
            if (userData.token) {
                config.headers.Authorization = `Bearer ${userData.token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;