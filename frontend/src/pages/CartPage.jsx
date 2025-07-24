import React from 'react';
import { Box, Heading, Text, Button, Flex, SimpleGrid, Image, VStack, HStack, IconButton, Divider, Alert, AlertIcon, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper } from '@chakra-ui/react';
import { MdDelete } from 'react-icons/md'; // For delete icon
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore'; // Import cart store
import { useAuthStore } from '../store/authStore'; // For user check

function CartPage() {
    const { cartItems, removeFromCart, updateCartItemQty, getTotalPrice, clearCart } = useCartStore();
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const handleCheckout = () => {
        if (!user) {
            alert('Please log in to proceed to checkout.');
            navigate('/login?redirect=checkout'); // Redirect to login, then back to checkout
        } else {
            navigate('/checkout'); // Navigate to the checkout page
        }
    };

    if (cartItems.length === 0) {
        return (
            <Box p="4" textAlign="center">
                <Heading as="h2" size="xl" mb="6">Your Cart is Empty</Heading>
                <Text fontSize="lg">Looks like you haven't added anything to your cart yet.</Text>
                <Button as={Link} to="/" colorScheme="teal" mt="4">Start Shopping</Button>
            </Box>
        );
    }

    return (
        <Box p="4" maxWidth="6xl" mx="auto">
            <Heading as="h2" size="xl" mb="6" textAlign="center">Shopping Cart</Heading>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing="6">
                <VStack spacing="4" align="stretch">
                    {cartItems.map((item) => (
                        <Flex key={item.product} borderWidth="1px" borderRadius="lg" p="4" alignItems="center" boxShadow="sm">
                            <Image src={item.image} alt={item.name} boxSize="100px" objectFit="cover" borderRadius="md" mr="4" />
                            <VStack align="start" flex="1">
                                <Link to={`/product/${item.product}`}>
                                    <Text fontSize="lg" fontWeight="bold" color="teal.600">{item.name}</Text>
                                </Link>
                                <Text fontSize="md">Price: ${item.price}</Text>
                            </VStack>
                            <HStack>
                                <NumberInput maxW="100px" min={1} max={item.countInStock} value={item.qty} onChange={(valueString) => updateCartItemQty(item.product, parseInt(valueString))}>
                                    <NumberInputField />
                                    <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                    </NumberInputStepper>
                                </NumberInput>
                                <IconButton
                                    aria-label="Delete item"
                                    icon={<MdDelete />}
                                    colorScheme="red"
                                    onClick={() => removeFromCart(item.product)}
                                />
                            </HStack>
                        </Flex>
                    ))}
                </VStack>

                {/* Cart Summary */}
                <Box borderWidth="1px" borderRadius="lg" p="6" boxShadow="md" bg="gray.50">
                    <Heading as="h3" size="lg" mb="4">Order Summary</Heading>
                    <Flex justify="space-between" mb="2">
                        <Text fontWeight="bold">Total Items:</Text>
                        <Text>{cartItems.reduce((acc, item) => acc + item.qty, 0)}</Text>
                    </Flex>
                    <Flex justify="space-between" mb="4">
                        <Text fontWeight="bold">Subtotal:</Text>
                        <Text fontSize="xl" fontWeight="bold">${getTotalPrice().toFixed(2)}</Text>
                    </Flex>
                    <Divider mb="4" />
                    <Button colorScheme="teal" size="lg" width="full" onClick={handleCheckout}>
                        Proceed to Checkout ({cartItems.reduce((acc, item) => acc + item.qty, 0)} items)
                    </Button>
                    <Button colorScheme="red" variant="outline" size="md" width="full" mt="2" onClick={clearCart}>
                        Clear Cart
                    </Button>
                </Box>
            </SimpleGrid>
        </Box>
    );
}

export default CartPage;