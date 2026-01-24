import axios from 'axios';

// Ensure this matches your running backend port!
// Currently set to 5019 based on your latest server log.
const API_URL = 'http://localhost:5021/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const auth = {
    login: (data: any) => api.post('/auth/login', data),
    register: (data: any) => api.post('/auth/register', data),
    google: (token: string) => api.post('/auth/google', { token }),
    verifyOtp: (email: string, otp: string) => api.post('/auth/verify-otp', { email, otp }),
};

export const media = {
    upload: (formData: FormData) => api.post('/media/upload', formData),
    uploadSecure: (data: any) => api.post('/media/upload-secure', data),
};

export const report = {
    create: (data: any) => api.post('/report', data),
    getAll: () => api.get('/report'),
    getById: (id: string) => api.get(`/report/${id}`),
    submit: (id: string) => api.put(`/report/${id}/submit`),
    submitComplaintDocument: (id: string, base64Data: string) => api.post(`/report/${id}/complaint-document`, { base64Data }),
};

export const ai = {
    chat: (message: string, history: any[], image?: any) => api.post('/ai/chat', { message, history, image }),
    analyze: (reportId: string) => api.post('/ai/analyze', { reportId }),
};

export const intelligence = {
    analyze: (metadata: any) => api.post('/intelligence/analyze', { metadata }),
    detailedAnalysis: (morphedBase64: string, mimeType: string, reportId?: string, originalBase64?: string) =>
        api.post('/intelligence/detailed-analysis', { morphedBase64, mimeType, reportId, originalBase64 }),
};

export default api;
