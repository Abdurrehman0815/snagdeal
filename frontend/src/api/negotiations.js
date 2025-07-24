// frontend/src/api/negotiations.js
import axiosClient from './axiosClient';

// We'll import MAX_NEGOTIATION_ATTEMPTS from the backend for consistency
// Although normally you'd define it client-side if it's a fixed rule.
// For now, let's keep it defined in ProductDetailPage.jsx for simplicity,
// or you'd need a separate endpoint to fetch backend constants.
// However, the error `product?.MAX_NEGOTIATION_ATTEMPTS` is the issue.
// We should use the locally defined 3 or create a proper client-side constant.
// Let's create a client-side constant for now to fix the syntax.

export const requestNegotiation = async (productId, proposedPrice) => {
    const { data } = await axiosClient.post('/api/negotiations/request', { productId, proposedPrice });
    return data;
};

export const getUserNegotiationsForProduct = async (productId) => {
    const { data } = await axiosClient.get(`/api/negotiations/product/${productId}/user`);
    return data;
};

export const getShopNegotiationHistory = async () => {
    const { data } = await axiosClient.get('/api/negotiations/shop/history');
    return data;
};
// No change needed here after all. The MAX_NEGOTIATION_ATTEMPTS was in backend/controllers/negotiationController.js
// We will just define a client-side constant in ProductDetailPage.jsx