// frontend/src/api/orders.js
import axiosClient from './axiosClient';

// Create a new order (our internal order)
export const createOrder = async (orderData) => {
  const { data } = await axiosClient.post('/api/orders', orderData);
  return data;
};

// Get logged in user's orders
export const getMyOrders = async () => {
  const { data } = await axiosClient.get('/api/orders/myorders');
  return data;
};

// Shop Owner: Get orders for a specific shop owner's products
export const getShopOrders = async (shopId) => {
  const { data } = await axiosClient.get(`/api/orders/shop/${shopId}`);
  return data;
};

// Shop Owner: Update order to delivered
export const updateOrderToDelivered = async (orderId) => {
  const { data } = await axiosClient.put(`/api/orders/${orderId}/deliver`, {});
  return data;
};

// NEW: Initiate Razorpay order from backend
export const initiateRazorpayOrder = async (orderId) => {
  const { data } = await axiosClient.post(`/api/orders/${orderId}/razorpay`);
  return data;
};

// NEW: Verify Razorpay payment
export const verifyRazorpayPayment = async (orderId, paymentDetails) => {
  const { data } = await axiosClient.post(`/api/orders/${orderId}/verify-payment`, paymentDetails);
  return data;
};