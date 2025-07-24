// frontend/src/api/products.js
import axiosClient from './axiosClient';

// Get all products with optional search, filter, sort, and pagination parameters
export const getProducts = async (params = {}) => {
  const { keyword = '', category = '', sortBy = '', pageNumber = 1 } = params;
  const queryString = new URLSearchParams({
    keyword,
    category,
    sortBy,
    pageNumber,
  }).toString();

  const { data } = await axiosClient.get(`/api/products?${queryString}`);
  return data;
};

// Get a single product by ID (for a product detail page)
export const getProductById = async (id) => {
  const { data } = await axiosClient.get(`/api/products/${id}`);
  return data;
};

// Shop Owner: Create a new product
export const createProduct = async (productData) => {
  const { data } = await axiosClient.post('/api/products', productData);
  return data;
};

// Shop Owner: Update an existing product
export const updateProduct = async (id, productData) => {
  const { data } = await axiosClient.put(`/api/products/${id}`, productData);
  return data;
};

// Shop Owner: Delete a product
export const deleteProduct = async (id) => {
  const { data } = await axiosClient.delete(`/api/products/${id}`);
  return data;
};

// Shop Owner: Get products by a specific shop
export const getProductsByShop = async (shopId) => {
  const { data } = await axiosClient.get(`/api/products/shop/${shopId}`);
  return data;
};

// NEW: Create a review for a product (User)
export const createProductReview = async (productId, reviewData) => {
  const { data } = await axiosClient.post(`/api/products/${productId}/reviews`, reviewData);
  return data;
};