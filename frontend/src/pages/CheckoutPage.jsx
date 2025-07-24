import React, { useState, useEffect } from 'react';
import { Box, Heading, VStack, FormControl, FormLabel, Input, Button, Alert, AlertIcon, Text, Spinner, Flex, Divider, useToast } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useHistory } from 'react-router-dom'; // CHANGED: useNavigate to useHistory
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { createOrder, initiateRazorpayOrder, verifyRazorpayPayment } from '../api/orders';

// Zod schema for validation (remains the same)
const shippingSchema = z.object({
  address: z.string().min(3, "Address is required"),
  city: z.string().min(2, "City is required"),
  postalCode: z.string().min(3, "Postal Code is required"),
  country: z.string().min(2, "Country is required"),
});

function CheckoutPage() {
  const { cartItems, getTotalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const history = useHistory(); // CHANGED: useNavigate to useHistory
  const toast = useToast();

  const [orderError, setOrderError] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Razorpay'); // Keep paymentMethod state if you plan to use other methods

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(shippingSchema),
  });

  // Redirect if cart is empty or not logged in
  useEffect(() => {
    if (cartItems.length === 0) {
      history.push('/cart'); // CHANGED: navigate to history.push
      toast({
        title: 'Cart Empty',
        description: 'Your cart is empty. Please add items before checking out.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    }
    if (!user) {
        history.push('/login?redirect=checkout'); // CHANGED: navigate to history.push
        toast({
          title: 'Not Logged In',
          description: 'Please log in to proceed to checkout.',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
    }
  }, [cartItems, history, user, toast]);

  const displayRazorpay = async (razorpayOrder, orderIdFromBackend) => {
    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY_ID,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: "E-Commerce App",
      description: "Purchase from E-Commerce App",
      order_id: razorpayOrder.orderId,
      handler: async function (response) {
        try {
          await verifyRazorpayPayment(orderIdFromBackend, {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          toast({
            title: "Payment Successful!",
            description: "Your order has been placed and paid.",
            status: "success",
            duration: 5000,
            isClosable: true,
          });
          clearCart();
          history.push(`/myorders`); // CHANGED: navigate to history.push
        } catch (err) {
          toast({
            title: "Payment Verification Failed",
            description: err.response?.data?.message || "There was an issue verifying your payment. Please contact support.",
            status: "error",
            duration: 9000,
            isClosable: true,
          });
          console.error("Payment verification error:", err);
        } finally {
          setOrderLoading(false);
        }
      },
      prefill: {
        name: user?.name || "",
        email: user?.email || "",
        contact: "",
      },
      theme: {
        color: "#319795"
      },
      modal: {
        ondismiss: function() {
          toast({
            title: "Payment Cancelled",
            description: "You closed the payment popup.",
            status: "info",
            duration: 3000,
            isClosable: true,
          });
          setOrderLoading(false);
        }
      }
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  const onSubmit = async (shippingData) => {
    setOrderError(null);
    setOrderLoading(true);

    const orderData = {
      orderItems: cartItems.map(item => ({
        product: item.product,
        name: item.name,
        qty: item.qty,
        image: item.image,
        price: item.price,
        shop: item.shop,
      })),
      shippingAddress: shippingData,
      paymentMethod: paymentMethod,
      taxPrice: (getTotalPrice() * 0.10),
      shippingPrice: (getTotalPrice() > 50 ? 0 : 5),
      totalPrice: (getTotalPrice() + (getTotalPrice() * 0.10) + (getTotalPrice() > 50 ? 0 : 5)).toFixed(2),
    };

    try {
      const createdOrder = await createOrder(orderData);
      
      const razorpayOrder = await initiateRazorpayOrder(createdOrder._id);

      displayRazorpay(razorpayOrder, createdOrder._id);
      
    } catch (err) {
      setOrderError(err.response?.data?.message || 'Failed to place order or initiate payment. Please try again.');
      console.error('Order/Payment initiation error:', err);
      setOrderLoading(false);
    }
  };

  if (orderLoading) {
    return (
      <Flex justify="center" align="center" minHeight="50vh">
        <Spinner size="xl" color="teal.500" />
        <Text ml="4">Preparing payment...</Text>
      </Flex>
    );
  }
  
  if (cartItems.length === 0 || !user) {
      return (
          <Flex justify="center" align="center" minHeight="50vh">
            <Spinner size="xl" color="teal.500" />
            <Text ml="4">Redirecting...</Text>
          </Flex>
      );
  }

  return (
    <Box maxWidth="xl" mx="auto" mt="8" p="6" variant="panel"> {/* Using variant="panel" */}
      <Heading as="h2" size="xl" textAlign="center" mb="6">Checkout</Heading>
      {orderError && (
        <Alert status="error" mb="4">
          <AlertIcon />
          {orderError}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack spacing="4">
          <Heading as="h3" size="md">Shipping Address</Heading>
          <FormControl id="address" isInvalid={errors.address}>
            <FormLabel>Address</FormLabel>
            <Input {...register('address')} placeholder="e.g., 123 Main St" />
            {errors.address && <Text color="red.500" fontSize="sm">{errors.address.message}</Text>}
          </FormControl>
          <FormControl id="city" isInvalid={errors.city}>
            <FormLabel>City</FormLabel>
            <Input {...register('city')} placeholder="e.g., Anytown" />
            {errors.city && <Text color="red.500" fontSize="sm">{errors.city.message}</Text>}
          </FormControl>
          <FormControl id="postalCode" isInvalid={errors.postalCode}>
            <FormLabel>Postal Code</FormLabel>
            <Input {...register('postalCode')} placeholder="e.g., 12345" />
            {errors.postalCode && <Text color="red.500" fontSize="sm">{errors.postalCode.message}</Text>}
          </FormControl>
          <FormControl id="country" isInvalid={errors.country}>
            <FormLabel>Country</FormLabel>
            <Input {...register('country')} placeholder="e.g., USA" />
            {errors.country && <Text color="red.500" fontSize="sm">{errors.country.message}</Text>}
          </FormControl>

          <Heading as="h3" size="md" mt="6">Order Summary</Heading>
          <Flex width="full" justify="space-between">
            <Text>Items ({cartItems.reduce((acc, item) => acc + item.qty, 0)})</Text>
            <Text>${getTotalPrice().toFixed(2)}</Text>
          </Flex>
          <Flex width="full" justify="space-between">
            <Text>Shipping</Text>
            <Text>${(getTotalPrice() > 50 ? 0 : 5).toFixed(2)}</Text>
          </Flex>
          <Flex width="full" justify="space-between">
            <Text>Tax (10%)</Text>
            <Text>${(getTotalPrice() * 0.10).toFixed(2)}</Text>
          </Flex>
          <Divider />
          <Flex width="full" justify="space-between" fontWeight="bold" fontSize="xl">
            <Text>Total</Text>
            <Text>${(getTotalPrice() + (getTotalPrice() * 0.10) + (getTotalPrice() > 50 ? 0 : 5)).toFixed(2)}</Text>
          </Flex>

          <Button type="submit" colorScheme="teal" size="lg" width="full" mt="6" isLoading={orderLoading}>
            Pay with Razorpay
          </Button>
        </VStack>
      </form>
    </Box>
  );
}

export default CheckoutPage;