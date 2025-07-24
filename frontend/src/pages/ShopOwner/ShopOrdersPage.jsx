import React, { useEffect, useState, useCallback } from 'react';
import { Box, Heading, Text, Flex, Spinner, Alert, AlertIcon, VStack, SimpleGrid, Image, Button, Tag, TagLabel, TagLeftIcon, Link as ChakraLink, Divider, HStack } from '@chakra-ui/react';
import { MdCheckCircle, MdLocalShipping, MdOutlinePending } from 'react-icons/md';
import { Link as ReactRouterLink, useHistory } from 'react-router-dom'; // CHANGED: useNavigate to useHistory
import { useAuthStore } from '../../store/authStore';
import { getShopOrders, updateOrderToDelivered } from '../../api/orders';

function ShopOrdersPage() {
  const { user } = useAuthStore();
  const history = useHistory(); // CHANGED: useNavigate to useHistory
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateLoading, setUpdateLoading] = useState({});

  useEffect(() => {
    if (!user || user.role !== 'shopOwner') {
      history.push('/login'); // CHANGED: navigate to history.push
    }
  }, [user, history]);

  const fetchShopOrders = useCallback(async () => {
    if (!user.shopId) {
      setLoading(false);
      setError("Shop ID not available. Please log in as a shop owner with a valid shop.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getShopOrders(user.shopId);
      setOrders(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch shop orders.');
      console.error("Error fetching shop orders:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchShopOrders();
  }, [fetchShopOrders]);

  const handleMarkAsDelivered = async (orderId) => {
    if (window.confirm('Are you sure you want to mark this order as DELIVERED?')) {
      setUpdateLoading(prev => ({ ...prev, [orderId]: true }));
      try {
        await updateOrderToDelivered(orderId);
        alert('Order marked as delivered successfully!');
        fetchShopOrders();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to mark order as delivered.');
        console.error("Error marking order delivered:", err);
      } finally {
        setUpdateLoading(prev => ({ ...prev, [orderId]: false }));
      }
    }
  };

  if (!user || user.role !== 'shopOwner') {
    return <Alert status="warning" mt="4"><AlertIcon /> Access Denied. Please log in as a Shop Owner.</Alert>;
  }

  if (loading) {
    return (
      <Flex justify="center" align="center" minHeight="50vh">
        <Spinner size="xl" color="teal.500" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Alert status="error" mt="4">
        <AlertIcon />
        Error: {error}
      </Alert>
    );
  }

  const getDeliveryStatusTag = (isDelivered) => {
    if (isDelivered) {
      return { colorScheme: 'green', icon: MdCheckCircle, label: 'Delivered' };
    } else {
      return { colorScheme: 'orange', icon: MdOutlinePending, label: 'Pending Delivery' };
    }
  };

  return (
    <Box p="4" maxWidth="6xl" mx="auto">
      <Heading as="h2" size="xl" mb="6" textAlign="center">Orders for My Shop</Heading>

      {orders.length === 0 ? (
        <Text textAlign="center" fontSize="lg" mt="10">No orders found for your shop's products.</Text>
      ) : (
        <VStack spacing="8" align="stretch">
          {orders.map((order) => {
            const deliveryTag = getDeliveryStatusTag(order.isDelivered);
            return (
              <Box key={order._id} variant="panel" p="6"> {/* Using variant="panel" */}
                <Flex justify="space-between" align="center" mb="4">
                  <Heading as="h3" size="md">Order ID: {order._id}</Heading>
                  <Tag size="md" colorScheme={deliveryTag.colorScheme}>
                    <TagLeftIcon as={deliveryTag.icon} />
                    <TagLabel>{deliveryTag.label}</TagLabel>
                  </Tag>
                </Flex>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing="4" mb="4">
                  <Box>
                    <Text fontWeight="bold">Customer:</Text>
                    <Text>{order.user?.name} ({order.user?.email})</Text>
                    <Text fontWeight="bold" mt="2">Shipping Address:</Text>
                    <Text>{order.shippingAddress?.address}, {order.shippingAddress?.city}</Text>
                    <Text>{order.shippingAddress?.postalCode}, {order.shippingAddress?.country}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold">Ordered on:</Text>
                    <Text>{new Date(order.createdAt).toLocaleDateString()}</Text>
                    <Text fontWeight="bold" mt="2">Total Order Value:</Text>
                    <Text fontSize="xl" fontWeight="bold" color="teal.600">${order.totalPrice?.toFixed(2)}</Text>
                    <Text fontSize="sm" color="gray.600">Payment: {order.paymentMethod}</Text>
                  </Box>
                </SimpleGrid>

                <Divider mb="4" />

                <Heading as="h4" size="sm" mb="3">Your Products in This Order:</Heading>
                <VStack spacing={2} align="stretch">
                    {order.orderItems.map((item) => (
                        <Flex key={item.product} align="center" gap="2" borderWidth="1px" borderRadius="md" p="2">
                            <Image src={item.image} alt={item.name} boxSize="60px" objectFit="cover" borderRadius="md" />
                            <VStack align="start" flex="1">
                                <ChakraLink as={ReactRouterLink} to={`/product/${item.product}`} fontWeight="bold" color="teal.500">
                                    {item.name}
                                </ChakraLink>
                                <Text fontSize="sm">Qty: {item.qty} x ${item.price?.toFixed(2)}</Text>
                            </VStack>
                        </Flex>
                    ))}
                </VStack>

                <Divider my="4" />

                {!order.isDelivered && (
                    <Flex justify="center">
                        <Button
                            colorScheme="green"
                            onClick={() => handleMarkAsDelivered(order._id)}
                            isLoading={updateLoading[order._id]}
                            isDisabled={updateLoading[order._id]}
                        >
                            Mark as Delivered
                        </Button>
                    </Flex>
                )}
              </Box>
            );
          })}
        </VStack>
      )}
    </Box>
  );
}

export default ShopOrdersPage;