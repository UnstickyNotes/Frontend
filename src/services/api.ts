import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8000/api",
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
});

// Attach Bearer token on every request if present
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("un-token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// On 401, clear token and redirect to login (except when already on login/register)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const isAuthRoute = error.config?.url?.includes('/login') || error.config?.url?.includes('/register');
        if (error.response?.status === 401 && !isAuthRoute) {
            localStorage.removeItem("un-token");
            if (window.location.pathname !== '/login') {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;