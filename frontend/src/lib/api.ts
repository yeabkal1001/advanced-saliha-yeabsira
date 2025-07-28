import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      const currentPath = window.location.pathname;
      if (currentPath !== '/signin' && currentPath !== '/signup') {
        window.location.href = '/signin';
      }
    }
    return Promise.reject(error);
  }
);

// API endpoints for posts (example)
export const postsAPI = {
  getAll: () => api.get('/api/v1/posts'),
  getById: (id: number) => api.get(`/api/v1/posts/${id}`),
  create: (data: { title: string; content: string }) => 
    api.post('/api/v1/posts', { post: data }),
  update: (id: number, data: { title: string; content: string }) => 
    api.put(`/api/v1/posts/${id}`, { post: data }),
  delete: (id: number) => api.delete(`/api/v1/posts/${id}`),
};

// API endpoints for products (for your e-commerce app)
export const productsAPI = {
  getAll: () => api.get('/api/v1/products'),
  getById: (id: number) => api.get(`/api/v1/products/${id}`),
  create: (data: any) => api.post('/api/v1/products', { product: data }),
  update: (id: number, data: any) => 
    api.put(`/api/v1/products/${id}`, { product: data }),
  delete: (id: number) => api.delete(`/api/v1/products/${id}`),
  search: (query: string) => api.get(`/api/v1/products/search?q=${query}`),
};

// API endpoints for orders
export const ordersAPI = {
  getAll: () => api.get('/api/v1/orders'),
  getById: (id: number) => api.get(`/api/v1/orders/${id}`),
  create: (data: any) => api.post('/api/v1/orders', { order: data }),
  update: (id: number, data: any) => 
    api.put(`/api/v1/orders/${id}`, { order: data }),
  delete: (id: number) => api.delete(`/api/v1/orders/${id}`),
  getSellerOrders: () => api.get('/api/v1/orders/seller_orders'),
  getSellerStats: () => api.get('/api/v1/orders/seller_stats'),
  bulkUpdate: (orderIds: number[], status: string) => 
    api.patch('/api/v1/orders/bulk_update', { order_ids: orderIds, status }),
};

// API endpoints for authentication
export const authAPI = {
  signIn: (credentials: { email: string; password: string }) => 
    api.post('/api/v1/auth/signin', credentials),
  signUp: (userData: { email: string; password: string; name: string; storeName?: string }) => {
    // Convert camelCase to snake_case for backend
    const backendData = {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      store_name: userData.storeName
    };
    return api.post('/api/v1/auth/signup', { user: backendData });
  },
  signOut: () => api.delete('/api/v1/auth/signout'),
  getCurrentUser: () => api.get('/api/v1/auth/me'),
  updateProfile: (userData: { name?: string; email?: string; storeName?: string }) => {
    // Convert camelCase to snake_case for backend
    const backendData = {
      name: userData.name,
      email: userData.email,
      store_name: userData.storeName
    };
    return api.put('/api/v1/auth/profile', { user: backendData });
  },
};

// API endpoints for wishlist
export const wishlistAPI = {
  getAll: () => api.get('/api/v1/wishlist'),
  add: (productId: number) => api.post('/api/v1/wishlist', { product_id: productId }),
  remove: (productId: number) => api.delete(`/api/v1/wishlist/${productId}`),
  check: (productId: number) => api.get(`/api/v1/wishlist/check/${productId}`),
  addMultiple: (productIds: number[]) => api.post('/api/v1/wishlist/add_multiple', { product_ids: productIds }),
  clear: () => api.delete('/api/v1/wishlist'),
};

// API endpoints for reviews
export const reviewsAPI = {
  getByProduct: (productId: number) => api.get(`/api/v1/products/${productId}/reviews`),
  create: (productId: number, data: { rating: number; comment: string }) => 
    api.post(`/api/v1/products/${productId}/reviews`, { review: data }),
  update: (reviewId: number, data: { rating: number; comment: string }) => 
    api.put(`/api/v1/reviews/${reviewId}`, { review: data }),
  delete: (reviewId: number) => api.delete(`/api/v1/reviews/${reviewId}`),
  getUserReviews: () => api.get('/api/v1/reviews/user_reviews'),
  getProductRating: (productId: number) => api.get(`/api/v1/products/${productId}/rating`),
};

export default api;