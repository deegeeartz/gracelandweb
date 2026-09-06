// Universal Admin API Helper for React Admin Suite
const TOKEN_KEY = 'admin_token';

export const AdminAuth = {
    getToken() {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(TOKEN_KEY);
    },
    setToken(token) {
        if (typeof window !== 'undefined') {
            localStorage.setItem(TOKEN_KEY, token);
        }
    },
    removeToken() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(TOKEN_KEY);
        }
    },
    getAuthHeaders() {
        const token = this.getToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }
};

export async function adminRequest(endpoint, options = {}) {
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
    const headers = {
        ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
        ...AdminAuth.getAuthHeaders(),
        ...options.headers,
    };

    let body = options.body;
    if (body && !isFormData && typeof body === 'object') {
        body = JSON.stringify(body);
    }

    const response = await fetch(`/api${endpoint}`, {
        ...options,
        headers,
        body,
    });

    let data;
    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok) {
        const message = (data && (data.error || data.message)) || `Request failed with status ${response.status}`;
        const error = new Error(message);
        error.status = response.status;
        error.data = data;
        throw error;
    }

    return data;
}

export const adminApi = {
    get: (endpoint) => adminRequest(endpoint, { method: 'GET' }),
    post: (endpoint, data) => adminRequest(endpoint, { method: 'POST', body: data }),
    put: (endpoint, data) => adminRequest(endpoint, { method: 'PUT', body: data }),
    del: (endpoint) => adminRequest(endpoint, { method: 'DELETE' }),
    
    // Cloudinary file upload
    async uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);
        
        const token = AdminAuth.getToken();
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch('/api/upload', {
            method: 'POST',
            headers,
            body: formData,
        });

        const data = await res.json();
        if (!res.ok || !data.url) {
            throw new Error(data.error || data.message || 'Image upload failed');
        }
        return data.url;
    }
};

export default adminApi;
