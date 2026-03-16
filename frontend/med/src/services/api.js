import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "https://smartmed-1-kd42.onrender.com/api";

const api = axios.create({
  baseURL: BASE_URL,
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const loginUser = (data) => api.post("/auth/login", data);
export const registerUser = (data) => api.post("/auth/register", data);

export const getProducts = () => api.get("/products");
export const getProductById = (id) => api.get(`/products/${id}`);
export const searchProducts = (query) => api.get(`/products/search?query=${query}`);
export const addProduct = (data) => api.post("/products", data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

export const createOrder = (data) => api.post("/orders", data);
export const getUserOrders = (username) => api.get(`/orders/user/${username}`);
export const getAllOrders = () => api.get("/orders");
export const updateOrderStatus = (id, status) => api.patch(`/orders/${id}/status`, status, {
  headers: { "Content-Type": "text/plain" }
});

export const analyzePrescription = (formData) => api.post("/ai/analyze-prescription", formData, {
  headers: { "Content-Type": "multipart/form-data" }
});

export const chatWithAugust = (message) => api.post("/ai/chat", { message });
export const analyzeSymptoms = (symptoms) => api.post("/ai/analyze-symptoms", { symptoms });
export const checkInteractions = (medicines) => api.post("/ai/check-interactions", { medicines });
export const suggestSubstitutes = (medicine) => api.post("/ai/suggest-substitutes", { medicine });

// Wallet & Persistence
export const getWallet = (username) => api.get(`/wallet/${username}`);
export const addWalletMoney = (username, amount) => api.post('/wallet/add', { username, amount });

export const getReminders = (username) => api.get(`/reminders/${username}`);
export const addReminder = (username, reminder) => api.post(`/reminders?username=${username}`, reminder);
export const deleteReminder = (id) => api.delete(`/reminders/${id}`);

export const getFamilyProfiles = (username) => api.get(`/family/${username}`);
export const addFamilyProfile = (username, profile) => api.post(`/family?username=${username}`, profile);
export const deleteFamilyProfile = (id) => api.delete(`/family/${id}`);

export default api;
