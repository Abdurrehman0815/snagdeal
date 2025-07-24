import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Box, Flex, Text, Button, Spacer, HStack, IconButton, Icon, Avatar } from '@chakra-ui/react';
import { MdShoppingCart, MdListAlt, MdPerson } from 'react-icons/md';
import { useAuthStore } from './store/authStore';
import { useCartStore } from './store/cartStore';

// Import all your page components
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterUserPage from './pages/Auth/RegisterUserPage';
import RegisterShopOwnerPage from './pages/Auth/RegisterShopOwnerPage';
import ShopDashboardPage from './pages/ShopOwner/ShopDashboardPage';
import AddProductPage from './pages/ShopOwner/AddProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import UserOrdersPage from './pages/UserOrdersPage';
import ShopOrdersPage from './pages/ShopOwner/ShopOrdersPage';
import UserProfilePage from './pages/UserProfilePage';

import ProtectedRoute from './components/ProtectedRoute';


const NotFoundPage = () => <div>404 Not Found</div>;

function App() {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const totalCartItems = useCartStore((state) => state.getTotalItems());

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            {/* Navbar: Changed background to gray.900 (dark/black) and default text color to white */}
            <Flex as="nav" bg="gray.900" p="4" color="white" align="center">
                <Link to="/">
                    <Text fontSize="xl" fontWeight="bold" color="white">E-Commerce App</Text>
                </Link>
                <Spacer />
                <Box>
                    {user ? (
                        <HStack spacing="4">
                            {/* Profile Avatar/Link */}
                            <Link to="/profile">
                                <Avatar size="sm" name={user.name} src={user.profilePicture} />
                            </Link>
                            <Text as="span" color="white">Hello, {user.name} ({user.role})</Text>

                            {user.role === 'shopOwner' && (
                                <HStack spacing="4">
                                    <Link to="/shop/dashboard">
                                        <Button colorScheme="teal" variant="ghost" color="white" _hover={{ bg: 'gray.700' }}>My Shop</Button>
                                    </Link>
                                    <Link to="/shop/orders">
                                        <Button colorScheme="blue" variant="ghost" color="white" _hover={{ bg: 'gray.700' }}>Manage Orders</Button>
                                    </Link>
                                </HStack>
                            )}
                            {user.role === 'user' && (
                                <>
                                    <Link to="/cart">
                                        <IconButton
                                            aria-label="Shopping Cart"
                                            icon={<Icon as={MdShoppingCart} w={6} h={6} />}
                                            variant="ghost"
                                            color="white"
                                            _hover={{ bg: 'gray.700' }}
                                        />
                                        {totalCartItems > 0 && (
                                            <Box
                                                as="span"
                                                position="relative"
                                                top="-1.5em"
                                                right="1.5em"
                                                bg="red.500"
                                                borderRadius="full"
                                                px="0.4em"
                                                fontSize="0.7em"
                                                color="white"
                                                fontWeight="bold"
                                            >
                                                {totalCartItems}
                                            </Box>
                                        )}
                                    </Link>
                                    <Link to="/myorders">
                                        <IconButton
                                            aria-label="My Orders"
                                            icon={<Icon as={MdListAlt} w={6} h={6} />}
                                            variant="ghost"
                                            color="white"
                                            _hover={{ bg: 'gray.700' }}
                                        />
                                    </Link>
                                </>
                            )}
                            <Button colorScheme="teal" variant="ghost" color="white" onClick={handleLogout} _hover={{ bg: 'gray.700' }}>
                                Logout
                            </Button>
                        </HStack>
                    ) : (
                        <HStack spacing="4">
                            <Link to="/login">
                                <Button colorScheme="teal" variant="ghost" color="white" _hover={{ bg: 'gray.700' }}>Login</Button>
                            </Link>
                            <Link to="/register/user">
                                <Button colorScheme="teal" variant="ghost" color="white" _hover={{ bg: 'gray.700' }}>Register User</Button>
                            </Link>
                            <Link to="/register/shop-owner">
                                <Button colorScheme="teal" variant="ghost" color="white" _hover={{ bg: 'gray.700' }}>Register Shop Owner</Button>
                            </Link>
                        </HStack>
                    )}
                </Box>
            </Flex>

            <Box p="4">
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/product/:id" element={<ProductDetailPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register/user" element={<RegisterUserPage />} />
                    <Route path="/register/shop-owner" element={<RegisterShopOwnerPage />} />
                    <Route path="*" element={<NotFoundPage />} />

                    {/* PROTECTED ROUTES */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/profile" element={<UserProfilePage />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/checkout" element={<CheckoutPage />} />
                    </Route>

                    <Route element={<ProtectedRoute role="user" />}>
                        <Route path="/myorders" element={<UserOrdersPage />} />
                    </Route>

                    <Route element={<ProtectedRoute role="shopOwner" />}>
                        <Route path="/shop/dashboard" element={<ShopDashboardPage />} />
                        <Route path="/shop/add-product" element={<AddProductPage />} />
                        <Route path="/shop/edit-product/:id" element={<AddProductPage />} />
                        <Route path="/shop/orders" element={<ShopOrdersPage />} />
                    </Route>

                </Routes>
            </Box>
        </>
    );
}

export default App;