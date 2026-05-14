import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 5000,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const authApi = {
    login: (email: string, password: string) =>
        api.post('/api/auth/login', { email, password }),
    register: (data: any) =>
        api.post('/api/auth/register', data),
    logout: (accessToken: string, refreshToken: string) =>
        api.post('/api/auth/logout', { accessToken, refreshToken }),
};

export const productApi = {
    getAll: () => api.get('/api/products'),
    getById: (id: string) => api.get(`/api/products/${id}`),
    create: (data: any) => api.post('/api/products', data),
    update: (id: string, data: any) => api.put(`/api/products/${id}`, data),
    delete: (id: string) => api.delete(`/api/products/${id}`),
    getByCategory: (category: string) => api.get(`/api/products/category/${category}`),
};

export const orderApi = {
    getAll: (userId: string) => api.get(`/api/orders/user/${userId}`),
    getById: (id: string) => api.get(`/api/orders/${id}`),
    create: (data: any) => api.post('/api/orders', data),
    getAllOrders: () => api.get('/api/orders'),
};

export const inventoryApi = {
    getByProduct: (productId: string) => api.get(`/api/inventory/${productId}`),
    getAll: () => api.get('/api/inventory'),
};

export const aiApi = {
    chat: (userId: string, message: string, orderContext?: string) =>
        api.post('/api/ai/chat', { userId, message, orderContext }),
    search: (query: string, availableProducts: string) =>
        api.post('/api/ai/search', { naturalLanguageQuery: query, availableProducts }),
    recommendations: (data: any) =>
        api.post('/api/ai/recommendations', data),
    predictInventory: (data: any) =>
        api.post('/api/ai/inventory/predict', data),
};

export const healthApi = {
    checkAllServices: async (): Promise<Record<string, boolean>> => {
        const services = [
            { id: 'api-gateway',  url: '/proxy/8080/actuator/health' },
            { id: 'identity',     url: '/proxy/8085/actuator/health' },
            { id: 'product',      url: '/proxy/8081/actuator/health' },
            { id: 'order',        url: '/proxy/8082/actuator/health' },
            { id: 'inventory',    url: '/proxy/8083/actuator/health' },
            { id: 'notification', url: '/proxy/8084/actuator/health' },
            { id: 'ai',           url: '/proxy/8086/actuator/health' },
        ];

        const results = await Promise.all(
            services.map(async svc => {
                try {
                    const r = await axios.get(svc.url, { timeout: 2000 });
                    return [svc.id, r.data?.status === 'UP'];
                } catch {
                    return [svc.id, false];
                }
            })
        );

        return Object.fromEntries(results);
    }
};

export default api;