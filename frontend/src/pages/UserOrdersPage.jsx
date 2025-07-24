import React, { useEffect, useState } from 'react';
import { Box, Heading, Text, Flex, Spinner, Alert, AlertIcon, VStack, SimpleGrid, Image, Link as ChakraLink, Divider, List, ListItem, HStack, Icon } from '@chakra-ui/react';
import { MdCheckCircle, MdShoppingCart, MdLocalShipping } from 'react-icons/md';
import { Link as ReactRouterLink, useHistory } from 'react-router-dom'; // CHANGED: useNavigate to useHistory
import { useAuthStore } from '../store/authStore';
import { getMyOrders } from '../api/orders';

function UserOrdersPage() {
  const { user } = useAuthStore();
  const history = useHistory(); // CHANGED: useNavigate to useHistory
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getMyOrders();
        setOrders(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch your orders.');
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'user') {
      fetchOrders();
    }
  }, [user]);

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

  return (
    <Box p="4" maxWidth="6xl" mx="auto">
      <Heading as="h2" size="xl" mb="6" textAlign="center">My Orders</Heading>

      {orders.length === 0 ? (
        <Text textAlign="center" fontSize="lg" mt="10">You haven't placed any orders yet. <ChakraLink as={ReactRouterLink} to="/" color="teal.500">Start Shopping!</ChakraLink></Text>
      ) : (
        <VStack spacing="8" align="stretch">
          {orders.map((order) => (
            <Box key={order._id} variant="panel" p="6"> {/* Using variant="panel" */}
              <Flex justify="space-between" align="center" mb="4">
                <Heading as="h3" size="md">Order ID: {order._id}</Heading>
                <Text fontSize="sm" color="gray.600">Ordered on: {new Date(order.createdAt).toLocaleDateString()}</Text>
              </Flex>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing="4" mb="4">
                <Box>
                  <Text fontWeight="bold">Shipping Address:</Text>
                  <Text>{order.shippingAddress.address}, {order.shippingAddress.city}</Text>
                  <Text>{order.shippingAddress.postalCode}, {order.shippingAddress.country}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Payment Method:</Text>
                  <Text>{order.paymentMethod}</Text>
                  <Text fontWeight="bold">Total: <Text as="span" color="teal.600">${order.totalPrice.toFixed(2)}</Text></Text>
                </Box>
              </SimpleGrid>

              <Divider mb="4" />

              <Heading as="h4" size="sm" mb="3">Items:</Heading>
              <List spacing={2}>
                {order.orderItems.map((item) => (
                  <ListItem key={item.product}>
                    <Flex align="center" gap="2">
                        <Image src={item.image} alt={item.name} boxSize="40px" objectFit="cover" borderRadius="md" />
                        <ChakraLink as={ReactRouterLink} to={`/product/${item.product}`} fontWeight="bold" color="teal.500">
                            {item.name}
                        </ChakraLink>
                        <Text fontSize="sm">({item.qty} x ${item.price.toFixed(2)})</Text>
                    </Flex>
                  </ListItem>
                ))}
              </List>

              <Divider my="4" />

              <HStack spacing="4" justify="center">
                <Text>
                  <Icon as={MdShoppingCart} color={order.isPaid ? 'green.500' : 'gray.500'} mr="2" />
                  <Text as="span" fontWeight="bold">Paid:</Text> {order.isPaid ? `Yes (${new Date(order.paidAt).toLocaleDateString()})` : 'No'}
                </Text>
                <Text>
                  <Icon as={MdLocalShipping} color={order.isDelivered ? 'green.500' : 'gray.500'} mr="2" />
                  <Text as="span" fontWeight="bold">Delivered:</Text> {order.isDelivered ? `Yes (${new Date(order.deliveredAt).toLocaleDateString()})` : 'No'}
                </Text>
              </HStack>
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
}

export default UserOrdersPage;