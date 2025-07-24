// frontend/src/api/auth.js
import axiosClient from './axiosClient';

export const login = async (email, password) => {
  const { data } = await axiosClient.post('/api/auth/login', { email, password });
  return data;
};

export const registerUser = async (name, email, password) => {
  const { data } = await axiosClient.post('/api/auth/register/user', { name, email, password });
  return data;
};

export const registerShopOwner = async (name, email, password, shopName) => {
  const { data } = await axiosClient.post('/api/auth/register/shop-owner', { name, email, password, shopName });
  return data;
};

export const getProfile = async () => {
  const { data } = await axiosClient.get('/api/auth/profile');
  return data;
};

// NEW: Update user profile
export const updateUserProfile = async (userData) => { // userData can contain name, email, password
  const { data } = await axiosClient.put('/api/auth/profile', userData);
  return data;
};